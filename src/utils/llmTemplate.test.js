import { describe, expect, it } from 'vitest'
import {
  appendAcceptedLlmLines,
  buildAcceptedLlmLines,
  buildLlmTemplate,
  parseLlmFile,
  validateLlmFile,
  validateLlmProposition,
} from './llmTemplate'
import { getFactorsByCategory } from '../data/emissionFactors'

const project = {
  nom: 'Projet de test',
  annee: '2025',
  secteur: 'tertiaire',
  sites: ['Site principal'],
}

const sectionsStatus = {
  combustion_fixe: 'active',
  electricite: 'confirmed',
  achats: 'dismissed',
  dechets: 'non_material',
}

function context(overrides = {}) {
  return {
    projet: project,
    sectionsStatus,
    facteursCustom: [],
    archivedCatalogIds: [],
    ...overrides,
  }
}

function validProposal(overrides = {}) {
  return {
    posteId: 'combustion_fixe',
    facteurId: 'gaz_nat_kwh',
    valeur: 85000,
    unite: 'kWh PCI',
    precision: 'P2',
    source: 'Facture fournisseur',
    commentaire: 'Relevé annuel vérifié.',
    annee: '2025',
    ...overrides,
  }
}

describe('llmTemplate', () => {
  it('construit un gabarit auto-documenté avec des IDs du catalogue', () => {
    const template = buildLlmTemplate({
      projet: project,
      sectionsStatus,
      facteursCustom: [],
      currentView: 'espace-travail',
    })

    expect(Object.keys(template)[0]).toBe('_instructions')
    expect(template).toMatchObject({
      format: 'ocllm',
      schemaVersion: 1,
      app: 'open-carbon-tool',
      factorsVersion: expect.any(String),
      propositions: [],
    })
    expect(template.postesActifs.map(poste => poste.posteId)).toEqual(
      expect.arrayContaining(['combustion_fixe', 'electricite']),
    )
    expect(template.postesActifs.map(poste => poste.posteId)).not.toEqual(
      expect.arrayContaining(['achats', 'dechets']),
    )
    const combustion = template.postesActifs.find(poste => poste.posteId === 'combustion_fixe')
    expect(combustion.facteurIds).toContain('gaz_nat_kwh')
    expect(combustion.facteurs.find(facteur => facteur.facteurId === 'gaz_nat_kwh')).toMatchObject({
      unite: 'kWh PCI',
      source: expect.any(String),
    })
    expect(template.exemples[0]).toMatchObject({
      posteId: combustion.posteId,
      facteurId: combustion.facteurIds[0],
      description: expect.stringContaining('exemple uniquement'),
    })
  })

  it('inclut un facteur personnalisé actif sans exposer un facteur archivé comme sélectionnable', () => {
    const custom = {
      id: 'custom-gaz-test',
      nom: 'Gaz fournisseur test',
      unite: 'kWh PCI',
      valeur: 0.2,
      categorieFE: 'combustion_fixe',
      source: 'Justificatif fournisseur',
      archived: false,
      custom: true,
    }
    const archived = { ...custom, id: 'custom-gaz-archive', archived: true }
    const template = buildLlmTemplate({
      projet: project,
      sectionsStatus,
      facteursCustom: [custom, archived],
      currentView: 'collecte-energie',
    })
    const combustion = template.postesActifs.find(poste => poste.posteId === 'combustion_fixe')

    expect(combustion.facteurIds).toContain('custom-gaz-test')
    expect(combustion.facteurIds).not.toContain('custom-gaz-archive')
    expect(combustion.facteursArchives.map(facteur => facteur.facteurId)).toContain('custom-gaz-archive')
    expect(template.facteursCustom.map(facteur => facteur.facteurId)).toContain('custom-gaz-test')
  })

  it('rejette une enveloppe JSON invalide ou inattendue', () => {
    expect(() => parseLlmFile('{')).toThrow(/JSON invalide/)
    expect(() => parseLlmFile({ format: 'ocbilan', schemaVersion: 1, propositions: [] })).toThrow(/OCLLM/)
    expect(() => parseLlmFile({
      format: 'ocllm',
      schemaVersion: 1,
      app: 'open-carbon-tool',
      factorsVersion: 'test',
      propositions: {},
    })).toThrow(/propositions/)
  })

  it('valide une proposition correcte et applique P1 par défaut', () => {
    const result = validateLlmProposition(
      validProposal({ precision: undefined }),
      context(),
    )
    expect(result.erreurs).toEqual([])
    expect(result.propositionNormalisee.precision).toBe('P1')
    expect(result.facteur).toMatchObject({ id: 'gaz_nat_kwh', unite: 'kWh PCI' })
  })

  it('rejette un facteur inconnu, y compris une variante sans accent', () => {
    const unknown = validateLlmProposition(
      validProposal({ facteurId: 'gaz_naturel_kwh' }),
      context(),
    )
    const unknownPoste = validateLlmProposition(
      validProposal({ posteId: 'poste-inconnu' }),
      context(),
    )
    const accent = validateLlmProposition(
      {
        ...validProposal({ posteId: 'dechets', facteurId: 'dechets_dib_incin', unite: 't' }),
      },
      context({ sectionsStatus: { dechets: 'active' } }),
    )
    expect(unknown.erreurs.join(' ')).toMatch(/Facteur inconnu/)
    expect(unknownPoste.erreurs.join(' ')).toMatch(/Poste inconnu/)
    expect(accent.erreurs.join(' ')).toMatch(/Facteur inconnu/)
  })

  it('rejette une unité incohérente, une valeur texte, une valeur négative et Infinity', () => {
    const wrongUnit = validateLlmProposition(validProposal({ unite: 'kWh PCS' }), context())
    const textValue = validateLlmProposition(validProposal({ valeur: '85000' }), context())
    const negative = validateLlmProposition(validProposal({ valeur: -1 }), context())
    const nan = validateLlmProposition(validProposal({ valeur: NaN }), context())
    const infinite = validateLlmProposition(validProposal({ valeur: Infinity }), context())

    expect(wrongUnit.erreurs.join(' ')).toMatch(/Unité incohérente/)
    expect(textValue.erreurs.join(' ')).toMatch(/nombre JSON fini/)
    expect(negative.erreurs.join(' ')).toMatch(/négative/)
    expect(nan.erreurs.join(' ')).toMatch(/nombre JSON fini/)
    expect(infinite.erreurs.join(' ')).toMatch(/nombre JSON fini/)
  })

  it('refuse un poste inactif et un facteur archivé', () => {
    const inactive = validateLlmProposition(
      validProposal({ posteId: 'achats', facteurId: 'achats_telecom', valeur: 1000, unite: 'euro HT' }),
      context(),
    )
    const archived = validateLlmProposition(
      validProposal(),
      context({ archivedCatalogIds: ['gaz_nat_kwh'] }),
    )

    expect(inactive.erreurs.join(' ')).toMatch(/pas actif/)
    expect(archived.erreurs.join(' ')).toMatch(/archivé/)
  })

  it('produit un avertissement de plausibilité sans fabriquer de proxy', () => {
    const result = validateLlmProposition(validProposal({ valeur: 1_000_000_000 }), context())

    expect(result.erreurs).toEqual([])
    expect(result.avertissements.join(' ')).toMatch(/ordre de grandeur/)
    expect(result.facteur.valeur).toBe(getFactorsByCategory('combustion_fixe').find(f => f.id === 'gaz_nat_kwh').valeur)
  })

  it('contrôle la cohérence de l’année et conserve les précisions explicites', () => {
    const wrongYear = validateLlmProposition(validProposal({ annee: '2024' }), context())
    const p0 = validateLlmProposition(validProposal({ precision: 'P0' }), context())
    const p3 = validateLlmProposition(validProposal({ precision: 'P3' }), context())

    expect(wrongYear.erreurs.join(' ')).toMatch(/ne correspond pas/)
    expect(p0.propositionNormalisee.precision).toBe('P0')
    expect(p3.propositionNormalisee.precision).toBe('P3')
  })

  it('n’insère aucune ligne avant acceptation et ajoute uniquement les lignes acceptées', () => {
    const data = buildLlmTemplate({ projet: project, sectionsStatus, currentView: 'collecte-energie' })
    data.propositions = [
      validProposal(),
      validProposal({ valeur: -4 }),
    ]
    const validation = validateLlmFile(data, context({ allowedPosteIds: ['combustion_fixe'] }))
    const existing = [{ _key: 'existing', posteId: 'electricite' }]

    const before = [...existing]
    const undecided = appendAcceptedLlmLines(existing, validation.reviews, context(), {
      sourceFileName: 'retour.json',
      sourceData: data,
    })
    expect(undecided.lignes).toEqual(before)
    expect(undecided.lignes).toHaveLength(1)

    const decidedReviews = validation.reviews.map((review, index) => ({
      ...review,
      statut: index === 0 ? 'accepte' : 'rejete',
    }))
    const inserted = buildAcceptedLlmLines({
      reviews: decidedReviews,
      context: context({ allowedPosteIds: ['combustion_fixe'] }),
      sourceFileName: 'retour.json',
      sourceData: data,
    })
    expect(inserted.erreurs).toEqual([])
    expect(inserted.lignes).toHaveLength(1)
    expect(inserted.lignes[0]).toMatchObject({
      source: 'llm-assiste',
      precision: 'P2',
      facteurId: 'gaz_nat_kwh',
      resultat: { facteurId: 'gaz_nat_kwh', total_t: expect.any(Number) },
      provenance: {
        mode: 'llm-assiste',
        sourceFile: { nom: 'retour.json' },
      },
    })
  })
})
