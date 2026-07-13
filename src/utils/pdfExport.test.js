import { describe, it, expect } from 'vitest'
import { genererRapportPDF } from './pdfExport'

const projet = { nom: 'Test', annee: 2025, effectif: 10 }
const lignes = [{
  categorie_ghg: 'Cat. 1 — Test',
  categorie_bc: 'Achats',
  precision: 'P2',
  resultat: { donnee_brute: 100, unite: 'kWh', emission_t: 0.5, total_t: 0.6 },
}]
const resultats = { total: 0.6, scope1: 0, scope2: 0, scope3: 0.6 }

describe('genererRapportPDF', () => {
  it('génère un PDF valide', () => {
    const { bytes, fileName } = genererRapportPDF(projet, lignes, resultats, {}, lignes, 50)
    expect(fileName).toMatch(/\.pdf$/)
    expect(bytes.byteLength).toBeGreaterThan(1000)
  })
})
