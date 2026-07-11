import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Couleurs MT Lab
const COLORS = {
  midnight: [10, 22, 40],
  transition: [15, 110, 86],
  signal: [29, 158, 117],
  red: [186, 0, 45],
  amber: [186, 117, 23],
  surface: [250, 249, 245],
  white: [255, 255, 255],
  greyText: [95, 94, 90],
  greyLight: [232, 232, 229],
}

export function genererRapportPDF(projet, lignes, resultats, categories, topPostes, qualiteDonnees) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageW = 210
  const margin = 20
  const contentW = pageW - margin * 2
  let y = 0

  // === PAGE DE GARDE ===
  // Fond Midnight
  doc.setFillColor(...COLORS.midnight)
  doc.rect(0, 0, pageW, 297, 'F')

  // Accent line rouge
  doc.setFillColor(...COLORS.red)
  doc.rect(margin, 60, 40, 3, 'F')

  // Titre
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(36)
  doc.setTextColor(...COLORS.white)
  doc.text('Open Carbon Tool', margin, 80)

  doc.setFontSize(18)
  doc.setTextColor(...COLORS.signal)
  doc.text(projet.nom || 'Entreprise', margin, 95)

  doc.setFontSize(12)
  doc.setTextColor(150, 160, 180)
  doc.text(`Année de référence : ${projet.annee || '2025'}`, margin, 115)
  doc.text(`Périmètre : contrôle opérationnel`, margin, 123)
  doc.text(`Effectif : ${projet.effectif || '—'} ETP`, margin, 131)

  // Cadre KPI principal
  doc.setFillColor(20, 35, 55)
  doc.roundedRect(margin, 155, contentW, 50, 3, 3, 'F')

  doc.setFontSize(42)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.white)
  const totalStr = resultats.total < 10 ? resultats.total.toFixed(1) : Math.round(resultats.total).toString()
  doc.text(totalStr, margin + 15, 183)

  doc.setFontSize(14)
  doc.setTextColor(150, 160, 180)
  doc.text('tCO₂e', margin + 15 + doc.getTextWidth(totalStr) + 5, 183)

  doc.setFontSize(10)
  doc.text('Empreinte carbone totale', margin + 15, 195)

  // Bas de page
  doc.setFontSize(9)
  doc.setTextColor(100, 110, 130)
  doc.text('Mobility Transition Lab — Conseil climat · Transport · Data', margin, 270)
  doc.text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, 277)
  doc.text('Méthodologie : Bilan Carbone® V9 / GHG Protocol Corporate Standard', margin, 284)

  // === PAGE 2 : SYNTHÈSE ===
  doc.addPage()
  y = margin

  // En-tête
  doc.setFillColor(...COLORS.surface)
  doc.rect(0, 0, pageW, 297, 'F')

  // Accent line
  doc.setFillColor(...COLORS.red)
  doc.rect(margin, y, 40, 3, 'F')
  y += 12

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...COLORS.midnight)
  doc.text('Synthèse exécutive', margin, y)
  y += 15

  // KPIs par scope
  const scopeData = [
    { label: 'Scope 1 — Émissions directes', value: resultats.scope1, color: COLORS.red },
    { label: 'Scope 2 — Énergie indirecte', value: resultats.scope2, color: COLORS.amber },
    { label: 'Scope 3 — Autres indirectes', value: resultats.scope3, color: COLORS.signal },
  ]

  const boxW = (contentW - 10) / 3
  scopeData.forEach((scope, i) => {
    const x = margin + i * (boxW + 5)
    doc.setFillColor(...COLORS.white)
    doc.roundedRect(x, y, boxW, 35, 2, 2, 'F')
    doc.setDrawColor(...COLORS.greyLight)
    doc.roundedRect(x, y, boxW, 35, 2, 2, 'S')

    doc.setFillColor(...scope.color)
    doc.rect(x, y, boxW, 3, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(...scope.color)
    const val = scope.value < 1 ? `${(scope.value * 1000).toFixed(0)} kg` : `${scope.value.toFixed(1)} t`
    doc.text(val, x + 5, y + 18)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.greyText)
    doc.text(scope.label, x + 5, y + 28)
  })
  y += 45

  // Ratio par salarié
  if (projet.effectif > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(...COLORS.midnight)
    doc.text(`Ratio : ${(resultats.total / projet.effectif).toFixed(1)} tCO₂e par salarié`, margin, y)
    y += 5
    doc.text(`Qualité des données : ${qualiteDonnees}% des postes en P2/P3`, margin, y)
    y += 15
  }

  // Top 5 postes
  doc.setFillColor(...COLORS.transition)
  doc.rect(margin, y, 40, 3, 'F')
  y += 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...COLORS.midnight)
  doc.text('Top 5 postes émetteurs', margin, y)
  y += 8

  topPostes.forEach((ligne, idx) => {
    // total_t (combustion + amont) — cohérent avec le tri de getTopPostes()
    const pct = resultats.total > 0 ? (ligne.resultat.total_t / resultats.total * 100).toFixed(1) : '0'
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.midnight)
    doc.text(`${idx + 1}.`, margin, y + 5)

    doc.setFont('helvetica', 'normal')
    doc.text(ligne.categorie_ghg, margin + 8, y + 5)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.signal)
    doc.text(`${ligne.resultat.total_t.toFixed(2)} tCO₂e (${pct}%)`, pageW - margin, y + 5, { align: 'right' })

    // Barre de progression
    doc.setFillColor(...COLORS.greyLight)
    doc.roundedRect(margin + 8, y + 8, contentW - 8, 3, 1, 1, 'F')
    doc.setFillColor(...COLORS.signal)
    doc.roundedRect(margin + 8, y + 8, Math.max(2, (contentW - 8) * parseFloat(pct) / 100), 3, 1, 1, 'F')

    y += 17
  })

  // === PAGE 3 : RÉSULTATS DÉTAILLÉS ===
  doc.addPage()
  y = margin

  doc.setFillColor(...COLORS.surface)
  doc.rect(0, 0, pageW, 297, 'F')

  doc.setFillColor(...COLORS.transition)
  doc.rect(margin, y, 40, 3, 'F')
  y += 12

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...COLORS.midnight)
  doc.text('Résultats détaillés', margin, y)
  y += 10

  // Tableau
  const tableData = lignes
    .filter(l => l.resultat)
    .map(l => [
      l.categorie_ghg,
      l.categorie_bc,
      `${l.resultat.donnee_brute} ${l.resultat.unite}`,
      l.precision,
      `${l.resultat.emission_t.toFixed(3)}`,
    ])

  // Ligne total
  tableData.push([
    { content: 'TOTAL', styles: { fontStyle: 'bold' } },
    '',
    '',
    '',
    { content: `${resultats.total.toFixed(3)}`, styles: { fontStyle: 'bold' } },
  ])

  doc.autoTable({
    startY: y,
    head: [['Catégorie GHG', 'Catégorie BC®', 'Donnée', 'Précision', 'tCO₂e']],
    body: tableData,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      font: 'helvetica',
      textColor: COLORS.midnight,
    },
    headStyles: {
      fillColor: COLORS.midnight,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [246, 248, 250],
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 45 },
      4: { halign: 'right', fontStyle: 'bold' },
    },
  })

  // === PAGE 4 : MÉTHODOLOGIE ===
  doc.addPage()
  y = margin

  doc.setFillColor(...COLORS.surface)
  doc.rect(0, 0, pageW, 297, 'F')

  doc.setFillColor(...COLORS.red)
  doc.rect(margin, y, 40, 3, 'F')
  y += 12

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...COLORS.midnight)
  doc.text('Note méthodologique', margin, y)
  y += 12

  const methodo = [
    ['Référentiel', 'Bilan Carbone® V9 / GHG Protocol Corporate Standard'],
    ['Périmètre organisationnel', 'Contrôle opérationnel'],
    ['Année de référence', projet.annee || '2025'],
    ['Gaz couverts', 'CO₂, CH₄, N₂O, HFC, PFC, SF₆, NF₃'],
    ['PRG', 'AR5 (GIEC, 100 ans)'],
    ['Base FE', 'Base Carbone ADEME 2024'],
    ['Unité', 'tCO₂e (tonne d\'équivalent CO₂)'],
  ]

  doc.autoTable({
    startY: y,
    body: methodo,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 4, textColor: COLORS.midnight },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
    },
    alternateRowStyles: { fillColor: [246, 248, 250] },
    theme: 'plain',
  })

  y = doc.lastAutoTable.finalY + 15

  // Encadré
  doc.setFillColor(...COLORS.white)
  doc.roundedRect(margin, y, contentW, 40, 2, 2, 'F')
  doc.setFillColor(...COLORS.red)
  doc.rect(margin, y, 3, 40, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.red)
  doc.text('AVERTISSEMENT', margin + 8, y + 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.greyText)
  const avertissement = 'Ce bilan carbone est réalisé à des fins de diagnostic et d\'aide à la décision. Il ne constitue pas un bilan certifié ABC ni un BEGES réglementaire. Il suit la méthodologie Bilan Carbone® V9 et GHG Protocol mais n\'a pas fait l\'objet d\'un audit externe.'
  doc.text(avertissement, margin + 8, y + 15, { maxWidth: contentW - 16 })

  // Footer toutes pages
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    if (i > 1) {
      doc.text('Mobility Transition Lab — Open Carbon Tool', margin, 290)
      doc.text(`${i} / ${pageCount}`, pageW - margin, 290, { align: 'right' })
    }
  }

  const fileName = `Open_Carbon_Tool_${(projet.nom || 'Projet').replace(/\s+/g, '_')}_${projet.annee || '2025'}.pdf`
  return {
    bytes: doc.output('arraybuffer'),
    fileName,
  }
}
