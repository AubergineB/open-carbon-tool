import { describe, expect, it } from 'vitest'
import {
  agregerCO2Biogenique,
  agregerParScope,
  agregerScope2Dual,
  calculerEmission,
  computeYearSnapshot,
} from './calculEngine'
import { getAllFactors, getFactorById } from '../data/emissionFactors'

const factor = {
  nom: 'Facteur de test',
  unite: 'kWh',
  valeur: 2,
  amont: 0.5,
  co2b: 0.25,
}

function line(overrides = {}) {
  const resultat = calculerEmission(overrides.valeur || 10, 'test', overrides.factor || factor)
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
    const result = calculerEmission(10, 'test', factor)

    expect(result.emission_t).toBe(0.02)
    expect(result.amont_t).toBe(0.005)
    expect(result.co2b_t).toBe(0.003)
    expect(result.total_t).toBe(0.025)
  })

  it('refuse une donnée invalide', () => {
    expect(calculerEmission(-1, 'test', factor)).toBeNull()
    expect(calculerEmission('abc', 'test', factor)).toBeNull()
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
    const customFe = { nom: 'Custom', unite: 'kWh', valeur: 0.1 }
    const lignes = [{
      scope: 2,
      categorie_ghg: 'Scope 2 — Électricité achetée',
      resultat: calculerEmission(100, 'inconnu', customFe),
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
