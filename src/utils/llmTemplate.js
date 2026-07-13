import postesEmission from '../data/postesEmission'
import { collecteGroupsMap } from '../data/collecteGroups'
import {
  getAllFactors,
  getFactorByIdWithCustom,
  getFactorsByCategory,
} from '../data/emissionFactors'
import { APP_ID, FACTORS_VERSION } from '../lib/store'
import { calculerEmission } from './calculEngine'

export const LLM_TEMPLATE_FORMAT = 'ocllm'
export const LLM_TEMPLATE_SCHEMA_VERSION = 1
export const LLM_TEMPLATE_FILE_NAME = 'collecte-gabarit.ocllm.json'
export const LLM_PRECISIONS = ['P0', 'P1', 'P2', 'P3']

const ACTIVE_POSTE_STATUSES = new Set(['active', 'confirmed'])
const PRECISION_SET = new Set(LLM_PRECISIONS)

function clone(value) {
  if (value === undefined) return undefined
  if (typeof structuredClone === 'function') return structuredClone(value)
  return JSON.parse(JSON.stringify(value))
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function toNumberToken(value) {
  return Number(String(value)
    .replace(/[\s\u00a0\u202f]/g, '')
    .replace(',', '.'))
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function factorIsArchived(factor, origin, archivedCatalogIds = []) {
  if (!factor) return false
  return origin === 'custom'
    ? factor.archived === true
    : archivedCatalogIds.includes(factor.id)
}

function serializeFactor(factor, origin, selectionnable, archiveReason = null) {
  return {
    facteurId: factor.id,
    id: factor.id,
    nom: factor.nom,
    unite: factor.unite,
    valeur: factor.valeur,
    amont: factor.amont ?? 0,
    co2b: factor.co2b ?? 0,
    incertitude: factor.incertitude ?? null,
    perimetre: factor.perimetre || null,
    source: factor.source || '',
    origine: origin,
    selectionnable,
    ...(archiveReason ? { statut: 'archive', raison: archiveReason } : {}),
  }
}

function getPosteFactors(poste, facteursCustom = [], archivedCatalogIds = []) {
  const archived = new Set(archivedCatalogIds)
  const catalogFactors = getFactorsByCategory(poste.categorieFE)
  const customFactors = facteursCustom.filter(factor => factor.categorieFE === poste.categorieFE)
  const catalogIds = new Set(catalogFactors.map(factor => factor.id))

  const activeCatalog = catalogFactors
    .filter(factor => !factor.nonSelectable && !archived.has(factor.id))
    .map(factor => serializeFactor(factor, 'catalogue', true))

  const archivedCatalog = catalogFactors
    .filter(factor => archived.has(factor.id))
    .map(factor => serializeFactor(factor, 'catalogue', false, 'restauration préalable requise'))

  const activeCustom = customFactors
    .filter(factor => !factor.archived && !catalogIds.has(factor.id))
    .map(factor => serializeFactor(factor, 'custom', true))

  const archivedCustom = customFactors
    .filter(factor => factor.archived === true)
    .map(factor => serializeFactor(factor, 'custom', false, 'restauration préalable requise'))

  return {
    actifs: [...activeCatalog, ...activeCustom],
    archives: [...archivedCatalog, ...archivedCustom],
  }
}

function guideForTemplate(guide = {}) {
  return {
    ou_trouver: asArray(guide.ou_trouver),
    quoi_chercher: asArray(guide.quoi_chercher),
    ordres_grandeur: asArray(guide.ordres_grandeur),
    erreurs_courantes: asArray(guide.erreurs_courantes),
    pourquoi: guide.pourquoi || '',
  }
}

function posteForTemplate(poste, facteursCustom, archivedCatalogIds) {
  const factors = getPosteFactors(poste, facteursCustom, archivedCatalogIds)
  return {
    posteId: poste.id,
    nom: poste.nom,
    scope: poste.scope,
    categorieFE: poste.categorieFE,
    categorie_bc: poste.nom_bc,
    categorie_ghg: poste.nom_ghg,
    donneesAttendues: poste.donnees_attendues,
    unitesAttendues: unique(factors.actifs.map(factor => factor.unite)),
    guide: guideForTemplate(poste.guide),
    facteurs: factors.actifs,
    facteurIds: factors.actifs.map(factor => factor.facteurId),
    facteursArchives: factors.archives,
  }
}

function activePostesForContext({ sectionsStatus = {}, currentView } = {}) {
  const group = collecteGroupsMap[currentView]
  return postesEmission.filter(poste => (
    ACTIVE_POSTE_STATUSES.has(sectionsStatus[poste.id])
    && (!group || group.scopes.includes(poste.scope))
  ))
}

function projectContext(projet = {}) {
  return {
    nom: projet.nom || '',
    annee: String(projet.annee || ''),
    secteur: projet.secteur || '',
    avertissement: 'Retirer ou anonymiser les données sensibles avant toute transmission à un LLM tiers.',
  }
}

/**
 * Construit le gabarit local. Cette fonction est volontairement pure :
 * elle ne lit ni n'écrit le disque et ne contacte aucun service distant.
 */
export function buildLlmTemplate({
  projet = {},
  sectionsStatus = {},
  facteursCustom = [],
  lignes = [],
  currentView = 'espace-travail',
  archivedCatalogIds = [],
} = {}) {
  const activePostes = activePostesForContext({ sectionsStatus, currentView })
  const postesActifs = activePostes.map(poste => (
    posteForTemplate(poste, facteursCustom, archivedCatalogIds)
  ))

  const activeCategories = new Set(activePostes.map(poste => poste.categorieFE))
  const customRelevant = facteursCustom
    .filter(factor => factor.archived !== true && activeCategories.has(factor.categorieFE))
    .map(factor => serializeFactor(factor, 'custom', true))
  const customArchived = facteursCustom
    .filter(factor => factor.archived === true && activeCategories.has(factor.categorieFE))
    .map(factor => serializeFactor(factor, 'custom', false, 'restauration préalable requise'))

  const firstPoste = postesActifs.find(poste => poste.facteurs.length > 0)
  const firstFactor = firstPoste?.facteurs[0]
  const exemples = firstPoste && firstFactor
    ? [{
      description: 'exemple uniquement — ne pas importer comme donnée du projet',
      posteId: firstPoste.posteId,
      facteurId: firstFactor.facteurId,
      valeur: 1,
      unite: firstFactor.unite,
      precision: 'P1',
      source: 'Source à remplacer — exemple uniquement',
      commentaire: 'Remplacer par une valeur documentée, sans convertir silencieusement l’unité.',
    }]
    : []

  // `lignes` fait partie de la signature pour permettre à l'appelant de
  // transmettre son contexte, mais les données existantes ne sont jamais
  // recopiées dans le gabarit : elles peuvent être sensibles.
  void lignes

  return {
    _instructions: {
      langue: 'fr',
      role: 'Assistant de structuration de données carbone',
      objectif: 'Compléter uniquement les propositions de collecte.',
      regles: [
        'Ne jamais inventer un facteurId, une valeur, une source ou un proxy.',
        'Utiliser uniquement les facteurIds fournis pour le poste.',
        'Respecter exactement l’unite attendue et ne pas convertir silencieusement.',
        'Signaler les données absentes au lieu de les estimer.',
        'Les exemples sont marqués « exemple uniquement » et ne sont pas des données à importer.',
        'Retourner uniquement un JSON valide avec une clé propositions.',
      ],
      sortie: 'Retourner un JSON avec une clé propositions.',
    },
    format: LLM_TEMPLATE_FORMAT,
    schemaVersion: LLM_TEMPLATE_SCHEMA_VERSION,
    app: APP_ID,
    factorsVersion: FACTORS_VERSION,
    projet: projectContext(projet),
    postesActifs,
    facteursCustom: customRelevant,
    facteursCustomArchives: customArchived,
    exemples,
    propositions: [],
  }
}

function schemaError(message) {
  const error = new Error(message)
  error.code = 'INVALID_OCLLM_SCHEMA'
  return error
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Parse et contrôle l'enveloppe du fichier sans encore valider les lignes.
 */
export function parseLlmFile(input) {
  let data
  if (typeof input === 'string') {
    try {
      data = JSON.parse(input)
    } catch (error) {
      throw schemaError(`JSON invalide : ${error.message || 'impossible à analyser'}`)
    }
  } else {
    data = input
  }

  if (!isPlainObject(data)) throw schemaError('Le fichier doit contenir un objet JSON.')
  if (data.format !== LLM_TEMPLATE_FORMAT) {
    throw schemaError('Ce fichier n’est pas un gabarit OCLLM (format attendu : "ocllm").')
  }
  if (data.schemaVersion !== LLM_TEMPLATE_SCHEMA_VERSION) {
    throw schemaError(`Version de schéma OCLLM non prise en charge : ${data.schemaVersion}.`)
  }
  if (data.app !== APP_ID) {
    throw schemaError('Le gabarit ne provient pas d’Open Carbon Tool.')
  }
  if (typeof data.factorsVersion !== 'string' || data.factorsVersion.length === 0) {
    throw schemaError('Le gabarit doit déclarer une factorsVersion.')
  }
  if (!Array.isArray(data.propositions)) {
    throw schemaError('Le gabarit doit contenir un tableau "propositions".')
  }
  if (data._instructions !== undefined && !isPlainObject(data._instructions)) {
    throw schemaError('Le champ "_instructions" est invalide.')
  }
  if (data.postesActifs !== undefined && !Array.isArray(data.postesActifs)) {
    throw schemaError('Le champ "postesActifs" doit être un tableau.')
  }
  if (data.exemples !== undefined && !Array.isArray(data.exemples)) {
    throw schemaError('Le champ "exemples" doit être un tableau.')
  }
  if (data.projet !== undefined && !isPlainObject(data.projet)) {
    throw schemaError('Le champ "projet" doit être un objet.')
  }
  return data
}

export const parseLlmTemplate = parseLlmFile

function resolveFactorForPoste(poste, facteurId, facteursCustom = []) {
  const catalogFactor = getFactorsByCategory(poste.categorieFE).find(factor => factor.id === facteurId)
  const customFactor = facteursCustom.find(factor => (
    factor.id === facteurId && factor.categorieFE === poste.categorieFE
  ))
  const resolved = getFactorByIdWithCustom(facteurId, facteursCustom)
  return {
    factor: catalogFactor || customFactor || null,
    resolved,
    origin: catalogFactor ? 'catalogue' : customFactor ? 'custom' : null,
  }
}

function proposalYear(proposition) {
  if (Object.prototype.hasOwnProperty.call(proposition, 'annee')) {
    if (proposition.annee === '' || proposition.annee === null || proposition.annee === undefined) {
      return { provided: false, value: null }
    }
    return { provided: true, value: proposition.annee }
  }
  if (Object.prototype.hasOwnProperty.call(proposition, 'periode')) {
    const period = proposition.periode
    if (isPlainObject(period) && Object.prototype.hasOwnProperty.call(period, 'annee')) {
      if (period.annee === '' || period.annee === null || period.annee === undefined) {
        return { provided: false, value: null }
      }
      return { provided: true, value: period.annee }
    }
    if (typeof period === 'string' || typeof period === 'number') {
      if (period === '') return { provided: false, value: null }
      return { provided: true, value: period }
    }
    return { provided: true, value: null, invalid: true }
  }
  return { provided: false, value: null }
}

function numberRanges(text) {
  const number = '(\\d(?:[\\d\\s\\u00a0\\u202f]*\\d)?(?:[.,]\\d+)?)'
  const range = new RegExp(`${number}\\s*(?:-|–|—|à|a)\\s*${number}`, 'i')
  const match = String(text || '').match(range)
  if (!match) return []
  const min = toNumberToken(match[1])
  const max = toNumberToken(match[2])
  return Number.isFinite(min) && Number.isFinite(max)
    ? [{ min: Math.min(min, max), max: Math.max(min, max), source: String(text) }]
    : []
}

function guideRangeForUnit(guideItems, unite) {
  const normalizedUnit = normalizeText(unite)
  const unitToken = normalizedUnit.split(/\s+/)[0]
  const candidates = guideItems.flatMap(item => numberRanges(item).map(range => ({
    ...range,
    item,
  })))
  if (candidates.length === 0) return null
  const matchingUnit = candidates.find(candidate => (
    !unitToken
    || normalizeText(candidate.item).includes(unitToken)
    || (unitToken.startsWith('euro') && candidate.item.includes('€'))
    || (unitToken === 'm3' && normalizeText(candidate.item).includes('m3'))
  ))
  return matchingUnit || candidates[0]
}

function validateYear(proposition, projet, erreurs, avertissements) {
  const year = proposalYear(proposition)
  if (!year.provided) {
    avertissements.push('Année ou période absente : comparer cette proposition avec l’exercice du projet.')
    return
  }
  if (year.invalid || year.value === null || year.value === '') {
    erreurs.push('L’année ou la période fournie est invalide.')
    return
  }
  if (projet?.annee && String(year.value) !== String(projet.annee)) {
    erreurs.push(`L’année ${year.value} ne correspond pas à l’exercice du projet (${projet.annee}).`)
  }
}

function validatePlausibility(proposition, poste, avertissements) {
  const guides = asArray(poste?.guide?.ordres_grandeur)
  if (proposition.valeur === 0) {
    avertissements.push('Valeur nulle : confirmer qu’il s’agit bien d’une absence de donnée et non d’une donnée manquante.')
  }

  if (guides.length === 0) return
  const range = guideRangeForUnit(guides, proposition.unite)
  if (!range) {
    avertissements.push('À vérifier : aucun seuil calculable n’est déduit du guide d’ordre de grandeur.')
    return
  }
  if (proposition.valeur < range.min || proposition.valeur > range.max) {
    avertissements.push(`Valeur à vérifier : elle est en dehors de l’ordre de grandeur documenté (« ${range.source} »), sans seuil métier supplémentaire inventé.`)
  }
}

/**
 * Valide une proposition en la comparant au catalogue et au projet courant.
 * Les erreurs bloquent l'acceptation ; les avertissements restent confirmables
 * par la personne qui relit la ligne.
 */
export function validateLlmProposition(proposition, {
  projet = {},
  sectionsStatus = {},
  facteursCustom = [],
  archivedCatalogIds = [],
  allowedPosteIds = null,
  reviewId = null,
} = {}) {
  const raw = isPlainObject(proposition) ? clone(proposition) : proposition
  const erreurs = []
  const avertissements = []
  let poste = null
  let facteur = null
  let origin = null

  if (!isPlainObject(proposition)) {
    erreurs.push('La proposition doit être un objet JSON.')
    return {
      id: reviewId,
      proposition: raw,
      propositionNormalisee: raw,
      statut: 'a-revoir',
      erreurs,
      avertissements,
      poste: null,
      facteur: null,
    }
  }

  const normalized = {
    ...raw,
    precision: raw.precision === undefined ? 'P1' : raw.precision,
  }

  const exampleMarker = `${raw.description || ''} ${raw.source || ''} ${raw.commentaire || ''}`.toLowerCase()
  if (exampleMarker.includes('exemple uniquement')) {
    erreurs.push('Cette entrée est marquée « exemple uniquement » et ne peut pas devenir une donnée importée.')
  }

  if (typeof raw.posteId !== 'string' || raw.posteId.length === 0) {
    erreurs.push('Le champ posteId est obligatoire.')
  } else {
    poste = postesEmission.find(candidate => candidate.id === raw.posteId) || null
    if (!poste) {
      erreurs.push(`Poste inconnu : « ${raw.posteId} ». Utiliser un posteId exact du gabarit.`)
    } else {
      const status = sectionsStatus[poste.id]
      if (!ACTIVE_POSTE_STATUSES.has(status)) {
        erreurs.push(`Le poste « ${poste.nom} » n’est pas actif ou confirmé dans le projet.`)
      }
      if (allowedPosteIds && !allowedPosteIds.includes(poste.id)) {
        erreurs.push(`Le poste « ${poste.nom} » ne fait pas partie du périmètre du gabarit importé.`)
      }
    }
  }

  if (typeof raw.facteurId !== 'string' || raw.facteurId.length === 0) {
    erreurs.push('Le champ facteurId est obligatoire et doit reprendre un identifiant exact.')
  } else if (poste) {
    const resolution = resolveFactorForPoste(poste, raw.facteurId, facteursCustom)
    facteur = resolution.factor
    origin = resolution.origin
    if (!facteur) {
      if (resolution.resolved) {
        erreurs.push(`Le facteur « ${raw.facteurId} » n’est pas compatible avec le poste « ${poste.nom} ».`)
      } else {
        erreurs.push(`Facteur inconnu : « ${raw.facteurId} ». Aucun facteur externe ne sera créé.`)
      }
    } else if (factorIsArchived(facteur, origin, archivedCatalogIds)) {
      erreurs.push(`Le facteur « ${facteur.nom} » est archivé. Restaurez-le ou choisissez un facteur actif avant acceptation.`)
    } else if (facteur.nonSelectable) {
      erreurs.push(`Le facteur « ${facteur.nom} » n’est pas sélectionnable directement dans ce poste.`)
    } else if (
      !Number.isFinite(facteur.valeur)
      || !Number.isFinite(facteur.amont ?? 0)
      || !Number.isFinite(facteur.co2b ?? 0)
    ) {
      erreurs.push(`Le facteur local « ${facteur.nom} » est incomplet et ne permet pas un recalcul fiable.`)
    }
  }

  if (typeof raw.unite !== 'string' || raw.unite.length === 0) {
    erreurs.push('Le champ unite est obligatoire.')
  } else if (facteur && raw.unite !== facteur.unite) {
    erreurs.push(`Unité incohérente : « ${raw.unite} » ; l’unité exacte attendue est « ${facteur.unite} ».`)
  }

  if (!Object.prototype.hasOwnProperty.call(raw, 'valeur')) {
    erreurs.push('Le champ valeur est obligatoire.')
  } else if (typeof raw.valeur !== 'number' || !Number.isFinite(raw.valeur)) {
    erreurs.push('La valeur doit être un nombre JSON fini (pas une chaîne, NaN ou Infinity).')
  } else if (raw.valeur < 0) {
    erreurs.push('La valeur ne peut pas être négative.')
  }

  if (!PRECISION_SET.has(normalized.precision)) {
    erreurs.push(`Précision invalide : « ${normalized.precision } ». Utiliser P0, P1, P2 ou P3.`)
  }

  if (raw.source !== undefined && typeof raw.source !== 'string') {
    erreurs.push('Le champ source doit être une chaîne de caractères.')
  } else if (!raw.source || !String(raw.source).trim()) {
    avertissements.push('Source absente : conserver une facture, un relevé ou un justificatif avant validation.')
  }

  const commentaire = raw.commentaire || raw.justification
  if (
    (raw.commentaire !== undefined && typeof raw.commentaire !== 'string')
    || (raw.justification !== undefined && typeof raw.justification !== 'string')
  ) {
    erreurs.push('Le commentaire ou la justification doit être une chaîne de caractères.')
  } else if (!commentaire || !String(commentaire).trim()) {
    avertissements.push('Justification ou commentaire insuffisant : demander l’origine de la donnée.')
  }

  validateYear(raw, projet, erreurs, avertissements)

  if (raw.site !== undefined && raw.site !== null && raw.site !== '') {
    if (Array.isArray(projet.sites) && projet.sites.length > 0 && !projet.sites.includes(raw.site)) {
      erreurs.push(`Site inconnu : « ${raw.site } » n’est pas configuré dans le projet.`)
    } else if (!Array.isArray(projet.sites) || projet.sites.length === 0) {
      avertissements.push(`Site « ${raw.site } » fourni alors qu’aucun site n’est configuré dans le projet.`)
    }
  }

  if (poste && Number.isFinite(raw.valeur) && raw.valeur >= 0) {
    validatePlausibility(raw, poste, avertissements)
  }

  return {
    id: reviewId,
    proposition: raw,
    propositionNormalisee: normalized,
    statut: 'a-revoir',
    erreurs,
    avertissements,
    poste: poste ? { id: poste.id, nom: poste.nom, scope: poste.scope } : null,
    facteur: facteur ? {
      ...facteur,
      id: facteur.id,
      origine: origin,
      archive: factorIsArchived(facteur, origin, archivedCatalogIds),
    } : null,
  }
}

export const validateLlmProposal = validateLlmProposition

function templatePosteIds(data) {
  if (!Array.isArray(data.postesActifs) || data.postesActifs.length === 0) return null
  return data.postesActifs
    .map(poste => poste?.posteId)
    .filter(id => typeof id === 'string')
}

/**
 * Valide l'enveloppe puis produit la file de revue ligne par ligne.
 */
export function validateLlmFile(input, context = {}) {
  const data = parseLlmFile(input)
  const importedPosteIds = templatePosteIds(data)
  const currentAllowedIds = Array.isArray(context.allowedPosteIds)
    ? context.allowedPosteIds
    : null
  const allowedPosteIds = importedPosteIds
    ? currentAllowedIds
      ? importedPosteIds.filter(id => currentAllowedIds.includes(id))
      : importedPosteIds
    : currentAllowedIds

  const globalWarnings = []
  if (data.factorsVersion !== FACTORS_VERSION) {
    globalWarnings.push(`Version de facteurs du fichier (${data.factorsVersion}) différente de la version locale (${FACTORS_VERSION}) : les facteurs locaux seront les seuls utilisés.`)
  }
  if (Array.isArray(data.exemples) && data.exemples.length > 0) {
    globalWarnings.push('Les exemples du gabarit ne sont pas importés ; seules les entrées de propositions sont relues.')
  }
  if (data.propositions.length === 0) {
    globalWarnings.push('Aucune proposition à relire dans ce fichier.')
  }

  const reviews = data.propositions.map((proposition, index) => (
    validateLlmProposition(proposition, {
      ...context,
      allowedPosteIds,
      reviewId: `llm-review-${index + 1}`,
    })
  ))

  return {
    data,
    reviews,
    globalWarnings,
    globalErrors: [],
  }
}

function makeKey() {
  return globalThis.crypto?.randomUUID?.()
    || `llm-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function buildLigneFromReview(review, context, provenance) {
  const checked = validateLlmProposition(review.proposition, context)
  if (checked.erreurs.length > 0 || !checked.poste || !checked.facteur) {
    return { ligne: null, review: { ...checked, id: review.id } }
  }

  const proposition = checked.propositionNormalisee
  const resultat = calculerEmission(proposition.valeur, proposition.facteurId, context.facteursCustom)
  if (!resultat || resultat.feManquant === true) {
    return {
      ligne: null,
      review: {
        ...checked,
        id: review.id,
        erreurs: [...checked.erreurs, 'Impossible de recalculer cette ligne avec le facteur local.'],
      },
    }
  }

  const sourceFile = {
    nom: provenance.sourceFileName || null,
    format: LLM_TEMPLATE_FORMAT,
    schemaVersion: provenance.schemaVersion ?? LLM_TEMPLATE_SCHEMA_VERSION,
    factorsVersion: provenance.factorsVersion || null,
    propositionIndex: provenance.propositionIndex ?? null,
    sourceJson: provenance.sourceText || null,
  }

  return {
    ligne: {
      _key: makeKey(),
      posteId: checked.poste.id,
      scope: checked.poste.scope,
      categorie_bc: postesEmission.find(poste => poste.id === checked.poste.id)?.nom_bc || '',
      categorie_ghg: postesEmission.find(poste => poste.id === checked.poste.id)?.nom_ghg || '',
      facteurId: proposition.facteurId,
      valeur: proposition.valeur,
      precision: proposition.precision,
      source: 'llm-assiste',
      sourceDetail: typeof proposition.source === 'string' ? proposition.source : '',
      commentaire: proposition.commentaire || proposition.justification || '',
      resultat,
      site: proposition.site || null,
      provenance: {
        mode: 'llm-assiste',
        sourceFile,
        proposition: clone(review.proposition),
      },
    },
    review: { ...checked, id: review.id },
  }
}

/**
 * Revalide les décisions d'acceptation et construit uniquement les lignes
 * explicitement acceptées. Les lignes rejetées ou non décidées sont ignorées.
 */
export function buildAcceptedLlmLines(input, maybeContext = {}, maybeProvenance = {}) {
  const options = Array.isArray(input)
    ? { reviews: input, context: maybeContext, ...maybeProvenance }
    : input || {}
  const reviews = Array.isArray(options.reviews) ? options.reviews : []
  const context = options.context || {}
  const provenanceBase = {
    sourceFileName: options.sourceFileName || options.fileName || null,
    sourceText: options.sourceText || options.sourceJson || null,
    schemaVersion: options.sourceData?.schemaVersion,
    factorsVersion: options.sourceData?.factorsVersion,
  }
  const lignes = []
  const erreurs = []

  reviews.forEach((review, index) => {
    if (review?.statut !== 'accepte') return
    const result = buildLigneFromReview(review, context, {
      ...provenanceBase,
      propositionIndex: index,
    })
    if (result.ligne) lignes.push(result.ligne)
    else erreurs.push({
      id: review?.id || `llm-review-${index + 1}`,
      erreurs: result.review.erreurs,
    })
  })

  return {
    lignes,
    acceptedLignes: lignes,
    erreurs,
  }
}

export const buildLignesFromAccepted = buildAcceptedLlmLines

export function appendAcceptedLlmLines(lignes = [], reviewsOrOptions = [], context = {}, provenance = {}) {
  const result = Array.isArray(reviewsOrOptions)
    ? buildAcceptedLlmLines(reviewsOrOptions, context, provenance)
    : buildAcceptedLlmLines(reviewsOrOptions)
  if (result.erreurs.length > 0) return { ...result, lignes }
  return { ...result, lignes: [...lignes, ...result.lignes] }
}

// Exposé pour les tests et pour documenter que la résolution s'appuie bien sur
// le catalogue embarqué, jamais sur une valeur fournie par le fichier.
export function hasKnownFactor(facteurId, facteursCustom = []) {
  return Boolean(getFactorByIdWithCustom(facteurId, facteursCustom))
}

export function getKnownFactorIds() {
  return getAllFactors().map(factor => factor.id)
}
