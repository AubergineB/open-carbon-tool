// Convertisseurs de l'Espace de travail — logique pure, sans React.
// Calculatrice autonome : ne lit ni n'écrit l'état du projet ou des lignes
// de collecte, se contente de retourner un résultat à copier.

import { densites, ratiosPcsPci } from '../data/conversionConstants'
import { getFactorsByCategory, getFactorById } from '../data/emissionFactors'

function estValeurValide(valeur) {
  return typeof valeur === 'number' && Number.isFinite(valeur) && valeur >= 0
}

// Masse <-> volume via la masse volumique du carburant.
export function convertirMasseVolume({ carburantId, valeur, depuis }) {
  if (!estValeurValide(valeur)) return null

  const densite = densites.find(d => d.id === carburantId)
  if (!densite) return null

  if (depuis === 'kg') {
    return { resultat: valeur / densite.kgParL, unite: 'L', densite, source: densite.source }
  }
  if (depuis === 'L') {
    return { resultat: valeur * densite.kgParL, unite: 'kg', densite, source: densite.source }
  }
  return null
}

// Énergie facturée (PCS) <-> énergie des facteurs d'émission (PCI).
export function convertirPcsPci({ energieId, valeur, depuis }) {
  if (!estValeurValide(valeur)) return null

  const ratioEntry = ratiosPcsPci.find(r => r.id === energieId)
  if (!ratioEntry) return null

  if (depuis === 'PCS') {
    return { resultat: valeur / ratioEntry.ratio, ratio: ratioEntry.ratio, source: ratioEntry.source }
  }
  if (depuis === 'PCI') {
    return { resultat: valeur * ratioEntry.ratio, ratio: ratioEntry.ratio, source: ratioEntry.source }
  }
  return null
}

// Estimation d'ordre de grandeur de t.km à partir d'un montant de fret (€ HT),
// par inversion des facteurs ADEME déjà présents dans emissionFactors.js.
export function estimerTkmDepuisEuros({ montantEur, modeFacteurId }) {
  if (!estValeurValide(montantEur)) return null

  const feMonetaire = getFactorById('fret_eur')
  const feMode = getFactorsByCategory('fret').find(f => f.id === modeFacteurId)
  if (!feMonetaire || !feMode || feMode.valeur === 0) return null

  const emissions_kg = montantEur * feMonetaire.valeur
  const tkm = emissions_kg / feMode.valeur

  return { emissions_t: emissions_kg / 1000, tkm, feMonetaire, feMode }
}
