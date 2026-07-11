// Formate une valeur en tCO₂e : affiche en kg si < 1 tonne
export function formatCO2(valeurT, { decimales = 2, suffixe = 'CO₂e' } = {}) {
  if (typeof valeurT !== 'number' || !Number.isFinite(valeurT)) return '—'
  if (valeurT < 1) return `${(valeurT * 1000).toFixed(0)} kg${suffixe}`
  return `${valeurT.toFixed(decimales)} t${suffixe}`
}
