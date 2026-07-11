import * as XLSX from 'xlsx'

export function genererRapportExcel(projet, lignes, resultats, categories, topPostes, qualiteDonnees) {
  const wb = XLSX.utils.book_new()

  // === Feuille 1 : Synthèse ===
  const synthese = [
    ['Open Carbon Tool — Synthèse'],
    [],
    ['Entreprise', projet.nom || '—'],
    ['Code NAF', projet.naf || '—'],
    ['Secteur', projet.secteur || '—'],
    ['Ville', projet.ville || '—'],
    ['Effectif (ETP)', projet.effectif || '—'],
    ['CA (k€ HT)', projet.ca || '—'],
    ['Surface (m²)', projet.surface || '—'],
    ['Année de référence', projet.annee || '2025'],
    ['Périmètre', projet.perimetre || 'contrôle opérationnel'],
    [],
    ['Émissions par scope', 'tCO₂e', '% du total'],
    ['Scope 1 — Émissions directes', round3(resultats.scope1), pct(resultats.scope1, resultats.total)],
    ['Scope 2 — Énergie indirecte', round3(resultats.scope2), pct(resultats.scope2, resultats.total)],
    ['Scope 3 — Émissions indirectes', round3(resultats.scope3), pct(resultats.scope3, resultats.total)],
    ['Total', round3(resultats.total), '100%'],
    [],
    ['Intensité carbone'],
    ['tCO₂e / salarié', projet.effectif > 0 ? round3(resultats.total / projet.effectif) : '—'],
    ['tCO₂e / M€ CA', projet.ca > 0 ? round3(resultats.total / (projet.ca / 1000)) : '—'],
    [],
    ['Qualité des données', `${qualiteDonnees}% postes en P2/P3`],
    [],
    ['Top 5 postes d\'émission', 'tCO₂e', '% du total'],
    ...topPostes.map(l => [
      l.resultat.fe_utilise?.nom || 'Poste',
      round3(l.resultat.total_t),
      pct(l.resultat.total_t, resultats.total),
    ]),
  ]
  const wsSynthese = XLSX.utils.aoa_to_sheet(synthese)
  wsSynthese['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, wsSynthese, 'Synthèse')

  // === Feuille 2 : Données détaillées ===
  const header = [
    'Poste', 'Scope', 'Catégorie GHG', 'Catégorie BC',
    'Facteur d\'émission', 'Donnée brute', 'Unité', 'Précision', 'Source',
    'Combustion (tCO₂e)', 'Amont S3.3 (tCO₂e)', 'Total (tCO₂e)', 'CO₂ biogénique (tCO₂)'
  ]
  const dataRows = lignes.filter(l => l.resultat).map(l => [
    l.posteId,
    l.scope,
    l.categorie_ghg || '',
    l.categorie_bc || '',
    l.resultat.fe_utilise?.nom || l.facteurId,
    l.resultat.donnee_brute,
    l.resultat.unite,
    l.precision,
    l.source || '',
    round3(l.resultat.emission_t),
    round3(l.resultat.amont_t),
    round3(l.resultat.total_t),
    round3(l.resultat.co2b_t || 0),
  ])
  const wsDonnees = XLSX.utils.aoa_to_sheet([header, ...dataRows])
  wsDonnees['!cols'] = [
    { wch: 20 }, { wch: 6 }, { wch: 30 }, { wch: 30 },
    { wch: 25 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 20 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
  ]
  XLSX.utils.book_append_sheet(wb, wsDonnees, 'Données')

  // === Feuille 3 : Méthodologie ===
  const methodo = [
    ['Méthodologie'],
    [],
    ['Référentiels'],
    ['Bilan Carbone® V9 (ABC)'],
    ['GHG Protocol Corporate Standard'],
    ['Base Carbone ADEME 2024'],
    [],
    ['Périmètre organisationnel', projet.perimetre || 'Contrôle opérationnel'],
    ['PRG utilisés', 'AR5 (IPCC 2013)'],
    ['Scope 2', 'Location-Based et Market-Based'],
    [],
    ['Niveaux de précision'],
    ['P3', 'Mesure directe'],
    ['P2', 'Facteur d\'émission spécifique'],
    ['P1', 'Facteur d\'émission générique'],
    ['P0', 'Proxy monétaire'],
    [],
    ['Notes'],
    ['Les émissions de CO₂ biogénique sont reportées séparément, hors total GES.'],
    ['Les émissions amont (Scope 3.3) sont comptabilisées dans le Scope 3.'],
    [],
    ['Date de génération', new Date().toLocaleDateString('fr-FR')],
    ['Outil', 'Open Carbon Tool — Mobility Transition Lab'],
  ]
  const wsMethodo = XLSX.utils.aoa_to_sheet(methodo)
  wsMethodo['!cols'] = [{ wch: 45 }, { wch: 30 }]
  XLSX.utils.book_append_sheet(wb, wsMethodo, 'Méthodologie')

  const filename = `open-carbon-tool-${(projet.nom || 'projet').replace(/\s+/g, '-').toLowerCase()}-${projet.annee || '2025'}.xlsx`
  return {
    bytes: XLSX.write(wb, { bookType: 'xlsx', type: 'array' }),
    fileName: filename,
  }
}

function round3(v) {
  return Math.round((v || 0) * 1000) / 1000
}

function pct(val, total) {
  if (!total || total === 0) return '0%'
  return `${Math.round((val / total) * 100)}%`
}
