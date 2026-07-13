import { describe, expect, it } from 'vitest'
import { convertirMasseVolume, convertirPcsPci, estimerTkmDepuisEuros, convertirEnergie, convertirDechetsVolume } from './conversions'
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

describe('convertirEnergie', () => {
  it('convertit 1 kWh en 3.6 MJ', () => {
    expect(convertirEnergie(1, 'kwh', 'mj')).toBeCloseTo(3.6, 6)
  })

  it('convertit 1 tep en 11630 kWh', () => {
    expect(convertirEnergie(1, 'tep', 'kwh')).toBeCloseTo(11630, 6)
  })

  it('convertit 1000 kWh en tep', () => {
    expect(convertirEnergie(1000, 'kwh', 'tep')).toBeCloseTo(0.08598, 4)
  })

  it('reste stable sur un aller-retour', () => {
    const x = 42.5
    const converted = convertirEnergie(convertirEnergie(x, 'mj', 'gj'), 'gj', 'mj')
    expect(converted).toBeCloseTo(x, 6)
  })

  it('retourne null pour une unité inconnue ou une valeur non finie', () => {
    expect(convertirEnergie(1, 'inconnu', 'kwh')).toBeNull()
    expect(convertirEnergie(NaN, 'kwh', 'mj')).toBeNull()
  })
})

describe('convertirDechetsVolume', () => {
  it('convertit 10 m³ de cartons en vrac en 0.8 t', () => {
    const resultat = convertirDechetsVolume(10, 'carton_vrac')
    expect(resultat.resultat).toBeCloseTo(0.8, 6)
    expect(resultat.source).toContain('ADEME')
  })

  it('retourne null pour un type inconnu', () => {
    expect(convertirDechetsVolume(10, 'inconnu')).toBeNull()
  })

  it('retourne null pour un volume négatif', () => {
    expect(convertirDechetsVolume(-1, 'carton_vrac')).toBeNull()
  })
})
