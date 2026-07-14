import { describe, it, expect } from 'vitest'
import {
  APP_ID,
  CURRENT_SCHEMA_VERSION,
  FACTORS_VERSION,
  migrateProjetFile,
  normalizeFacteursCustomState,
} from './store'

describe('migrateProjetFile', () => {
  it('normalise un fichier complet en conservant les données', () => {
    const raw = {
      schemaVersion: 1,
      app: APP_ID,
      id: 'abc',
      createdAt: '2025-01-01T00:00:00.000Z',
      projet: { nom: 'Acme', effectif: '28', ca: 3500, annee: 2025 },
      lignes: [{ _key: 'l1', posteId: 'electricite', scope: 2, facteurId: 'elec_france_kwh', valeur: '120000' }],
      sectionsStatus: { electricite: 'confirmed' },
    }
    const data = migrateProjetFile(raw)

    expect(data.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(data.id).toBe('abc')
    expect(data.projet.nom).toBe('Acme')
    expect(data.projet.effectif).toBe(28)
    expect(data.projet.annee).toBe('2025')
    expect(data.lignes).toHaveLength(1)
    expect(data.lignes[0].valeur).toBe(120000)
    expect(data.sectionsStatus.electricite).toBe('confirmed')
    expect(data.factorsVersion).toBe(FACTORS_VERSION)
  })

  it('applique les valeurs par défaut sur un fichier minimal', () => {
    const data = migrateProjetFile({})

    expect(data.projet.perimetre).toBe('controle_operationnel')
    expect(data.projet.sites).toEqual([])
    expect(data.lignes).toEqual([])
    expect(data.sectionsStatus).toEqual({})
    expect(typeof data.id).toBe('string')
    expect(data.createdAt).toBeTruthy()
  })

  it('accepte les anciens noms de champs des lignes', () => {
    const data = migrateProjetFile({
      lignes: [{ id: 'l1', poste_id: 'achats', facteur_id: 'achats_telecom', categorieBc: 'Achats', valeur: 'pas-un-nombre' }],
    })
    const ligne = data.lignes[0]

    expect(ligne._key).toBe('l1')
    expect(ligne.posteId).toBe('achats')
    expect(ligne.facteurId).toBe('achats_telecom')
    expect(ligne.categorie_bc).toBe('Achats')
    expect(ligne.valeur).toBe(0)
    expect(ligne.scope).toBe(3)
  })

  it('accepte l\'ancien identifiant d\'app bilan-carbone-pme', () => {
    expect(() => migrateProjetFile({ app: 'bilan-carbone-pme' })).not.toThrow()
  })

  it('rejette un fichier d\'une autre application', () => {
    expect(() => migrateProjetFile({ app: 'autre-outil' }))
      .toThrow('Ce fichier ne provient pas d’Open Carbon Tool.')
  })

  it('rejette une version de schéma trop récente', () => {
    let error
    try {
      migrateProjetFile({ schemaVersion: CURRENT_SCHEMA_VERSION + 1 })
    } catch (e) {
      error = e
    }
    expect(error).toBeDefined()
    expect(error.code).toBe('UNSUPPORTED_SCHEMA')
  })
})

describe('normalizeFacteursCustomState', () => {
  it('accepte l\'ancien format tableau nu', () => {
    const state = normalizeFacteursCustomState([{ id: 'fe1', nom: 'Custom' }])

    expect(state.facteurs).toHaveLength(1)
    expect(state.facteurs[0].archived).toBe(false)
    expect(state.archivedCatalogIds).toEqual([])
  })

  it('conserve les archivages et déduplique les ids catalogue', () => {
    const state = normalizeFacteursCustomState({
      facteurs: [{ id: 'fe1', archived: true }, { id: 'fe2' }],
      archivedCatalogIds: ['gaz_nat_kwh', 'gaz_nat_kwh', '', 42],
    })

    expect(state.facteurs[0].archived).toBe(true)
    expect(state.facteurs[1].archived).toBe(false)
    expect(state.archivedCatalogIds).toEqual(['gaz_nat_kwh'])
  })

  it('rejette un contenu sans tableau facteurs', () => {
    expect(() => normalizeFacteursCustomState({ facteurs: 'oops' }))
      .toThrow('doit contenir un tableau "facteurs"')
  })

  it('rejette un facteur sans identifiant', () => {
    expect(() => normalizeFacteursCustomState({ facteurs: [{ nom: 'Sans id' }] }))
      .toThrow('position 1')
  })
})
