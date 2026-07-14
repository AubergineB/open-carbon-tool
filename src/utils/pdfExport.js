import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { agregerScope2Dual, agregerCO2Biogenique } from './calculEngine'
import { formatNombre } from './formatEmission'

// Palette de la charte graphique MTL (brand/charte.md)
const COLORS = {
  midnight: [10, 22, 40], // #0A1628 — fond sombre, texte principal
  transition: [15, 110, 86], // #0F6E56 — accent contenu, sections analytiques
  transitionL: [225, 245, 238], // #E1F5EE — fond encadrés info
  signal: [29, 158, 117], // #1D9E75 — barres de graphiques, éléments principaux
  red: [186, 0, 45], // #BA002D — accent-lines titre/KPI, encadrés méthodo
  amber: [186, 117, 23], // #BA7517 — données clés, chiffre dominant
  surface: [250, 249, 245], // #FAF9F5 — fond des pages de contenu
  cloud: [246, 248, 250], // #F6F8FA — fond alternatif froid
  greyText: [95, 94, 90], // #5F5E5A — texte secondaire sur fond clair
  greyLight: [232, 232, 229], // #E8E8E5 — bordures, barres de progression vides
  onDark: [150, 158, 172], // texte secondaire sur fond Midnight (~ white/40)
  white: [255, 255, 255],
}

// Scopes : Midnight / Signal / Amber — le Red reste réservé aux warnings
const SCOPE_COLORS = { 1: COLORS.midnight, 2: COLORS.signal, 3: COLORS.amber }

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 20
const CONTENT_W = PAGE_W - MARGIN * 2

// Les polices PDF standard (Helvetica, fallback bureautique de la charte) ne
// couvrent que cp1252 : ni le « ₂ » de tCO₂e ni les espaces fines d'Intl fr-FR.
const fmt = (v, dec = 1) => formatNombre(v, { decimales: dec }).replace(/[\u202F\u00A0]/g, ' ')

const fmtTotal = (v) => (v < 10 ? fmt(v, 1) : fmt(v, 0))

// Écrit « tCO2e » avec un vrai 2 en indice, retourne le x de fin
function drawUnitTCO2e(doc, x, y, size, suffix = 'e') {
  doc.setFontSize(size)
  doc.text('tCO', x, y)
  let cx = x + doc.getTextWidth('tCO')
  doc.setFontSize(size * 0.65)
  doc.text('2', cx, y + size * 0.05)
  cx += doc.getTextWidth('2')
  doc.setFontSize(size)
  if (suffix) {
    doc.text(suffix, cx, y)
    cx += doc.getTextWidth(suffix)
  }
  return cx
}

// Label uppercase, tracking +0.5 (charte : letter-spacing labels en uppercase)
function drawLabel(doc, text, x, y, color = COLORS.greyText, size = 7) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(size)
  doc.setTextColor(...color)
  doc.text(text.toUpperCase(), x, y, { charSpace: 0.5 })
}

// Fond Surface des pages de contenu (charte : fond clair Surface + texte Midnight)
function paintSurface(doc) {
  doc.setFillColor(...COLORS.surface)
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F')
}

// Accent-line 40×3 + titre de section.
// Charte : Red pour les sections titre/KPI, Transition pour le contenu.
function sectionHeader(doc, title, accent = COLORS.transition) {
  paintSurface(doc)
  let y = MARGIN + 4
  doc.setFillColor(...accent)
  doc.rect(MARGIN, y, 40, 3, 'F')
  y += 13
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...COLORS.midnight)
  doc.text(title.toUpperCase(), MARGIN, y, { charSpace: 0.4 })
  return y + 13
}

// Carte blanche avec bordure grey-light (charte : cartes sur fond Surface)
function drawCard(doc, x, y, w, h) {
  doc.setFillColor(...COLORS.white)
  doc.rect(x, y, w, h, 'F')
  doc.setDrawColor(...COLORS.greyLight)
  doc.setLineWidth(0.3)
  doc.rect(x, y, w, h, 'S')
}

function truncate(doc, text, maxW) {
  if (doc.getTextWidth(text) <= maxW) return text
  let t = text
  while (t.length > 1 && doc.getTextWidth(t + '…') > maxW) t = t.slice(0, -1)
  return t + '…'
}

export function genererRapportPDF(projet, lignes, resultats, categories, topPostes, qualiteDonnees, facteursCustom = []) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const scope2dual = agregerScope2Dual(lignes, facteursCustom)
  const co2b = agregerCO2Biogenique(lignes)
  const total = resultats.total
  const pct = (v) => (total > 0 ? (v / total) * 100 : 0)

  // === COUVERTURE — fond Midnight, accent-line Red (charte : slide de titre) ===
  doc.setFillColor(...COLORS.midnight)
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F')

  doc.setFillColor(...COLORS.red)
  doc.rect(MARGIN, 52, 40, 3, 'F')

  drawLabel(doc, 'Bilan carbone — Rapport d\'émissions GES', MARGIN, 64, COLORS.onDark, 8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(30)
  doc.setTextColor(...COLORS.white)
  const titreLines = doc.splitTextToSize(projet.nom || 'Entreprise', CONTENT_W)
  let y = 80
  titreLines.forEach(line => {
    doc.text(line, MARGIN, y, { charSpace: -0.2 })
    y += 13
  })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(...COLORS.signal)
  doc.text(`Exercice ${projet.annee || '2025'}`, MARGIN, y + 2)

  // Métadonnées
  y = 128
  const meta = [
    ['Périmètre', 'Contrôle opérationnel'],
    ['Effectif', projet.effectif ? `${fmt(projet.effectif, 0)} ETP` : '—'],
  ]
  if (projet.secteur) meta.push(['Secteur', projet.secteur])
  meta.forEach(([label, value]) => {
    drawLabel(doc, label, MARGIN, y, COLORS.onDark)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(...COLORS.white)
    doc.text(value, MARGIN + 38, y)
    y += 10
  })

  // Bento card KPI (charte : chiffre clé blanc sur slide sombre, bordure discrète)
  const kpiY = 176
  doc.setFillColor(16, 30, 50)
  doc.rect(MARGIN, kpiY, CONTENT_W, 54, 'F')
  doc.setDrawColor(58, 70, 90)
  doc.setLineWidth(0.3)
  doc.rect(MARGIN, kpiY, CONTENT_W, 54, 'S')
  doc.setFillColor(...COLORS.red)
  doc.rect(MARGIN, kpiY, CONTENT_W, 3, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(40)
  doc.setTextColor(...COLORS.white)
  const totalStr = fmtTotal(total)
  doc.text(totalStr, MARGIN + 12, kpiY + 30, { charSpace: -0.3 })
  doc.setTextColor(...COLORS.onDark)
  drawUnitTCO2e(doc, MARGIN + 12 + doc.getTextWidth(totalStr) + 4, kpiY + 30, 15)

  drawLabel(doc, 'Empreinte carbone totale', MARGIN + 12, kpiY + 42, COLORS.onDark)

  if (total > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.onDark)
    const shares = `Scope 1 : ${fmt(pct(resultats.scope1), 0)} %   ·   Scope 2 : ${fmt(pct(resultats.scope2), 0)} %   ·   Scope 3 : ${fmt(pct(resultats.scope3), 0)} %`
    doc.text(shares, PAGE_W - MARGIN - 12, kpiY + 42, { align: 'right' })
  }

  // Pied de couverture
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.onDark)
  doc.text(`Open Carbon Tool — rapport généré le ${new Date().toLocaleDateString('fr-FR')}`, MARGIN, 272)
  doc.text('Méthodologie : Bilan Carbone® V9 · GHG Protocol Corporate Standard', MARGIN, 279)

  // === SYNTHÈSE — accent Red (charte : section KPI) ===
  doc.addPage()
  y = sectionHeader(doc, 'Synthèse', COLORS.red)

  // Cartes par scope — chiffres en Midnight / Signal / Amber (charte : mini KPI)
  const scopeData = [
    { num: 1, label: 'Scope 1 — Émissions directes', value: resultats.scope1 },
    { num: 2, label: 'Scope 2 — Énergie indirecte', value: resultats.scope2 },
    { num: 3, label: 'Scope 3 — Autres indirectes', value: resultats.scope3 },
  ]
  const cardW = (CONTENT_W - 10) / 3
  scopeData.forEach((scope, i) => {
    const x = MARGIN + i * (cardW + 5)
    drawCard(doc, x, y, cardW, 34)
    doc.setFillColor(...SCOPE_COLORS[scope.num])
    doc.rect(x, y, cardW, 3, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.setTextColor(...SCOPE_COLORS[scope.num])
    const val = scope.value < 1 ? `${fmt(scope.value * 1000, 0)} kg` : `${fmt(scope.value, 1)} t`
    doc.text(val, x + 5, y + 15)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.greyText)
    doc.text(total > 0 ? `${fmt(pct(scope.value), 0)} % du total` : '—', x + 5, y + 22)

    drawLabel(doc, scope.label, x + 5, y + 29, COLORS.greyText, 5.5)
  })
  y += 44

  // Barre empilée des scopes
  if (total > 0) {
    let x = MARGIN
    scopeData.forEach(scope => {
      const w = (CONTENT_W * scope.value) / total
      if (w <= 0) return
      doc.setFillColor(...SCOPE_COLORS[scope.num])
      doc.rect(x, y, w, 7, 'F')
      x += w
    })
    y += 12
    x = MARGIN
    scopeData.forEach(scope => {
      if (scope.value <= 0) return
      doc.setFillColor(...SCOPE_COLORS[scope.num])
      doc.rect(x, y - 2.2, 2.5, 2.5, 'F')
      drawLabel(doc, `Scope ${scope.num} · ${fmt(pct(scope.value), 0)} %`, x + 4.5, y, COLORS.greyText, 6.5)
      x += 40
    })
    y += 14
  }

  // Indicateurs clés
  const indicateurs = []
  if (projet.effectif > 0) {
    indicateurs.push(['Intensité', `${fmt(total / projet.effectif, 1)} tCO2e / ETP`])
  }
  indicateurs.push(['Qualité des données', `${fmt(qualiteDonnees, 0)} % des lignes en P2/P3`])
  indicateurs.push(['Lignes de données', fmt(lignes.filter(l => l.resultat).length, 0)])

  const indW = CONTENT_W / indicateurs.length
  indicateurs.forEach(([label, value], i) => {
    const x = MARGIN + i * indW
    drawLabel(doc, label, x, y, COLORS.greyText, 6.5)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...COLORS.midnight)
    doc.text(value, x, y + 8)
  })
  y += 22

  // Top 5 postes — accent Transition (sous-section analytique)
  doc.setFillColor(...COLORS.transition)
  doc.rect(MARGIN, y, 40, 3, 'F')
  y += 11
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...COLORS.midnight)
  doc.text('TOP 5 POSTES ÉMETTEURS', MARGIN, y, { charSpace: 0.4 })
  y += 9

  topPostes.forEach((ligne, idx) => {
    const part = pct(ligne.resultat.total_t)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(...COLORS.midnight)
    doc.text(`${idx + 1}`, MARGIN, y + 4)

    doc.setFont('helvetica', 'normal')
    doc.text(truncate(doc, ligne.categorie_ghg || '—', CONTENT_W - 60), MARGIN + 8, y + 4)

    doc.setFont('helvetica', 'bold')
    doc.text(`${fmt(ligne.resultat.total_t, 2)} t · ${fmt(part, 1)} %`, PAGE_W - MARGIN, y + 4, { align: 'right' })

    doc.setFillColor(...COLORS.greyLight)
    doc.rect(MARGIN + 8, y + 7, CONTENT_W - 8, 3, 'F')
    doc.setFillColor(...COLORS.signal)
    doc.rect(MARGIN + 8, y + 7, Math.max(1.5, ((CONTENT_W - 8) * part) / 100), 3, 'F')

    y += 16
  })

  // === RÉPARTITION PAR CATÉGORIE — accent Transition (contenu analytique) ===
  const catEntries = Object.entries(categories || {})
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])

  if (catEntries.length > 0) {
    doc.addPage()
    y = sectionHeader(doc, 'Répartition par catégorie')
    const maxVal = catEntries[0][1]

    catEntries.forEach(([cat, valeur]) => {
      if (y > PAGE_H - 30) {
        doc.addPage()
        paintSurface(doc)
        y = MARGIN + 10
      }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...COLORS.midnight)
      doc.text(truncate(doc, cat, CONTENT_W - 55), MARGIN, y)

      doc.setFont('helvetica', 'bold')
      doc.text(`${fmt(valeur, 2)} t · ${fmt(pct(valeur), 1)} %`, PAGE_W - MARGIN, y, { align: 'right' })

      doc.setFillColor(...COLORS.greyLight)
      doc.rect(MARGIN, y + 2.5, CONTENT_W, 3.5, 'F')
      doc.setFillColor(...COLORS.signal)
      doc.rect(MARGIN, y + 2.5, Math.max(1.5, (CONTENT_W * valeur) / maxVal), 3.5, 'F')

      y += 13
    })
  }

  // === RÉSULTATS DÉTAILLÉS — accent Transition ===
  doc.addPage()
  y = sectionHeader(doc, 'Résultats détaillés')

  // total_t par ligne (combustion + amont), cohérent avec le TOTAL agrégé
  const tableData = lignes
    .filter(l => l.resultat)
    .map(l => [
      l.categorie_ghg,
      l.categorie_bc,
      `${fmt(l.resultat.donnee_brute, 0)} ${l.resultat.unite}`,
      l.precision,
      fmt(l.resultat.total_t, 2),
    ])

  const pagesAvantTable = doc.internal.getNumberOfPages()
  autoTable(doc, {
    startY: y,
    head: [['CATÉGORIE GHG', 'CATÉGORIE BC®', 'DONNÉE', 'PRÉC.', 'tCO2e']],
    body: tableData,
    foot: [['TOTAL', '', '', '', fmt(total, 2)]],
    margin: { left: MARGIN, right: MARGIN, top: MARGIN + 6 },
    willDrawPage: () => {
      // Fond Surface sur les pages ajoutées par la pagination du tableau
      if (doc.internal.getNumberOfPages() > pagesAvantTable) paintSurface(doc)
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      font: 'helvetica',
      textColor: COLORS.midnight,
      lineColor: COLORS.greyLight,
      lineWidth: 0.1,
      fillColor: COLORS.white,
    },
    headStyles: {
      fillColor: COLORS.midnight,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    footStyles: {
      fillColor: COLORS.greyLight,
      textColor: COLORS.midnight,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: COLORS.cloud,
    },
    columnStyles: {
      0: { cellWidth: 48 },
      1: { cellWidth: 48 },
      3: { halign: 'center', cellWidth: 14 },
      4: { halign: 'right', fontStyle: 'bold', cellWidth: 22 },
    },
  })

  y = doc.lastAutoTable.finalY + 12

  // Double restitution Scope 2 — encadré info (bordure gauche Transition, fond Transition L)
  if (scope2dual.count > 0) {
    if (y > PAGE_H - 50) {
      doc.addPage()
      paintSurface(doc)
      y = MARGIN + 10
    }
    doc.setFillColor(...COLORS.transitionL)
    doc.rect(MARGIN, y, CONTENT_W, 28, 'F')
    doc.setFillColor(...COLORS.transition)
    doc.rect(MARGIN, y, 3, 28, 'F')

    drawLabel(doc, 'Scope 2 — Double restitution', MARGIN + 8, y + 8, COLORS.transition)

    const half = (CONTENT_W - 16) / 2
    ;[
      ['Location-Based', scope2dual.locationBased],
      ['Market-Based', scope2dual.marketBased],
    ].forEach(([label, value], i) => {
      const x = MARGIN + 8 + i * half
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.setTextColor(...COLORS.midnight)
      const str = fmt(value, 2)
      doc.text(str, x, y + 18)
      doc.setTextColor(...COLORS.greyText)
      drawUnitTCO2e(doc, x + doc.getTextWidth(str) + 2, y + 18, 8)
      drawLabel(doc, label, x, y + 24, COLORS.greyText, 6)
    })
    y += 36
  }

  // CO2 biogénique
  if (co2b.total > 0) {
    if (y > PAGE_H - 25) {
      doc.addPage()
      paintSurface(doc)
      y = MARGIN + 10
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.greyText)
    doc.text(`CO2 biogénique (reporté séparément, hors total GES) : ${fmt(co2b.total, 2)} tCO2`, MARGIN, y)
  }

  // === MÉTHODOLOGIE — accent Transition (section méthodologique) ===
  doc.addPage()
  y = sectionHeader(doc, 'Note méthodologique')

  const methodo = [
    ['Référentiel', 'Bilan Carbone® V9 / GHG Protocol Corporate Standard'],
    ['Périmètre organisationnel', 'Contrôle opérationnel'],
    ['Année de référence', String(projet.annee || '2025')],
    ['Gaz couverts', 'CO2, CH4, N2O, HFC, PFC, SF6, NF3'],
    ['PRG', 'AR5 (GIEC, 100 ans)'],
    ['Base FE', 'Base Carbone ADEME 2024'],
    ['Unité', 'tCO2e (tonne d\'équivalent CO2)'],
  ]

  autoTable(doc, {
    startY: y,
    body: methodo,
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 9, cellPadding: 3.5, textColor: COLORS.midnight },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 58 },
    },
    alternateRowStyles: { fillColor: COLORS.cloud },
    theme: 'plain',
  })

  y = doc.lastAutoTable.finalY + 14

  // Encadré méthodologique (charte : bordure gauche 3px Red, fond blanc, label Red)
  const avertissement = 'Ce bilan carbone est réalisé à des fins de diagnostic et d\'aide à la décision. Il ne constitue pas un bilan certifié ABC ni un BEGES réglementaire. Il suit la méthodologie Bilan Carbone® V9 et GHG Protocol mais n\'a pas fait l\'objet d\'un audit externe.'
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const avertLines = doc.splitTextToSize(avertissement, CONTENT_W - 16)
  const boxH = 14 + avertLines.length * 3.8

  doc.setFillColor(...COLORS.white)
  doc.rect(MARGIN, y, CONTENT_W, boxH, 'F')
  doc.setFillColor(...COLORS.red)
  doc.rect(MARGIN, y, 3, boxH, 'F')

  drawLabel(doc, 'Avertissement', MARGIN + 8, y + 8, COLORS.red)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.greyText)
  doc.text(avertLines, MARGIN + 8, y + 14)

  // Footer toutes pages sauf couverture (charte : pagination en gris texte)
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 2; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setDrawColor(...COLORS.greyLight)
    doc.setLineWidth(0.2)
    doc.line(MARGIN, 285, PAGE_W - MARGIN, 285)
    drawLabel(doc, `Open Carbon Tool — ${projet.nom || 'Projet'} · ${projet.annee || '2025'}`, MARGIN, 290, COLORS.greyText, 6.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.greyText)
    doc.text(`${i} / ${pageCount}`, PAGE_W - MARGIN, 290, { align: 'right' })
  }

  const fileName = `Open_Carbon_Tool_${(projet.nom || 'Projet').replace(/\s+/g, '_')}_${projet.annee || '2025'}.pdf`
  return {
    bytes: doc.output('arraybuffer'),
    fileName,
  }
}
