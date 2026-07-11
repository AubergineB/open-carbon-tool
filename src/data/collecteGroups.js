const collecteGroups = [
  {
    id: 'collecte-energie',
    label: 'Énergie',
    sublabel: 'Directe & indirecte',
    scopes: [1, 2],
    icon: 'bolt',
    description: 'Combustibles, véhicules, électricité, réseaux de chaleur et froid. Le gaz naturel impacte le Scope 1 (combustion) et le Scope 3.3 (amont).',
    hint: 'Vérifiez vos factures de gaz, carburant et électricité. Les cartes carburant donnent le détail par véhicule.',
  },
  {
    id: 'collecte-indirect',
    label: 'Sources indirectes',
    sublabel: 'Chaîne de valeur',
    scopes: [3],
    icon: 'local_shipping',
    description: "Achats, fret, déplacements, déchets, numérique, eau, hébergement — tout ce qui n'est pas lié à votre consommation directe d'énergie.",
    hint: 'Le Scope 3 représente souvent 70-90% du bilan. Concentrez-vous sur les postes marqués ●●●.',
  },
]

export default collecteGroups
export const collecteGroupsMap = Object.fromEntries(collecteGroups.map(g => [g.id, g]))
