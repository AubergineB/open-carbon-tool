import { describe, expect, it } from 'vitest'
import { convertirMasseVolume, convertirPcsPci, estimerTkmDepuisEuros } from './conversions'
import { getFactorById, getFactorsByCategory } from '../data/emissionFactors'

describe('convertirMasseVolume', () => {
  it('convertit 1000 L de gazole en kg via la masse volumique', () => {
    const res = convertirMasseVolume({ carburantId: 'gazole_b7', valeur: 1000, depuis: 'L' })
    expect(res.resultat).toBeCloseTo(845, 6)
    expect(res.unite).toBe('kg')
  })

  it('reste stable sur un aller-retour kg -> L -> kg', () => {
    const versL = convertirMasseVolume({ carburantId: 'gazole_b7', valeur: 845, depuis: 'kg' })
    const versKg = convertirMasseVolume({ carburantId: 'gazole_b7', valeur: versL.resultat, depuis: 'L' })
    expect(versKg.resultat).toBeCloseTo(845, 6)
  })

  it('retourne null pour un carburant inconnu', () => {
    expect(convertirMasseVolume({ carburantId: 'inconnu', valeur: 100, depuis: 'L' })).toBeNull()
  })

  it('retourne null pour une valeur négative', () => {
    expect(convertirMasseVolume({ carburantId: 'gazole_b7', valeur: -10, depuis: 'L' })).toBeNull()
  })
})

describe('convertirPcsPci', () => {
  it('convertit 1000 kWh PCS gaz naturel en ≈900.9 kWh PCI', () => {
    const res = convertirPcsPci({ energieId: 'gaz_naturel', valeur: 1000, depuis: 'PCS' })
    expect(res.resultat).toBeCloseTo(900.9009, 3)
  })

  it('redonne 1000 en repartant du PCI', () => {
    const versPci = convertirPcsPci({ energieId: 'gaz_naturel', valeur: 1000, depuis: 'PCS' })
    const versPcs = convertirPcsPci({ energieId: 'gaz_naturel', valeur: versPci.resultat, depuis: 'PCI' })
    expect(versPcs.resultat).toBeCloseTo(1000, 6)
  })

  it('applique le ratio dans le bon sens : PCI < PCS toujours', () => {
    const res = convertirPcsPci({ energieId: 'gaz_naturel', valeur: 1000, depuis: 'PCS' })
    expect(res.resultat).toBeLessThan(1000)
  })
})

describe('estimerTkmDepuisEuros', () => {
  it('estime les t.km pour 10 000 € HT en fret routier moyenne France en lisant les FE', () => {
    const feMonetaire = getFactorById('fret_eur')
    const feMode = getFactorsByCategory('fret').find(f => f.id === 'fret_routier_moy_tkm')

    const res = estimerTkmDepuisEuros({ montantEur: 10000, modeFacteurId: 'fret_routier_moy_tkm' })

    const emissionsAttendues = 10000 * feMonetaire.valeur
    expect(res.emissions_t).toBeCloseTo(emissionsAttendues / 1000, 6)
    expect(res.tkm).toBeCloseTo(emissionsAttendues / feMode.valeur, 6)
    expect(res.tkm).toBeGreaterThan(10000)
    expect(res.tkm).toBeLessThan(100000)
  })

  it('retourne null quand le mode a un FE nul (coursier vélo)', () => {
    expect(estimerTkmDepuisEuros({ montantEur: 1000, modeFacteurId: 'fret_coursier_velo_km' })).toBeNull()
  })

  it('retourne null pour une entrée invalide', () => {
    expect(estimerTkmDepuisEuros({ montantEur: -100, modeFacteurId: 'fret_routier_moy_tkm' })).toBeNull()
  })
})
