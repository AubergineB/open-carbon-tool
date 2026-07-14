import { describe, it, expect } from 'vitest'
import * as XLSX from 'xlsx'
import { genererRapportExcel } from './excelExport'

const projet = { nom: 'Acme Corp', naf: '49.41A', effectif: 28, ca: 3500, annee: '2025' }
const lignes = [
  {
    posteId: 'combustion_fixe',
    scope: 1,
    categorie_ghg: 'Scope 1 — Combustion fixe',
    categorie_bc: 'Émissions directes — Sources fixes',
    facteurId: 'gaz_nat_kwh',
    precision: 'P2',
    source: 'Facture GRDF',
    resultat: {
      fe_utilise: { nom: 'Gaz naturel' },
      donnee_brute: 85000,
      unite: 'kWh PCI',
      emission_t: 17.425,
      amont_t: 3.23,
      total_t: 20.655,
      co2b_t: 0,
    },
  },
]
const resultats = { scope1: 17.425, scope2: 0, scope3: 3.23, total: 20.655 }

describe('genererRapportExcel', () => {
  it('produit un classeur xlsx relisible avec les 3 feuilles attendues', () => {
    const { bytes, fileName } = genererRapportExcel(projet, lignes, resultats, {}, lignes, 100)

    expect(fileName).toBe('open-carbon-tool-acme-corp-2025.xlsx')
    expect(bytes.byteLength ?? bytes.length).toBeGreaterThan(0)

    const wb = XLSX.read(bytes, { type: 'array' })
    expect(wb.SheetNames).toEqual(['Synthèse', 'Données', 'Méthodologie'])

    const donnees = XLSX.utils.sheet_to_json(wb.Sheets['Données'], { header: 1 })
    expect(donnees[1][0]).toBe('combustion_fixe')
    expect(donnees[1][11]).toBe(20.655)
  })
})
