export const TREATED_STATUSES = new Set(['confirmed', 'dismissed', 'non_material'])
export const isTreated = (status) => TREATED_STATUSES.has(status)
