import { describe, expect, it } from 'vitest'
import { formatCO2, formatNombre } from './formatEmission'

const formatFr = new Intl.NumberFormat('fr-FR')

describe('formatNombre', () => {
  it('utilise deux décimales par défaut', () => {
    expect(formatNombre(1.2)).toBe('1,20')
  })

  it('formate les décimales fixes avec les conventions françaises', () => {
    expect(formatNombre(1234.5, { decimales: 2 })).toBe(
      new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(1234.5),
    )
  })

  it('conserve les valeurs très petites en mode significatif', () => {
    expect(formatNombre(0.000123, { significatifs: 4 })).toBe(
      new Intl.NumberFormat('fr-FR', { maximumSignificantDigits: 4 }).format(0.000123),
    )
  })

  it('gère zéro, les valeurs négatives et les grands nombres', () => {
    expect(formatNombre(0, { decimales: 2 })).toBe('0,00')
    expect(formatNombre(-12.345, { decimales: 2 })).toBe(
      new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(-12.345),
    )
    expect(formatNombre(1234567.89, { decimales: 2 })).toBe(
      new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(1234567.89),
    )
  })

  it('retourne un tiret pour les valeurs invalides', () => {
    expect(formatNombre(null)).toBe('—')
    expect(formatNombre(undefined)).toBe('—')
    expect(formatNombre(NaN)).toBe('—')
    expect(formatNombre(Infinity)).toBe('—')
    expect(formatNombre(-Infinity)).toBe('—')
  })
})

describe('formatCO2', () => {
  it('affiche les valeurs strictement inférieures à une tonne en kg', () => {
    expect(formatCO2(0, { decimales: 2 })).toBe('0 kgCO₂e')
    expect(formatCO2(0.1234, { decimales: 2 })).toBe(`${formatFr.format(123)} kgCO₂e`)
  })

  it('affiche les valeurs à partir d’une tonne en tonnes', () => {
    expect(formatCO2(1.234, { decimales: 2 })).toBe(
      `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(1.234)} tCO₂e`,
    )
  })
})
