import { describe, expect, it } from 'vitest'
import {
  agregerCO2Biogenique,
  agregerParScope,
  agregerScope2Dual,
  calculerEmission,
  computeYearSnapshot,
} from './calculEngine'
import { getAllFactors, getFactorById } from '../data/emissionFactors'
import { getSelectableFactorsForLine, splitArchivedFactors } from './factorFiltering'
import { collectFactorWarnings, formatFactorNotice } from './factorWarnings'

const factor = {
  id: 'test',
  nom: 'Facteur de test',
  unite: 'kWh',
  valeur: 2,
  amont: 0.5,
  co2b: 0.25,
}

function line(overrides = {}) {
  const facteur = overrides.factor || factor
  const resultat = calculerEmission(overrides.valeur ?? 10, facteur.id, [facteur])
  return {
    scope: 1,
    posteId: 'test',
    categorie_ghg: 'Scope 1 — Test',
    resultat,
    ...overrides,
  }
}

function s2Line(qty, facteurId, overrides = {}) {
  const resultat = calculerEmission(qty, facteurId)
  return {
    scope: 2,
    categorie_ghg: 'Scope 2 — Électricité achetée',
    resultat,
    ...overrides,
  }
}

describe('calculEngine', () => {
  it('calcule séparément combustion, amont, biogénique et total', () => {
    const result = calculerEmission(10, 'test', [factor])

    expect(result.emission_t).toBe(0.02)
    expect(result.amont_t).toBe(0.005)
    expect(result.co2b_t).toBe(0.003)
    expect(result.total_t).toBe(0.025)
  })

  it('refuse une donnée invalide', () => {
    expect(calculerEmission(-1, 'test', [factor])).toBeNull()
    expect(calculerEmission('abc', 'test', [factor])).toBeNull()
  })

  it('accepte une quantité et un facteur de valeur nulle', () => {
    const zeroFactor = {
      id: 'facteur-zero',
      nom: 'Facteur nul',
      unite: 'kg',
      valeur: 0,
      amont: 0,
      co2b: 0,
    }
    const result = calculerEmission(0, zeroFactor.id, [zeroFactor])

    expect(result).toMatchObject({
      emission_t: 0,
      amont_t: 0,
      co2b_t: 0,
      total_t: 0,
      unite: 'kg',
      feManquant: false,
    })
  })

  it('conserve le snapshot complet lorsqu’un facteur a été retiré', () => {
    const snapshot = {
      id: 'fe-retire',
      nom: 'Carburant historique',
      unite: 'L',
      valeur: 2.67,
      amont: 0.5,
      co2b: 0.1,
      source: 'Source historique',
      incertitude: 5,
      perimetre: 'combustion',
      categorie_bc: 'Sources mobiles',
      categorie_ghg: 'Scope 1',
    }
    const result = calculerEmission(1000, snapshot.id, [], { fe_utilise: snapshot })

    expect(result).toMatchObject({
      emission_t: 2.67,
      amont_t: 0.5,
      co2b_t: 0.1,
      total_t: 3.17,
      unite: 'L',
      facteurId: 'fe-retire',
      feManquant: true,
    })
    expect(result.fe_utilise).toEqual(snapshot)
  })

  it('ne calcule pas avec un facteur absent et un snapshot insuffisant', () => {
    expect(calculerEmission(100, 'fe-inconnu', [])).toBeNull()
    expect(calculerEmission(100, 'fe-inconnu', [], {
      fe_utilise: { id: 'fe-inconnu', unite: 'L', nom: 'Sans valeur' },
    })).toBeNull()
  })

  it('calcule encore un facteur custom archivé', () => {
    const archivedFactor = { ...factor, id: 'test-archive', archived: true }
    const result = calculerEmission(10, archivedFactor.id, [archivedFactor])

    expect(result).toMatchObject({
      emission_t: 0.02,
      amont_t: 0.005,
      co2b_t: 0.003,
      total_t: 0.025,
      feManquant: false,
    })
  })

  it('reporte les émissions amont dans le scope 3', () => {
    const result = agregerParScope([
      line({ scope: 1 }),
      line({ scope: 3, posteId: 'achats' }),
    ])

    expect(result.scope1).toBe(0.02)
    expect(result.scope3).toBe(0.03)
    expect(result.scope33Amont).toBe(0.01)
    expect(result.total).toBe(0.05)
  })

  it('agrège le CO₂ biogénique hors total GES', () => {
    const result = agregerCO2Biogenique([line(), line({ valeur: 20 })])
    expect(result.total).toBe(0.008)
    expect(result.details).toHaveLength(2)
  })

  it('construit un snapshot annuel exploitable par Évolution', () => {
    const result = computeYearSnapshot(
      { id: 'projet-2025', annee: '2025', effectif: 12, ca: 250 },
      [line({ scope: 1 })],
    )

    expect(result).toMatchObject({
      annee: '2025',
      projetId: 'projet-2025',
      total: 0.025,
      effectif: 12,
      ca: 250,
    })
  })
})

describe('agregerScope2Dual', () => {
  it('applique le mix résiduel pour une ligne France location', () => {
    const lignes = [s2Line(10000, 'elec_france_kwh')]
    const result = agregerScope2Dual(lignes)
    const detail = result.details[0]

    expect(detail.lb_t).toBeCloseTo(0.569, 2)
    expect(detail.mb_t).toBeCloseTo(1.3005, 2)
    expect(detail.mbSource).toBe('residuel')
  })

  it('sépare contrat et mix France pour une ligne GO market', () => {
    const lignes = [s2Line(10000, 'elec_renouv_kwh')]
    const detail = agregerScope2Dual(lignes).details[0]

    expect(detail.mb_t).toBeCloseTo(0.12, 2)
    expect(detail.lb_t).toBeCloseTo(0.569, 2)
    expect(detail.mbSource).toBe('contrat')
  })

  it('utilise le proxy MB pour l\'électricité hors France', () => {
    const lignes = [s2Line(10000, 'elec_allemagne_kwh')]
    const detail = agregerScope2Dual(lignes).details[0]

    expect(detail.mb_t).toBe(detail.lb_t)
    expect(detail.mbSource).toBe('proxy')
  })

  it('traite le fallback monétaire en proxy', () => {
    const lignes = [s2Line(1000, 'electricite_eur')]
    const detail = agregerScope2Dual(lignes).details[0]

    expect(detail.mb_t).toBe(detail.lb_t)
    expect(detail.mb_t).toBeCloseTo(0.31, 2)
  })

  it('classe les réseaux dans autres, pas electricite', () => {
    const lignes = [{
      scope: 2,
      categorie_ghg: 'Scope 2 — Réseaux chaleur/froid',
      resultat: calculerEmission(1000, 'chaleur_reseau_kwh'),
    }]
    const result = agregerScope2Dual(lignes)

    expect(result.electricite.count).toBe(0)
    expect(result.autres.count).toBe(1)
    expect(result.details[0].mb_t).toBe(result.details[0].lb_t)
  })

  it('traite un FE custom sans scope2method comme location proxy', () => {
    const customFe = { id: 'inconnu', nom: 'Custom', unite: 'kWh', valeur: 0.1 }
    const lignes = [{
      scope: 2,
      categorie_ghg: 'Scope 2 — Électricité achetée',
      resultat: calculerEmission(100, 'inconnu', [customFe]),
    }]
    const detail = agregerScope2Dual(lignes).details[0]

    expect(detail.mb_t).toBe(detail.lb_t)
    expect(detail.mbSource).toBe('proxy')
  })

  it('re-résout un snapshot périmé par id', () => {
    const staleFe = {
      ...getFactorById('elec_fournisseur_vert_kwh'),
      valeur: 0.0569,
      lbFactorId: undefined,
    }
    const lignes = [{
      scope: 2,
      categorie_ghg: 'Scope 2 — Électricité achetée',
      resultat: {
        ...calculerEmission(10000, 'elec_fournisseur_vert_kwh'),
        fe_utilise: staleFe,
      },
    }]
    const detail = agregerScope2Dual(lignes).details[0]

    expect(detail.lb_t).toBeCloseTo(0.569, 2)
    expect(detail.mb_t).toBeCloseTo(1.3005, 2)
    expect(detail.mbSource).toBe('contrat')
  })

  it('agrège correctement un mix de lignes', () => {
    const lignes = [
      s2Line(10000, 'elec_france_kwh'),
      s2Line(10000, 'elec_renouv_kwh'),
    ]
    const result = agregerScope2Dual(lignes)

    expect(result.count).toBe(2)
    expect(result.countContrats).toBe(1)
    expect(result.countResiduel).toBe(1)
    expect(result.locationBased).toBeCloseTo(result.electricite.lb + result.autres.lb, 2)
    expect(result.marketBased).toBeCloseTo(result.electricite.mb + result.autres.mb, 2)
  })

  it('ignore les lignes hors scope 2 ou sans résultat', () => {
    const result = agregerScope2Dual([
      line({ scope: 1 }),
      { scope: 2, resultat: null },
      s2Line(1000, 'elec_france_kwh'),
    ])

    expect(result.count).toBe(1)
  })

  it('valide les FE résiduel et cross-références', () => {
    const residuel = getFactorById('elec_residuel_france_kwh')
    const vert = getFactorById('elec_fournisseur_vert_kwh')

    expect(residuel.valeur).toBe(0.13005)
    expect(residuel.nonSelectable).toBe(true)
    expect(vert.valeur).toBe(0.13005)

    getAllFactors().forEach(fe => {
      if (fe.lbFactorId) expect(getFactorById(fe.lbFactorId)).toBeTruthy()
      if (fe.mbFallbackId) expect(getFactorById(fe.mbFallbackId)).toBeTruthy()
    })
  })
})

describe('archivage et avertissements de facteurs', () => {
  it('filtre les archives et les réintroduit pour la ligne qui les référence', () => {
    const catalogFactors = [
      { id: 'catalogue-archive', nom: 'Catalogue archive', unite: 'kg', valeur: 1 },
      { id: 'catalogue-actif', nom: 'Catalogue actif', unite: 'kg', valeur: 2 },
    ]
    const customFactors = [
      { id: 'custom-archive', nom: 'Custom archive', unite: 'kg', valeur: 3, archived: true },
      { id: 'custom-actif', nom: 'Custom actif', unite: 'kg', valeur: 4, archived: false },
    ]

    expect(splitArchivedFactors(catalogFactors, ['catalogue-archive']).active.map(f => f.id))
      .toEqual(['catalogue-actif'])
    expect(splitArchivedFactors(customFactors, [], true).archived.map(f => f.id))
      .toEqual(['custom-archive'])

    const archivedCatalogLine = getSelectableFactorsForLine({
      catalogFactors,
      customFactors,
      archivedCatalogIds: ['catalogue-archive'],
      facteurId: 'catalogue-archive',
    })
    expect(archivedCatalogLine.catalogFactors.map(f => f.id))
      .toEqual(['catalogue-actif', 'catalogue-archive'])
    expect(archivedCatalogLine.currentIsArchived).toBe(true)

    const archivedCustomLine = getSelectableFactorsForLine({
      catalogFactors,
      customFactors,
      archivedCatalogIds: ['catalogue-archive'],
      facteurId: 'custom-archive',
    })
    expect(archivedCustomLine.customFactors.map(f => f.id))
      .toEqual(['custom-actif', 'custom-archive'])
    expect(archivedCustomLine.currentIsArchived).toBe(true)
  })

  it('conserve le total après changement de version et signale le FE retiré', () => {
    const snapshot = {
      id: 'fe-version-precedente',
      nom: 'FE retiré de la version courante',
      unite: 'L',
      valeur: 2.67,
      amont: 0.5,
      co2b: 0.1,
      source: 'Source historique',
      incertitude: 5,
    }
    const previousResult = calculerEmission(1000, snapshot.id, [snapshot])
    const fallbackResult = calculerEmission(1000, snapshot.id, [], { fe_utilise: snapshot })
    const previousLine = {
      _key: 'line-version',
      posteId: 'combustion_mobile',
      scope: 1,
      facteurId: snapshot.id,
      resultat: previousResult,
    }
    const fallbackLine = {
      ...previousLine,
      resultat: fallbackResult,
    }

    expect(agregerParScope([fallbackLine]).total).toBe(agregerParScope([previousLine]).total)
    expect(fallbackResult.total_t).toBe(3.17)
    expect(fallbackResult.amont_t).toBe(0.5)
    expect(fallbackResult.co2b_t).toBe(0.1)

    const warnings = collectFactorWarnings([fallbackLine], [])
    expect(warnings).toMatchObject([{
      facteurId: snapshot.id,
      facteurNom: snapshot.nom,
      status: 'snapshot',
    }])
    expect(formatFactorNotice({
      version: 'ademe-base-empreinte-23.6',
      previousTotal: previousResult.total_t,
      nextTotal: fallbackResult.total_t,
      warnings,
    })).toContain('FE retiré de la version courante')
  })
})
