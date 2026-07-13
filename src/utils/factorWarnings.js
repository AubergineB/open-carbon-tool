import { getFactorByIdWithCustom } from '../data/emissionFactors'

export function collectFactorWarnings(lignes = [], facteursCustom = []) {
  return lignes.flatMap(ligne => {
    if (!ligne.facteurId) return []

    const facteurCourant = getFactorByIdWithCustom(ligne.facteurId, facteursCustom)
    if (ligne.resultat?.feManquant === true) {
      return [{
        ligneKey: ligne._key,
        posteId: ligne.posteId,
        facteurId: ligne.facteurId,
        facteurNom: ligne.resultat.fe_utilise?.nom || ligne.facteurId,
        status: 'snapshot',
      }]
    }

    if (!facteurCourant) {
      return [{
        ligneKey: ligne._key,
        posteId: ligne.posteId,
        facteurId: ligne.facteurId,
        facteurNom: ligne.resultat?.fe_utilise?.nom || ligne.facteurId,
        status: ligne.resultat ? 'verification' : 'action',
      }]
    }

    return []
  })
}

export function formatFactorNotice({
  version,
  previousTotal,
  nextTotal,
  warnings = [],
}) {
  const delta = nextTotal - previousTotal
  const deltaPercent = previousTotal > 0 ? (delta / previousTotal) * 100 : 0
  let message = `Les facteurs ont été mis à jour (${version}). Écart total : ${delta >= 0 ? '+' : ''}${delta.toFixed(3)} tCO₂e (${deltaPercent >= 0 ? '+' : ''}${deltaPercent.toFixed(1)} %).`

  if (warnings.length > 0) {
    const details = warnings.map(warning => {
      const status = {
        snapshot: 'snapshot utilisé',
        action: 'action requise',
        verification: 'résultat à vérifier',
      }[warning.status] || 'action requise'
      return `${warning.posteId || 'Ligne'} — ${warning.facteurNom} [${warning.facteurId}] (${status})`
    })
    message += ` Facteurs concernés : ${details.join('; ')}.`
  }

  return message
}
