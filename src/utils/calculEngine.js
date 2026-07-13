// Moteur de calcul — Bilan Carbone PME
// Formule : Émission (tCO₂e) = Donnée d'activité × FE × Coefficient correcteur

import { getFactorById } from '../data/emissionFactors'

// Calcul d'émission pour une ligne de donnée
export function calculerEmission(donneActivite, facteurId, facteurCustom = null) {
  const fe = facteurCustom || getFactorById(facteurId)
  if (!fe || !donneActivite) return null

  const valeurActivite = parseFloat(donneActivite)
  if (isNaN(valeurActivite) || valeurActivite < 0) return null

  // Émission en kgCO₂e
  const emissionKg = valeurActivite * fe.valeur
  // Conversion en tCO₂e
  const emissionT = emissionKg / 1000

  // CO₂ biogénique (pour biomasse et biocarburants)
  const co2bKg = fe.co2b ? valeurActivite * fe.co2b : 0
  const co2bT = co2bKg / 1000

  // Scope 3.3 — émissions amont (extraction, transport, raffinage)
  const amontKg = fe.amont ? valeurActivite * fe.amont : 0
  const amontT = amontKg / 1000

  // Total = combustion directe + amont (pour affichage)
  const totalKg = emissionKg + amontKg
  const totalT = totalKg / 1000

  return {
    emission_kg: Math.round(emissionKg * 100) / 100,
    emission_t: Math.round(emissionT * 1000) / 1000,
    co2b_kg: Math.round(co2bKg * 100) / 100,
    co2b_t: Math.round(co2bT * 1000) / 1000,
    amont_kg: Math.round(amontKg * 100) / 100,
    amont_t: Math.round(amontT * 1000) / 1000,
    total_kg: Math.round(totalKg * 100) / 100,
    total_t: Math.round(totalT * 1000) / 1000,
    fe_utilise: fe,
    donnee_brute: valeurActivite,
    unite: fe.unite,
  }
}

// Calcul d'incertitude par propagation quadratique
export function calculerIncertitude(incertitudeDonnee, incertitudeFE) {
  return Math.round(Math.sqrt(incertitudeDonnee ** 2 + incertitudeFE ** 2) * 10) / 10
}

// Incertitude par défaut selon niveau de précision
export function getIncertitudeDefaut(niveauPrecision) {
  const map = { P3: 5, P2: 15, P1: 30, P0: 50 }
  return map[niveauPrecision] || 50
}

export const precisionLabels = {
  P3: 'Donnée mesurée',
  P2: 'FE représentatif',
  P1: 'Moyenne sectorielle',
  P0: 'Estimation monétaire',
}

// Agrégation par scope
// emission_t = combustion directe (Scope 1), amont_t = Scope 3.3
// Le total inclut combustion + amont pour chaque ligne
export function agregerParScope(lignes) {
  const scopes = { 1: 0, 2: 0, 3: 0 }
  const details = { 1: [], 2: [], 3: [] }
  let scope33Amont = 0

  lignes.forEach(ligne => {
    if (!ligne.resultat) return
    const scope = ligne.scope
    // Scope 1/2 : uniquement combustion directe
    scopes[scope] += ligne.resultat.emission_t
    details[scope].push(ligne)
    // Scope 3.3 : émissions amont (extraction, transport, raffinage)
    if (ligne.resultat.amont_t > 0) {
      scope33Amont += ligne.resultat.amont_t
    }
  })

  // Scope 3.3 est ajouté au scope 3
  scopes[3] += scope33Amont

  const total = scopes[1] + scopes[2] + scopes[3]

  return {
    scope1: Math.round(scopes[1] * 1000) / 1000,
    scope2: Math.round(scopes[2] * 1000) / 1000,
    scope3: Math.round(scopes[3] * 1000) / 1000,
    scope33Amont: Math.round(scope33Amont * 1000) / 1000,
    total: Math.round(total * 1000) / 1000,
    details,
  }
}

// Snapshot annuel pour suivi multi-année
export function computeYearSnapshot(projet, lignes) {
  const agg = agregerParScope(lignes)
  return {
    annee: projet.annee || null,
    projetId: projet.id,
    total: agg.total,
    scope1: agg.scope1,
    scope2: agg.scope2,
    scope3: agg.scope3,
    effectif: projet.effectif || null,
    ca: projet.ca || null,
  }
}

// Agrégation par catégorie GHG Protocol (total = combustion + amont)
export function agregerParCategorie(lignes) {
  const categories = {}
  lignes.forEach(ligne => {
    if (!ligne.resultat) return
    const cat = ligne.categorie_ghg || 'Non classé'
    if (!categories[cat]) categories[cat] = 0
    categories[cat] += ligne.resultat.total_t
  })
  // Arrondir
  Object.keys(categories).forEach(k => {
    categories[k] = Math.round(categories[k] * 1000) / 1000
  })
  return categories
}

// Top N postes émetteurs (tri par total = combustion + amont)
export function getTopPostes(lignes, n = 5) {
  return [...lignes]
    .filter(l => l.resultat && l.resultat.total_t > 0)
    .sort((a, b) => b.resultat.total_t - a.resultat.total_t)
    .slice(0, n)
}

// Contrôles de cohérence
export function controlerCoherence(projet, lignes) {
  const alertes = []
  const totaux = agregerParScope(lignes)
  const effectif = projet.effectif || 1

  // Ratio émissions/salarié
  const ratioSalarie = totaux.total / effectif
  if (ratioSalarie > 0 && ratioSalarie < 1) {
    alertes.push({ type: 'warning', message: `Ratio très faible : ${ratioSalarie.toFixed(1)} tCO₂e/salarié (attendu : 1-50)` })
  }
  if (ratioSalarie > 50) {
    alertes.push({ type: 'warning', message: `Ratio très élevé : ${ratioSalarie.toFixed(1)} tCO₂e/salarié (attendu : 1-50 hors industrie lourde)` })
  }

  // Catégories matérielles non renseignées
  const categoriesMat = [
    'Émissions directes — Sources fixes de combustion',
    'Émissions indirectes — Électricité',
    'Achats de produits ou services',
    'Déplacements domicile-travail',
  ]
  categoriesMat.forEach(cat => {
    const renseignee = lignes.some(l => l.categorie_bc === cat && l.resultat && l.resultat.total_t > 0)
    if (!renseignee) {
      alertes.push({ type: 'info', message: `Catégorie matérielle non renseignée : ${cat}` })
    }
  })

  // Qualité des données
  const qualite = calculerQualiteDonnees(lignes)
  if (qualite < 50) {
    alertes.push({ type: 'warning', message: `Qualité des données : seulement ${qualite}% des postes en P2/P3` })
  }

  return { alertes, qualite }
}

// Indicateur qualité globale
export function calculerQualiteDonnees(lignes) {
  const totalLignes = lignes.filter(l => l.resultat).length
  if (totalLignes === 0) return 0
  const lignesP2P3 = lignes.filter(l => l.resultat && (l.precision === 'P2' || l.precision === 'P3')).length
  return Math.round((lignesP2P3 / totalLignes) * 100)
}

// Agrégation CO₂ biogénique
export function agregerCO2Biogenique(lignes) {
  let total = 0
  const details = []
  lignes.forEach(l => {
    if (l.resultat && l.resultat.co2b_t > 0) {
      total += l.resultat.co2b_t
      details.push(l)
    }
  })
  return { total: Math.round(total * 1000) / 1000, details }
}

// Double restitution Scope 2 — GHG Protocol Scope 2 Guidance.
// Chaque ligne scope 2 apparaît dans LES DEUX colonnes :
//  - Location-Based : quantité × FE mix moyen du réseau
//    (fe.lbFactorId si FE contractuel, sinon FE de la ligne)
//  - Market-Based : quantité × FE contractuel si contrat, sinon FE résiduel
//    (fe.mbFallbackId), sinon le FE de la ligne sert de proxy
//    (réseaux chaleur/froid, mix hors France, monétaire, FE custom).
// Le FE est re-résolu par id : les snapshots persistés (fe_utilise) peuvent
// être antérieurs à l'ajout de lbFactorId/mbFallbackId ou porter une valeur
// corrigée depuis.
export function agregerScope2Dual(lignes) {
  const round3 = (v) => Math.round(v * 1000) / 1000
  const details = []
  let lbSum = 0
  let mbSum = 0

  lignes.forEach(ligne => {
    if (ligne.scope !== 2 || !ligne.resultat) return
    const snapshot = ligne.resultat.fe_utilise
    const fe = (snapshot?.id && getFactorById(snapshot.id)) || snapshot || {}
    const qty = ligne.resultat.donnee_brute
    const ownT = (typeof fe.valeur === 'number' && typeof qty === 'number')
      ? round3((qty * fe.valeur) / 1000)
      : ligne.resultat.emission_t

    let lb_t
    let mb_t
    let mbSource
    if ((fe.scope2method || 'location') === 'market') {
      mb_t = ownT
      mbSource = 'contrat'
      const feLB = fe.lbFactorId ? getFactorById(fe.lbFactorId) : null
      lb_t = feLB ? round3((qty * feLB.valeur) / 1000) : ownT
    } else {
      lb_t = ownT
      const feMB = fe.mbFallbackId ? getFactorById(fe.mbFallbackId) : null
      if (feMB) {
        mb_t = round3((qty * feMB.valeur) / 1000)
        mbSource = 'residuel'
      } else {
        mb_t = ownT
        mbSource = 'proxy'
      }
    }

    lbSum += lb_t
    mbSum += mb_t
    details.push({ ligne, lb_t, mb_t, mbSource, isElec: (ligne.categorie_ghg || '').includes('Électricité achet') })
  })

  const sub = (arr) => ({
    lb: round3(arr.reduce((s, d) => s + d.lb_t, 0)),
    mb: round3(arr.reduce((s, d) => s + d.mb_t, 0)),
    count: arr.length,
  })

  return {
    locationBased: round3(lbSum),
    marketBased: round3(mbSum),
    count: details.length,
    countContrats: details.filter(d => d.mbSource === 'contrat').length,
    countResiduel: details.filter(d => d.mbSource === 'residuel').length,
    electricite: sub(details.filter(d => d.isElec)),
    autres: sub(details.filter(d => !d.isElec)),
    details,
  }
}
