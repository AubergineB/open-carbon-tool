export function formatNombre(valeur, options = {}) {
  if (typeof valeur !== 'number' || !Number.isFinite(valeur)) return '—'

  const { decimales = 2, significatifs } = options ?? {}
  const formatOptions = significatifs !== undefined
    ? { maximumSignificantDigits: significatifs }
    : { minimumFractionDigits: decimales, maximumFractionDigits: decimales }

  return new Intl.NumberFormat('fr-FR', formatOptions).format(valeur)
}

// Formate une valeur en tCO₂e : affiche en kg si < 1 tonne
export function formatCO2(valeurT, { decimales = 2, suffixe = 'CO₂e' } = {}) {
  if (typeof valeurT !== 'number' || !Number.isFinite(valeurT)) return '—'
  if (valeurT < 1) return `${formatNombre(valeurT * 1000, { decimales: 0 })} kg${suffixe}`
  return `${formatNombre(valeurT, { decimales })} t${suffixe}`
}
