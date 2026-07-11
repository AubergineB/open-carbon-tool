import { describe, expect, it } from 'vitest'
import {
  agregerCO2Biogenique,
  agregerParScope,
  agregerScope2LBMB,
  calculerEmission,
  computeYearSnapshot,
} from './calculEngine'

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

  it('sépare Location-Based et Market-Based pour le scope 2', () => {
    const location = line({ scope: 2 })
    const market = line({
      scope: 2,
      resultat: { ...line({ scope: 2 }).resultat, fe_utilise: { ...factor, scope2method: 'market' } },
    })

    expect(agregerScope2LBMB([location, market])).toEqual({
      locationBased: 0.02,
      marketBased: 0.02,
      total: 0.04,
    })
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
