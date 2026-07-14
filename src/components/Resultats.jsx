import { useState, useMemo } from 'react'
import { isTauri } from '@tauri-apps/api/core'
import { save } from '@tauri-apps/plugin-dialog'
import { openPath } from '@tauri-apps/plugin-opener'
import { agregerParScope, agregerParCategorie, getTopPostes, controlerCoherence, calculerQualiteDonnees, agregerCO2Biogenique, agregerScope2Dual } from '../utils/calculEngine'
import Tooltip from './Tooltip'
import { useMultiYearData } from '../hooks/useMultiYearData'
import EvolutionPanel from './evolution/EvolutionPanel'
import { genererRapportPDF } from '../utils/pdfExport'
import { genererRapportExcel } from '../utils/excelExport'
import { saveExportBytes } from '../lib/store'
import { formatNombre } from '../utils/formatEmission'

const ghgScope3Categories = [
  { num: 1, label: 'Biens et services achetés' },
  { num: 2, label: 'Biens d\'équipement' },
  { num: 3, label: 'Émissions liées à l\'énergie (amont)' },
  { num: 4, label: 'Transport amont' },
  { num: 5, label: 'Déchets générés' },
  { num: 6, label: 'Déplacements professionnels' },
  { num: 7, label: 'Déplacements domicile-travail' },
  { num: 8, label: 'Actifs loués (amont)' },
  { num: 9, label: 'Transport aval' },
  { num: 10, label: 'Transformation des produits' },
  { num: 11, label: 'Utilisation des produits' },
  { num: 12, label: 'Fin de vie des produits' },
  { num: 13, label: 'Actifs loués (aval)' },
  { num: 14, label: 'Franchises' },
  { num: 15, label: 'Investissements' },
]

const scopeColors = {
  'Scope 1': '#001D17', 'Scope 2': '#1B7A5A', 'Scope 3': '#FF5C67',
  'Scope 3 upstream': '#FF5C67', 'Scope 3 downstream': '#BA1A1A',
  'Énergie directe': '#001D17', 'Énergie indirecte': '#1B7A5A',
  'Chaîne de valeur (amont)': '#FF5C67', 'Chaîne de valeur (aval)': '#BA1A1A',
}

const bcCategories = [
  { label: 'Émissions directes — Sources fixes de combustion', scope: 1 },
  { label: 'Émissions directes — Sources mobiles', scope: 1 },
  { label: 'Émissions directes — Fugitives', scope: 1 },
  { label: 'Émissions indirectes — Électricité', scope: 2 },
  { label: 'Émissions indirectes — Vapeur, chaleur, froid', scope: 2 },
  { label: 'Achats de produits ou services', scope: 3 },
  { label: 'Immobilisations de biens', scope: 3 },
  { label: 'Transport de marchandises amont', scope: 3 },
  { label: 'Transport de marchandises aval', scope: 3 },
  { label: 'Déchets directs', scope: 3 },
  { label: 'Déplacements professionnels', scope: 3 },
  { label: 'Déplacements domicile-travail', scope: 3 },
  { label: 'Utilisation des produits et services vendus', scope: 3 },
  { label: 'Énergie — Émissions amont', scope: 3 },
]

function mapToGHGScope3Cat(ligne) {
  const ghg = ligne.categorie_ghg || ''
  const m = ghg.match(/^Cat\. (\d+)\b/)
  if (m) return Number(m[1])
  if (ghg.includes('amont')) return 4
  if (ghg.includes('aval')) return 9
  return null
}

const donutColors = ['#001D17', '#1B7A5A', '#FF5C67', '#D4880F', '#8B6FC0', '#BA1A1A', '#2196F3', '#FF9800', '#607D8B', '#9E9E9E']
const toRad = (a) => (a * Math.PI) / 180
const stripPrefix = (s) => s.replace(/^(Scope \d — |Cat\. \d+\/?\d* — |Émissions directes — |Émissions indirectes — )/, '')
const viewTabs = [
  { id: 'ghg', label: 'GHG Protocol' },
  { id: 'bc', label: 'Bilan Carbone®' },
]

const resultTabs = [
  { id: 'bilan', label: 'Bilan' },
  { id: 'evolution', label: 'Évolution' },
]

export default function Resultats({ projet, lignes, workdir, projetPath, facteursCustom = [] }) {
  const [resultMode, setResultMode] = useState('bilan')
  const sites = projet.sites || []
  const [selectedSite, setSelectedSite] = useState(null)

  const filteredLignes = useMemo(
    () => selectedSite ? lignes.filter(l => l.site === selectedSite) : lignes,
    [lignes, selectedSite],
  )

  const resultats = useMemo(() => agregerParScope(filteredLignes), [filteredLignes])
  const categories = useMemo(() => agregerParCategorie(filteredLignes), [filteredLignes])
  const topPostes = useMemo(() => getTopPostes(filteredLignes, 5), [filteredLignes])
  const { alertes } = useMemo(() => controlerCoherence(projet, filteredLignes), [projet, filteredLignes])
  const qualite = useMemo(() => calculerQualiteDonnees(filteredLignes), [filteredLignes])
  const co2b = useMemo(() => agregerCO2Biogenique(filteredLignes), [filteredLignes])
  const scope2dual = useMemo(() => agregerScope2Dual(filteredLignes, facteursCustom), [filteredLignes, facteursCustom])

  const [scope3Expanded, setScope3Expanded] = useState(false)
  const [viewMode, setViewMode] = useState('ghg')
  const [donutAnim, setDonutAnim] = useState('')
  const [hoveredSegment, setHoveredSegment] = useState(null)

  const { snapshots: yearSnapshots, loading: yearLoading } = useMultiYearData(
    workdir, projetPath, projet, filteredLignes, resultMode === 'evolution',
  )

  const toggleScope3 = () => {
    setDonutAnim(scope3Expanded ? 'collapsing' : 'expanding')
    setScope3Expanded(!scope3Expanded)
    setTimeout(() => setDonutAnim(''), 700)
  }

  const switchView = (id) => {
    setViewMode(id)
    setDonutAnim('expanding')
    setTimeout(() => setDonutAnim(''), 700)
  }

  const hasData = resultats.total > 0

  // Bar chart data grouped by scope sub-categories
  const scopeBarData = useMemo(() => {
    const data = []
    const rows = filteredLignes.filter(l => l.resultat)

    if (viewMode === 'bc') {
      // BC mode: group by categorie_bc
      const grouped = {}
      rows.forEach(l => {
        const key = l.categorie_bc || 'Non classé'
        grouped[key] = (grouped[key] || 0) + l.resultat.total_t
      })
      if (resultats.scope33Amont > 0) {
        grouped['Énergie — Émissions amont'] = (grouped['Énergie — Émissions amont'] || 0) + resultats.scope33Amont
      }
      bcCategories.forEach(c => {
        const val = grouped[c.label] || 0
        if (val > 0) data.push({ scope: c.scope, cat: c.label, val, color: c.scope === 1 ? 'bg-primary' : c.scope === 2 ? 'bg-primary-container' : 'bg-accent-red' })
      })
      // Catch any categorie_bc not in bcCategories list
      const knownLabels = new Set(bcCategories.map(c => c.label))
      Object.entries(grouped).forEach(([key, val]) => {
        if (!knownLabels.has(key) && val > 0) data.push({ scope: 3, cat: key, val, color: 'bg-accent-red' })
      })
    } else {
      // GHG mode
      const s1Cats = {}, s2Cats = {}, s3Cats = {}
      rows.filter(l => l.scope === 1).forEach(l => { const cat = l.categorie_ghg || 'Scope 1'; s1Cats[cat] = (s1Cats[cat] || 0) + l.resultat.total_t })
      rows.filter(l => l.scope === 2).forEach(l => { const cat = l.categorie_ghg || 'Scope 2'; s2Cats[cat] = (s2Cats[cat] || 0) + l.resultat.total_t })
      rows.filter(l => l.scope === 3).forEach(l => { const cat = l.categorie_ghg || 'Scope 3'; s3Cats[cat] = (s3Cats[cat] || 0) + l.resultat.total_t })
      if (resultats.scope33Amont > 0) {
        const key = 'Cat. 3 — Émissions liées à l\'énergie (amont)'
        s3Cats[key] = (s3Cats[key] || 0) + resultats.scope33Amont
      }
      Object.entries(s1Cats).sort((a, b) => b[1] - a[1]).forEach(([cat, val]) => data.push({ scope: 1, cat, val, color: 'bg-primary' }))
      Object.entries(s2Cats).sort((a, b) => b[1] - a[1]).forEach(([cat, val]) => data.push({ scope: 2, cat, val, color: 'bg-primary-container' }))
      Object.entries(s3Cats).sort((a, b) => b[1] - a[1]).forEach(([cat, val]) => data.push({ scope: 3, cat, val, color: 'bg-accent-red' }))
    }
    return data
  }, [filteredLignes, resultats, viewMode])

  const maxBarVal = useMemo(() => scopeBarData.length > 0 ? Math.max(...scopeBarData.map(d => d.val)) : 1, [scopeBarData])

  // Scope 3: single pass for both upstream/downstream split and 15-cat GHG breakdown
  const { scope3Split, scope3GHGBreakdown } = useMemo(() => {
    const s3Lines = filteredLignes.filter(l => l.scope === 3 && l.resultat)
    let upstream = 0, downstream = 0
    const buckets = {}
    s3Lines.forEach(l => {
      const n = mapToGHGScope3Cat(l)
      if (n) {
        buckets[n] = (buckets[n] || 0) + l.resultat.total_t
        if (n <= 8) upstream += l.resultat.total_t
        else downstream += l.resultat.total_t
      }
    })
    if (resultats.scope33Amont > 0) {
      buckets[3] = (buckets[3] || 0) + resultats.scope33Amont
      upstream += resultats.scope33Amont
    }
    return {
      scope3Split: { upstream, downstream },
      scope3GHGBreakdown: ghgScope3Categories.map(c => ({ ...c, val: buckets[c.num] || 0 })),
    }
  }, [filteredLignes, resultats])

  // Donut entries: condensé ou étendu, adapté au viewMode
  const donutEntries = useMemo(() => {
    if (resultats.total === 0) return []

    if (!scope3Expanded) {
      const entries = []
      if (viewMode === 'ghg') {
        // GHG Protocol : S1, S2, S3 upstream, S3 downstream
        if (resultats.scope1 > 0) entries.push(['Scope 1', resultats.scope1])
        if (resultats.scope2 > 0) entries.push(['Scope 2', resultats.scope2])
        if (scope3Split.upstream > 0) entries.push(['Scope 3 upstream', scope3Split.upstream])
        if (scope3Split.downstream > 0) entries.push(['Scope 3 downstream', scope3Split.downstream])
      } else if (viewMode === 'bc') {
        // Bilan Carbone® : Énergie directe, Énergie indirecte, Chaîne de valeur amont/aval
        if (resultats.scope1 > 0) entries.push(['Énergie directe', resultats.scope1])
        if (resultats.scope2 > 0) entries.push(['Énergie indirecte', resultats.scope2])
        if (scope3Split.upstream > 0) entries.push(['Chaîne de valeur (amont)', scope3Split.upstream])
        if (scope3Split.downstream > 0) entries.push(['Chaîne de valeur (aval)', scope3Split.downstream])
      }
      return entries
    }

    // Étendu : S1 + S2 + top 4 catégories S3 + Autre S3
    const entries = []
    if (resultats.scope1 > 0) entries.push(['Scope 1', resultats.scope1])
    if (resultats.scope2 > 0) entries.push(['Scope 2', resultats.scope2])

    if (viewMode === 'ghg') {
      const s3Sorted = scope3GHGBreakdown.filter(c => c.val > 0).sort((a, b) => b.val - a.val)
      const top4 = s3Sorted.slice(0, 4)
      const rest = s3Sorted.slice(4)
      top4.forEach(c => entries.push([`3.${c.num} ${c.label}`, c.val]))
      const restTotal = rest.reduce((s, c) => s + c.val, 0)
      if (restTotal > 0) entries.push(['Autre', restTotal])
    } else {
      const s3Entries = scopeBarData.filter(d => d.scope === 3 && d.val > 0).sort((a, b) => b.val - a.val)
      const top4 = s3Entries.slice(0, 4)
      const rest = s3Entries.slice(4)
      top4.forEach(d => entries.push([d.cat, d.val]))
      const restTotal = rest.reduce((s, d) => s + d.val, 0)
      if (restTotal > 0) entries.push(['Autre', restTotal])
    }
    return entries
  }, [scopeBarData, resultats, scope3Expanded, scope3Split, viewMode, scope3GHGBreakdown])

  // SVG donut arc segments
  const donutArcs = useMemo(() => {
    if (!hasData || donutEntries.length === 0) return []
    const cx = 120, cy = 120, r = 100, inner = 65
    let cumAngle = -90 // start from top
    return donutEntries.map(([cat, val], i) => {
      const angle = (val / resultats.total) * 360
      const startAngle = cumAngle
      const endAngle = cumAngle + angle
      cumAngle = endAngle
      const x1o = cx + r * Math.cos(toRad(startAngle))
      const y1o = cy + r * Math.sin(toRad(startAngle))
      const x2o = cx + r * Math.cos(toRad(endAngle))
      const y2o = cy + r * Math.sin(toRad(endAngle))
      const x1i = cx + inner * Math.cos(toRad(endAngle))
      const y1i = cy + inner * Math.sin(toRad(endAngle))
      const x2i = cx + inner * Math.cos(toRad(startAngle))
      const y2i = cy + inner * Math.sin(toRad(startAngle))
      const large = angle > 180 ? 1 : 0
      const d = `M ${x1o} ${y1o} A ${r} ${r} 0 ${large} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${inner} ${inner} 0 ${large} 0 ${x2i} ${y2i} Z`
      const midAngle = toRad(startAngle + angle / 2)
      const color = scopeColors[cat] || donutColors[i % donutColors.length]
      return { cat, d, color, midAngle, cx, cy, i }
    })
  }, [donutEntries, resultats.total, hasData])

  // GHG exhaustive table
  const ghgFullCategories = useMemo(() => {
    const rows = filteredLignes.filter(l => l.resultat)
    const grouped = {}
    rows.forEach(l => { const k = l.categorie_ghg || 'Non classé'; if (!grouped[k]) grouped[k] = { total: 0, count: 0 }; grouped[k].total += l.resultat.total_t; grouped[k].count++ })
    if (resultats.scope33Amont > 0) { const k = 'Cat. 3 — Émissions liées à l\'énergie (amont)'; if (!grouped[k]) grouped[k] = { total: 0, count: 0 }; grouped[k].total += resultats.scope33Amont }

    const allCats = [
      'Scope 1 — Combustion fixe', 'Scope 1 — Combustion mobile', 'Scope 1 — Émissions fugitives',
      'Scope 2 — Électricité achetée (Location-Based)',
      'Scope 2 — Électricité achetée (Market-Based)',
      'Scope 2 — Réseaux chaleur/froid',
      ...ghgScope3Categories.map(c => `Cat. ${c.num} — ${c.label}`),
    ]
    const find = (cat) => {
      if (cat === 'Scope 2 — Électricité achetée (Location-Based)') {
        return scope2dual.electricite.count > 0
          ? { total: scope2dual.electricite.lb, count: scope2dual.electricite.count }
          : null
      }
      if (cat === 'Scope 2 — Électricité achetée (Market-Based)') {
        return scope2dual.electricite.count > 0
          ? { total: scope2dual.electricite.mb, count: scope2dual.electricite.count, info: true }
          : null
      }
      if (grouped[cat]) return grouped[cat]
      const lb = cat.split(' — ')[1]
      if (!lb) return null
      const k = Object.keys(grouped).find(k => k.includes(lb.substring(0, 12)))
      return k ? grouped[k] : null
    }
    return allCats.map(cat => {
      const d = find(cat)
      return { cat, total: d ? d.total : null, count: d?.count || 0, info: d?.info || false }
    })
  }, [filteredLignes, resultats, scope2dual])

  // BC exhaustive table
  const bcFullCategories = useMemo(() => {
    const rows = filteredLignes.filter(l => l.resultat)
    const grouped = {}
    rows.forEach(l => { const k = l.categorie_bc || 'Non classé'; if (!grouped[k]) grouped[k] = { total: 0, count: 0 }; grouped[k].total += l.resultat.total_t; grouped[k].count++ })
    return bcCategories.map(c => { const d = grouped[c.label] || null; return { cat: c.label, total: d ? d.total : null, count: d?.count || 0 } })
  }, [filteredLignes])

  const handleCopyBilan = () => {
    const lines = [
      `Bilan Carbone — ${projet.nom || 'Projet'} — Exercice ${projet.annee || '2025'}`,
      '',
      `Total : ${formatNombre(resultats.total, { decimales: 3 })} tCO₂e`,
      `Scope 1 : ${formatNombre(resultats.scope1, { decimales: 3 })} tCO₂e`,
      `Scope 2 : ${formatNombre(resultats.scope2, { decimales: 3 })} tCO₂e`,
      `Scope 3 : ${formatNombre(resultats.scope3, { decimales: 3 })} tCO₂e`,
    ]
    if (resultats.scope33Amont > 0) lines.push(`  dont Scope 3.3 (amont énergie) : ${formatNombre(resultats.scope33Amont, { decimales: 3 })} tCO₂e`)
    if (co2b.total > 0) lines.push(`CO₂ biogénique : ${formatNombre(co2b.total, { decimales: 3 })} tCO₂ (hors total)`)
    lines.push('', '--- Détail GHG Protocol ---')
    ghgFullCategories.forEach(c => lines.push(`${c.cat}\t${c.total !== null ? formatNombre(c.total, { decimales: 3 }) : 'Non renseigné'}\ttCO₂e${c.info ? ' (informatif)' : ''}`))
    lines.push('', `Généré le ${new Date().toLocaleDateString('fr-FR')} — Méthodologie BC® V9 / GHG Protocol`)
    navigator.clipboard.writeText(lines.join('\n'))
  }

  async function handleExport(generator, extensions) {
    const { bytes, fileName } = generator(projet, filteredLignes, resultats, categories, topPostes, qualite, facteursCustom)
    if (!isTauri()) {
      const blob = new Blob([bytes])
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)
      return
    }
    const path = await save({
      defaultPath: fileName,
      filters: [{ name: extensions === 'pdf' ? 'Rapport PDF' : 'Classeur Excel', extensions: [extensions] }],
    })
    if (!path) return
    await saveExportBytes(path, new Uint8Array(bytes))
    await openPath(path)
  }

  const handleExportPDF = () => handleExport(genererRapportPDF, 'pdf')
  const handleExportExcel = () => handleExport(genererRapportExcel, 'xlsx')

  if (!hasData) {
    return (
      <div className="py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-outline-variant mb-6 block">assessment</span>
        <h2 className="font-headline text-xl font-bold text-primary mb-2">Aucune donnée saisie</h2>
        <p className="text-secondary text-sm">Commencez par renseigner les données dans l'onglet Collecte.</p>
      </div>
    )
  }

  return (
    <div>
      {/* === Header + View selector === */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-[2px] w-8 bg-primary" />
            <span className="font-label text-[10px] font-bold tracking-[0.2em] uppercase text-primary">Bilan carbone</span>
          </div>
          <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">
            Résultats — {projet.nom || 'Nouveau projet'}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 tracking-widest uppercase">Calculé</span>
            <p className="text-secondary text-sm font-medium">Exercice {projet.annee || '2025'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 print-hidden">
          {/* Site filter */}
          {sites.length > 0 && (
            <div className="flex gap-0 mr-4">
              <button
                onClick={() => setSelectedSite(null)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  selectedSite === null ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline hover:text-primary'
                }`}
              >
                Consolidé
              </button>
              {sites.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSite(s)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    selectedSite === s ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline hover:text-primary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {/* View selector */}
          <div className="flex gap-0">
            {viewTabs.map(tab => (
              <button key={tab.id} onClick={() => switchView(tab.id)} className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${viewMode === tab.id ? 'bg-primary text-on-primary' : 'bg-surface-highest text-secondary hover:text-primary'}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <button onClick={handleCopyBilan} className="flex items-center gap-2 bg-surface-highest text-primary px-5 py-3 font-bold text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] hover:bg-surface-container">
            <span className="material-symbols-outlined text-sm">content_copy</span>
            Copier
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 bg-surface-highest text-primary px-5 py-3 font-bold text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] hover:bg-surface-container">
            <span className="material-symbols-outlined text-sm">table_view</span>
            Excel
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 bg-primary text-on-primary px-5 py-3 font-bold text-[10px] uppercase tracking-widest transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            PDF
          </button>
        </div>
      </div>

      {/* === Bilan / Évolution toggle === */}
      <div className="flex gap-0 mb-8 print-hidden">
        {resultTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setResultMode(tab.id)}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
              resultMode === tab.id ? 'bg-primary text-on-primary' : 'bg-surface-highest text-secondary hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {resultMode === 'evolution' && (
        <EvolutionPanel snapshots={yearSnapshots} loading={yearLoading} />
      )}

      {resultMode === 'bilan' && (<>
      {/* === KPIs === */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0 mb-12">
        <div className="bg-surface-low p-8 relative">
          <span className="font-label text-[10px] font-bold text-secondary uppercase tracking-widest mb-4 block">Émissions totales</span>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-headline font-bold text-primary">{formatNombre(resultats.total, { decimales: resultats.total < 10 ? 1 : 0 })}</span>
            <span className="text-sm text-secondary">tCO₂e</span>
          </div>
          {co2b.total > 0 && (
            <p className="text-[10px] text-secondary mt-2">+ <span className="font-bold">{formatNombre(co2b.total, { decimales: 2 })} t</span> CO₂ biogénique</p>
          )}
          <div className="absolute bottom-0 left-0 w-full h-[4px] bg-primary" />
        </div>
        <div className="bg-surface-container p-8">
          <span className="font-label text-[10px] font-bold text-secondary uppercase tracking-widest mb-4 block">Scope 1 (Direct)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-headline font-bold text-primary">{formatNombre(resultats.scope1, { decimales: 2 })}</span>
            <span className="text-sm text-secondary">tCO₂e</span>
          </div>
        </div>
        <div className="bg-surface-high p-8">
          <span className="font-label text-[10px] font-bold text-secondary uppercase tracking-widest mb-4 block">Scope 2 (Énergie)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-headline font-bold text-primary">{formatNombre(resultats.scope2, { decimales: 2 })}</span>
            <span className="text-sm text-secondary">tCO₂e</span>
          </div>
        </div>
        <div className="bg-surface-highest p-8 relative">
          <span className="font-label text-[10px] font-bold text-secondary uppercase tracking-widest mb-4 block">Scope 3 (Indirect)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-headline font-bold text-accent-red">{formatNombre(resultats.scope3, { decimales: 2 })}</span>
            <span className="text-sm text-secondary">tCO₂e</span>
          </div>
          {resultats.scope33Amont > 0 && (
            <p className="text-[10px] text-secondary mt-2">dont <span className="font-bold">{formatNombre(resultats.scope33Amont, { decimales: 2 })} t</span> S3.3 amont</p>
          )}
        </div>
      </div>

      {/* === Donut + Bar Chart === */}
      <div className="grid grid-cols-12 gap-8 mb-12 items-start">
        {/* Donut */}
        <div className="col-span-12 lg:col-span-5 bg-surface-low p-10 lg:sticky lg:top-24">
          <h3 className="text-xl font-headline font-bold text-primary uppercase mb-8">Répartition</h3>
          <div className="flex flex-col items-center gap-8">
            <div className={`donut-chart ${donutAnim}`} style={{ background: 'transparent' }}>
              <svg viewBox="0 0 240 240" className="absolute inset-0 w-full h-full" style={{ borderRadius: '50%' }}>
                {donutArcs.length === 0 && <circle cx="120" cy="120" r="100" fill="#E3E2DF" />}
                {donutArcs.map((arc) => {
                  const isHovered = hoveredSegment === arc.i
                  const tx = isHovered ? Math.cos(arc.midAngle) * 6 : 0
                  const ty = isHovered ? Math.sin(arc.midAngle) * 6 : 0
                  return (
                    <path
                      key={arc.cat}
                      d={arc.d}
                      fill={arc.color}
                      style={{
                        transform: `translate(${tx}px, ${ty}px)`,
                        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease',
                        filter: isHovered ? 'brightness(1.2) drop-shadow(0 2px 8px rgba(0,0,0,0.25))' : 'brightness(1)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={() => setHoveredSegment(arc.i)}
                      onMouseLeave={() => setHoveredSegment(null)}
                    />
                  )
                })}
              </svg>
              <div className="relative z-10 text-center">
                {hoveredSegment !== null && donutEntries[hoveredSegment] ? (
                  <>
                    <span className="block text-2xl font-headline font-bold text-primary">{formatNombre((donutEntries[hoveredSegment][1] / resultats.total) * 100, { decimales: 0 })}%</span>
                    <span className="text-[9px] font-label text-secondary uppercase tracking-tighter leading-tight max-w-[100px] block">{stripPrefix(donutEntries[hoveredSegment][0])}</span>
                  </>
                ) : (
                  <>
                    <span className="block text-2xl font-headline font-bold text-primary">100%</span>
                    <span className="text-[10px] font-label text-secondary uppercase tracking-tighter">Calculé</span>
                  </>
                )}
              </div>
            </div>
            <div className="w-full space-y-3">
              {donutEntries.map(([cat, val], i) => {
                const pct = resultats.total > 0 ? formatNombre((val / resultats.total) * 100, { decimales: 0 }) : '0'
                const color = scopeColors[cat] || donutColors[i % donutColors.length]
                const isHovered = hoveredSegment === i
                return (
                  <div
                    key={cat}
                    className="flex items-center gap-3 transition-all duration-200 cursor-pointer"
                    style={{ opacity: hoveredSegment !== null && !isHovered ? 0.4 : 1, transform: isHovered ? 'translateX(4px)' : 'none' }}
                    onMouseEnter={() => setHoveredSegment(i)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  >
                    <div className="w-3 h-3 shrink-0 transition-transform duration-200" style={{ backgroundColor: color, transform: isHovered ? 'scale(1.4)' : 'scale(1)' }} />
                    <div className="flex-1 flex justify-between items-center min-w-0">
                      <span className="text-[10px] font-label font-bold uppercase tracking-widest truncate">{stripPrefix(cat)}</span>
                      <span className="text-xs font-headline font-bold shrink-0 ml-2">{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div key={viewMode} className="col-span-12 lg:col-span-7 bg-surface-low p-10 view-transition">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-headline font-bold text-primary uppercase">Émissions par catégorie</h3>
            <button
              type="button"
              onClick={toggleScope3}
              aria-expanded={scope3Expanded}
              aria-controls="resultats-categories-detail"
              className="flex items-center gap-2 border-2 border-primary bg-primary text-on-primary px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-primary-container hover:border-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-px"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true" style={{ transform: scope3Expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>expand_more</span>
              <span>{scope3Expanded ? 'Réduire' : 'Afficher le détail'}</span>
            </button>
          </div>

          {!scope3Expanded ? (
            /* === Condensé : une barre par scope === */
            <div className="space-y-4">
              {resultats.scope1 > 0 && (
                <div>
                  <div className="flex justify-between mb-1 items-end">
                    <span className="font-headline text-xs font-bold uppercase tracking-widest text-primary">{viewMode === 'bc' ? 'Énergie directe' : 'Scope 1'}</span>
                    <span className="font-headline text-sm font-bold text-primary">{formatNombre(resultats.scope1, { decimales: 2 })} t</span>
                  </div>
                  <div className="h-5 bg-surface-highest w-full overflow-hidden"><div className="h-full bg-primary bar-fill-animate" style={{ width: `${(resultats.scope1 / resultats.total) * 100}%` }} /></div>
                </div>
              )}
              {resultats.scope2 > 0 && (
                <div>
                  <div className="flex justify-between mb-1 items-end">
                    <span className="font-headline text-xs font-bold uppercase tracking-widest text-primary">{viewMode === 'bc' ? 'Énergie indirecte' : 'Scope 2'}</span>
                    <span className="font-headline text-sm font-bold text-primary">{formatNombre(resultats.scope2, { decimales: 2 })} t</span>
                  </div>
                  <div className="h-5 bg-surface-highest w-full overflow-hidden"><div className="h-full bg-primary-container bar-fill-animate" style={{ width: `${(resultats.scope2 / resultats.total) * 100}%` }} /></div>
                </div>
              )}
              {resultats.scope3 > 0 && (
                viewMode === 'ghg' ? (
                  /* GHG Protocol condensé : S3 upstream + S3 downstream */
                  <>
                    {scope3Split.upstream > 0 && (
                      <div>
                        <div className="flex justify-between mb-1 items-end">
                          <span className="font-headline text-xs font-bold uppercase tracking-widest text-primary">Scope 3 upstream</span>
                          <span className="font-headline text-sm font-bold text-accent-red">{formatNombre(scope3Split.upstream, { decimales: 2 })} t</span>
                        </div>
                        <div className="h-5 bg-surface-highest w-full overflow-hidden"><div className="h-full bg-accent-red bar-fill-animate" style={{ width: `${(scope3Split.upstream / resultats.total) * 100}%` }} /></div>
                      </div>
                    )}
                    {scope3Split.downstream > 0 && (
                      <div>
                        <div className="flex justify-between mb-1 items-end">
                          <span className="font-headline text-xs font-bold uppercase tracking-widest text-primary">Scope 3 downstream</span>
                          <span className="font-headline text-sm font-bold text-accent-red">{formatNombre(scope3Split.downstream, { decimales: 2 })} t</span>
                        </div>
                        <div className="h-5 bg-surface-highest w-full overflow-hidden"><div className="h-full bg-error bar-fill-animate" style={{ width: `${(scope3Split.downstream / resultats.total) * 100}%` }} /></div>
                      </div>
                    )}
                  </>
                ) : (
                  /* BC condensé : chaîne de valeur amont/aval */
                  <>
                    {scope3Split.upstream > 0 && (
                      <div>
                        <div className="flex justify-between mb-1 items-end">
                          <span className="font-headline text-xs font-bold uppercase tracking-widest text-primary">Chaîne de valeur (amont)</span>
                          <span className="font-headline text-sm font-bold text-accent-red">{formatNombre(scope3Split.upstream, { decimales: 2 })} t</span>
                        </div>
                        <div className="h-5 bg-surface-highest w-full overflow-hidden"><div className="h-full bg-accent-red bar-fill-animate" style={{ width: `${(scope3Split.upstream / resultats.total) * 100}%` }} /></div>
                      </div>
                    )}
                    {scope3Split.downstream > 0 && (
                      <div>
                        <div className="flex justify-between mb-1 items-end">
                          <span className="font-headline text-xs font-bold uppercase tracking-widest text-primary">Chaîne de valeur (aval)</span>
                          <span className="font-headline text-sm font-bold text-accent-red">{formatNombre(scope3Split.downstream, { decimales: 2 })} t</span>
                        </div>
                        <div className="h-5 bg-surface-highest w-full overflow-hidden"><div className="h-full bg-error bar-fill-animate" style={{ width: `${(scope3Split.downstream / resultats.total) * 100}%` }} /></div>
                      </div>
                    )}
                  </>
                )
              )}
            </div>
          ) : (
            /* === Étendu : sous-catégories === */
            <div id="resultats-categories-detail" className="space-y-6">
              {/* Scope 1 sub-categories */}
              {scopeBarData.filter(d => d.scope === 1).length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3">{viewMode === 'bc' ? 'Énergie directe' : 'Scope 1 — Émissions directes'}</p>
                  {scopeBarData.filter(d => d.scope === 1).map((d, i) => (
                    <div key={d.cat} className="mb-3 bar-item-enter" style={{ animationDelay: `${i * 0.06}s` }}>
                      <div className="flex justify-between mb-1 items-end">
                        <span className="font-headline text-xs font-bold uppercase tracking-widest text-primary truncate">{stripPrefix(d.cat)}</span>
                        <span className="font-headline text-sm font-bold text-primary shrink-0 ml-2">{formatNombre(d.val, { decimales: 2 })} t</span>
                      </div>
                      <div className="h-5 bg-surface-highest w-full overflow-hidden"><div className="h-full bg-primary bar-fill-animate" style={{ width: `${(d.val / maxBarVal) * 100}%`, animationDelay: `${i * 0.06}s` }} /></div>
                    </div>
                  ))}
                </div>
              )}
              {/* Scope 2 sub-categories */}
              {scopeBarData.filter(d => d.scope === 2).length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3">{viewMode === 'bc' ? 'Énergie indirecte' : 'Scope 2 — Énergie indirecte'}</p>
                  {scopeBarData.filter(d => d.scope === 2).map((d, i) => (
                    <div key={d.cat} className="mb-3 bar-item-enter" style={{ animationDelay: `${(i + 3) * 0.06}s` }}>
                      <div className="flex justify-between mb-1 items-end">
                        <span className="font-headline text-xs font-bold uppercase tracking-widest text-primary truncate">{stripPrefix(d.cat)}</span>
                        <span className="font-headline text-sm font-bold text-primary shrink-0 ml-2">{formatNombre(d.val, { decimales: 2 })} t</span>
                      </div>
                      <div className="h-5 bg-surface-highest w-full overflow-hidden"><div className="h-full bg-primary-container bar-fill-animate" style={{ width: `${(d.val / maxBarVal) * 100}%`, animationDelay: `${(i + 3) * 0.06}s` }} /></div>
                    </div>
                  ))}
                </div>
              )}
              {/* Scope 3 sub-categories */}
              {(scopeBarData.filter(d => d.scope === 3).length > 0 || resultats.scope3 > 0) && (
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3">{viewMode === 'bc' ? 'Chaîne de valeur' : 'Scope 3 — Émissions indirectes'}</p>
                  {viewMode === 'ghg' ? (
                    <div className="bg-surface-container p-6 space-y-3">
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">GHG Protocol — 15 catégories Scope 3</p>
                      {scope3GHGBreakdown.filter(c => c.val > 0).length > 0 ? (() => {
                        const s3Max = Math.max(...scope3GHGBreakdown.filter(c => c.val > 0).map(c => c.val))
                        return scope3GHGBreakdown.filter(c => c.val > 0).sort((a, b) => b.val - a.val).map((c, i) => (
                          <div key={c.num} className="bar-item-enter" style={{ animationDelay: `${i * 0.06}s` }}>
                            <div className="flex justify-between mb-1 items-end">
                              <span className="font-headline text-xs font-bold text-primary"><span className="text-accent-red mr-1">3.{c.num}</span> {c.label}</span>
                              <span className="font-headline text-sm font-bold text-accent-red shrink-0 ml-2">{formatNombre(c.val, { decimales: 3 })} t</span>
                            </div>
                            <div className="h-4 bg-surface-highest w-full overflow-hidden"><div className="h-full bg-accent-red/70 bar-fill-animate" style={{ width: `${(c.val / s3Max) * 100}%`, animationDelay: `${i * 0.06}s` }} /></div>
                          </div>
                        ))
                      })() : <p className="text-xs text-secondary">Aucune donnée Scope 3</p>}
                      {scope3GHGBreakdown.filter(c => c.val === 0).length > 0 && (
                        <div className="pt-3 border-t border-surface-highest">
                          <p className="text-[10px] text-outline mb-2">Non renseignées :</p>
                          <div className="flex flex-wrap gap-2">
                            {scope3GHGBreakdown.filter(c => c.val === 0).map(c => (
                              <span key={c.num} className="text-[9px] text-outline bg-surface-highest px-2 py-0.5">3.{c.num} {c.label}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    scopeBarData.filter(d => d.scope === 3).map((d, i) => (
                      <div key={d.cat} className="mb-3 bar-item-enter" style={{ animationDelay: `${i * 0.06}s` }}>
                        <div className="flex justify-between mb-1 items-end">
                        <span className="font-headline text-xs font-bold uppercase tracking-widest text-primary truncate">{stripPrefix(d.cat)}</span>
                        <span className="font-headline text-sm font-bold text-accent-red shrink-0 ml-2">{formatNombre(d.val, { decimales: 2 })} t</span>
                        </div>
                        <div className="h-4 bg-surface-highest w-full overflow-hidden"><div className="h-full bg-accent-red/70 bar-fill-animate" style={{ width: `${(d.val / maxBarVal) * 100}%`, animationDelay: `${i * 0.06}s` }} /></div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* === Top 5 + Intensité + Qualité === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-surface-low p-8">
          <h4 className="font-headline font-bold text-sm text-primary uppercase tracking-widest mb-6">Top 5 postes</h4>
          <div className="space-y-5">
            {topPostes.map((ligne, idx) => {
              const pct = (ligne.resultat.total_t / resultats.total * 100)
              return (
                <div key={idx} className="bar-item-enter" style={{ animationDelay: `${idx * 0.08}s` }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-label font-bold uppercase tracking-wide">{ligne.resultat.fe_utilise?.nom || 'Poste'}</span>
                    <span className="text-xs font-headline font-bold text-primary">{formatNombre(ligne.resultat.total_t, { decimales: 2 })} t</span>
                  </div>
                  <div className="h-3 bg-surface-highest w-full overflow-hidden"><div className={`h-full bar-fill-animate ${idx < 2 ? 'bg-primary' : 'bg-primary-container'}`} style={{ width: `${Math.min(pct, 100)}%`, animationDelay: `${idx * 0.08}s` }} /></div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="bg-primary p-8 text-on-primary">
          <h4 className="font-headline font-bold text-sm uppercase tracking-widest mb-6">Intensité carbone</h4>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-headline font-bold">{projet.effectif > 0 ? formatNombre(resultats.total / projet.effectif, { decimales: 1 }) : '—'}</span>
            <span className="text-xs uppercase font-label">tCO₂e / salarié</span>
          </div>
          <div className="w-full bg-white/10 h-1 mt-4"><div className="bg-accent-red h-full" style={{ width: '65%' }} /></div>
          <p className="text-[10px] uppercase font-label mt-2 opacity-60">Moyenne PME France : 5-15 tCO₂e</p>
          {projet.ca > 0 && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <span className="text-2xl font-headline font-bold">{formatNombre(resultats.total / (projet.ca / 1000000), { decimales: 1 })}</span>
              <span className="text-xs uppercase font-label ml-1">tCO₂e / M€ CA</span>
            </div>
          )}
        </div>
        <div className="bg-surface-lowest p-8 border border-outline-variant/10 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-surface-container flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
          <h4 className="font-headline font-bold text-primary mb-2">Qualité des données</h4>
          <p className="text-3xl font-headline font-bold text-primary">{qualite}%</p>
          <p className="text-xs text-secondary uppercase tracking-widest mt-1">Postes en P2/P3</p>
        </div>
      </div>

      {/* === Scope 2 LB/MB === */}
      {scope2dual.count > 0 && (
        <div className="bg-surface-low p-8 mb-12">
          <h4 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-6">Scope 2 — Location-Based / Market-Based</h4>
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-surface-lowest p-6">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-3">Location-Based</span>
              <span className="text-3xl font-headline font-bold text-primary">{formatNombre(scope2dual.locationBased, { decimales: 2 })}</span>
              <span className="text-sm text-secondary ml-1">tCO₂e</span>
              <p className="text-[10px] text-outline mt-2">Mix moyen du réseau — {scope2dual.count} ligne(s)</p>
            </div>
            <div className="bg-surface-lowest p-6">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-3 flex items-center gap-1">
                Market-Based
                <Tooltip label="Méthode Market-Based">
                  Reflète vos choix d&apos;approvisionnement : les lignes couvertes par un
                  instrument contractuel (garanties d&apos;origine, offre verte) utilisent le
                  facteur du contrat ; toutes les autres se voient appliquer automatiquement
                  le mix résiduel France 2022 (ADEME/AIB, ACV) : 130 gCO₂e/kWh, plus de deux
                  fois le mix moyen. À défaut de mix résiduel publié (autres pays, réseaux de
                  chaleur), le mix moyen sert de proxy.
                </Tooltip>
              </span>
              <span className="text-3xl font-headline font-bold text-primary">{formatNombre(scope2dual.marketBased, { decimales: 2 })}</span>
              <span className="text-sm text-secondary ml-1">tCO₂e</span>
              <p className="text-[10px] text-outline mt-2">{scope2dual.countContrats} sous contrat · {scope2dual.countResiduel} au mix résiduel</p>
            </div>
          </div>
        </div>
      )}

      {/* === CO₂ biogénique === */}
      {co2b.total > 0 && (
        <div className="bg-surface-container p-8 mb-12 border-l-4 border-primary-container">
          <h4 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-2">CO₂ biogénique</h4>
          <p className="text-xs text-secondary mb-4">Reporté séparément, hors total GES (convention IPCC / GHG Protocol).</p>
          <span className="text-3xl font-headline font-bold text-primary">{formatNombre(co2b.total, { decimales: 2 })}</span>
          <span className="text-sm text-secondary ml-1">tCO₂ biogénique</span>
        </div>
      )}

      {/* === Alertes === */}
      {alertes.length > 0 && (
        <div className="bg-surface-container p-8 mb-12">
          <h4 className="font-headline text-sm font-bold text-primary uppercase tracking-[0.2em] mb-6">Contrôles de cohérence</h4>
          <div className="space-y-4">
            {alertes.map((a, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className={`material-symbols-outlined text-sm mt-0.5 ${a.type === 'warning' ? 'text-accent-warm' : 'text-secondary'}`}>{a.type === 'warning' ? 'warning' : 'info'}</span>
                <p className="text-xs text-secondary leading-relaxed">{a.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === Détail des émissions === */}
      <div className="bg-surface-lowest p-8 border border-outline-variant/10">
        <h4 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-8">Détail des émissions</h4>
        <div className="overflow-x-auto">
          {(() => {
            const fullCats = viewMode === 'ghg' ? ghgFullCategories : bcFullCategories
            return (
              <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-primary">
                    <th className="text-left py-3 text-[10px] font-bold text-outline uppercase tracking-widest">Catégorie {viewMode === 'ghg' ? 'GHG Protocol' : 'Bilan Carbone®'}</th>
                    <th className="text-right py-3 text-[10px] font-bold text-outline uppercase tracking-widest">Lignes</th>
                    <th className="text-right py-3 text-[10px] font-bold text-outline uppercase tracking-widest">tCO₂e</th>
                    <th className="text-right py-3 text-[10px] font-bold text-outline uppercase tracking-widest">%</th>
                  </tr>
                </thead>
                <tbody>
                  {fullCats.map((row, idx) => (
                    <tr key={idx} className={`border-b border-surface-container hover:bg-surface-low transition-colors ${row.total === null ? 'opacity-40' : ''}`}>
                      <td className="py-3 text-xs font-medium text-primary">{row.cat}</td>
                      <td className="py-3 text-right text-xs text-secondary">{row.total !== null ? row.count : '—'}</td>
                      <td className={`py-3 text-right font-headline font-bold ${row.total !== null ? 'text-primary' : 'text-outline'}`}>{row.total !== null ? formatNombre(row.total, { decimales: 3 }) : 'N/R'}</td>
                      <td className="py-3 text-right text-xs font-bold text-secondary">{row.total !== null && resultats.total > 0 && !row.info ? `${formatNombre((row.total / resultats.total) * 100, { decimales: 0 })}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-primary">
                    <td colSpan="2" className="py-4 font-headline font-black text-primary uppercase">Total</td>
                    <td className="py-4 text-right font-headline font-black text-primary text-lg">{formatNombre(resultats.total, { decimales: 3 })} t</td>
                    <td className="py-4 text-right font-headline font-bold text-primary">100%</td>
                  </tr>
                </tfoot>
              </table>
              {viewMode === 'ghg' && scope2dual.electricite.count > 0 && (
                <p className="text-[10px] text-outline mt-4">
                  Scope 2 électricité : restitution duale — la ligne Market-Based est informative, seule la ligne Location-Based entre dans le total.
                </p>
              )}
              </>
            )
          })()}
        </div>
      </div>

      <footer className="mt-20 pt-8 flex justify-between items-center text-[10px] font-bold text-outline-variant uppercase tracking-widest border-t border-outline-variant/10">
        <div>Généré le {new Date().toLocaleDateString('fr-FR')}</div>
        <div>Méthodologie BC® V9 / GHG Protocol</div>
      </footer>
      </>)}
    </div>
  )
}
