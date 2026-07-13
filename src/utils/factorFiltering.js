export function splitArchivedFactors(factors = [], archivedIds = [], isCustom = false) {
  const archivedSet = new Set(archivedIds)
  return factors.reduce(
    (result, factor) => {
      const archived = isCustom ? factor.archived === true : archivedSet.has(factor.id)
      result[archived ? 'archived' : 'active'].push(factor)
      return result
    },
    { active: [], archived: [] },
  )
}

export function getSelectableFactorsForLine({
  catalogFactors = [],
  customFactors = [],
  archivedCatalogIds = [],
  facteurId = '',
} = {}) {
  const catalog = splitArchivedFactors(catalogFactors, archivedCatalogIds)
  const custom = splitArchivedFactors(customFactors, [], true)
  const currentCatalog = catalogFactors.find(factor => factor.id === facteurId) || null
  const currentCustom = customFactors.find(factor => factor.id === facteurId) || null
  const currentFactor = currentCatalog || currentCustom
  const currentIsCustom = Boolean(currentCustom && !currentCatalog)
  const currentIsArchived = currentIsCustom
    ? currentCustom.archived === true
    : Boolean(currentCatalog && new Set(archivedCatalogIds).has(currentCatalog.id))

  const selectableCatalog = currentCatalog && currentIsArchived
    ? [...catalog.active, currentCatalog]
    : catalog.active
  const selectableCustom = currentCustom && currentIsArchived
    ? [...custom.active, currentCustom]
    : custom.active

  return {
    catalogFactors: selectableCatalog,
    customFactors: selectableCustom,
    currentFactor,
    currentIsArchived,
    factorMissing: Boolean(facteurId) && !currentFactor,
  }
}
