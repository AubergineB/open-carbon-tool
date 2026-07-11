import { isTauri, invoke } from '@tauri-apps/api/core'
import { documentDir, join } from '@tauri-apps/api/path'
import { load } from '@tauri-apps/plugin-store'
import { open } from '@tauri-apps/plugin-dialog'
import {
  exists,
  mkdir,
  readDir,
  readTextFile,
  remove,
  rename,
  writeFile,
  writeTextFile,
} from '@tauri-apps/plugin-fs'

export const CURRENT_SCHEMA_VERSION = 1
export const APP_ID = 'open-carbon-tool'
export const FACTORS_VERSION = 'ademe-base-empreinte-23.6'

const WORKDIR_KEY = 'workdir'
const BROWSER_FILES_KEY = 'open-carbon-tool.files'
const settingsPromise = isTauri()
  ? load('settings.json', { defaults: {}, autoSave: 150 })
  : null
const writeQueues = new Map()

function uuid() {
  return globalThis.crypto?.randomUUID?.()
    || `ocb-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function isNative() {
  return isTauri()
}

function browserFiles() {
  try {
    return JSON.parse(localStorage.getItem(BROWSER_FILES_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveBrowserFiles(files) {
  localStorage.setItem(BROWSER_FILES_KEY, JSON.stringify(files))
}

function browserPath(workdir, name) {
  return `${workdir.replace(/[\\/]+$/, '')}/${name}`
}

async function pathFor(workdir, name) {
  return isNative() ? join(workdir, name) : browserPath(workdir, name)
}

async function readText(path) {
  if (isNative()) return readTextFile(path)
  const files = browserFiles()
  if (!(path in files)) throw new Error(`Fichier introuvable : ${path}`)
  return files[path]
}

async function writeText(path, content) {
  if (isNative()) {
    await writeTextFile(path, content)
    return
  }
  const files = browserFiles()
  files[path] = content
  saveBrowserFiles(files)
}

async function movePath(from, to) {
  if (isNative()) {
    await rename(from, to)
    return
  }
  const files = browserFiles()
  if (!(from in files)) throw new Error(`Fichier introuvable : ${from}`)
  files[to] = files[from]
  delete files[from]
  saveBrowserFiles(files)
}

async function pathExists(path) {
  if (isNative()) return exists(path)
  return Object.prototype.hasOwnProperty.call(browserFiles(), path)
}

async function ensureDirectory(path) {
  if (isNative()) {
    await mkdir(path, { recursive: true })
  }
}

async function enqueue(path, task) {
  const previous = writeQueues.get(path) || Promise.resolve()
  const current = previous.catch(() => {}).then(task)
  writeQueues.set(path, current)
  try {
    return await current
  } finally {
    if (writeQueues.get(path) === current) writeQueues.delete(path)
  }
}

function toNumber(value, fallback = 0) {
  if (value === '' || value === null || value === undefined) return fallback
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function slugify(value) {
  return String(value || 'bilan')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0,  sixtyChars())
    || 'bilan'
}

function sixtyChars() {
  return 60
}

function fileNameFor(projet) {
  return `${slugify(projet.nom)}-${projet.annee || 'sans-annee'}.ocbilan.json`
}

function normalizeProjet(raw = {}) {
  return {
    nom: raw.nom || '',
    naf: raw.naf || '',
    effectif: toNumber(raw.effectif),
    ca: toNumber(raw.ca),
    surface: toNumber(raw.surface),
    annee: String(raw.annee || '2025'),
    perimetre: raw.perimetre || 'controle_operationnel',
    ville: raw.ville || '',
    secteur: raw.secteur || '',
    sites: Array.isArray(raw.sites) ? raw.sites : [],
  }
}

function normalizeLigne(raw = {}) {
  return {
    _key: raw._key || raw.id || uuid(),
    posteId: raw.posteId || raw.poste_id || '',
    scope: Number(raw.scope) || 3,
    categorie_bc: raw.categorie_bc || raw.categorieBc || '',
    categorie_ghg: raw.categorie_ghg || raw.categorieGhg || '',
    facteurId: raw.facteurId || raw.facteur_id || '',
    valeur: toNumber(raw.valeur),
    precision: raw.precision || 'P1',
    source: raw.source || '',
    resultat: raw.resultat || null,
    site: raw.site || null,
  }
}

function normalizeData(raw = {}) {
  const schemaVersion = Number(raw.schemaVersion || 1)
  if (raw.app && raw.app !== APP_ID && raw.app !== 'bilan-carbone-pme') {
    throw new Error('Ce fichier ne provient pas d’Open Carbon Tool.')
  }
  if (schemaVersion > CURRENT_SCHEMA_VERSION) {
    const error = new Error(`Version de fichier ${schemaVersion} supérieure à la version supportée (${CURRENT_SCHEMA_VERSION}).`)
    error.code = 'UNSUPPORTED_SCHEMA'
    throw error
  }

  const projet = normalizeProjet(raw.projet || raw)
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    app: APP_ID,
    factorsVersion: raw.factorsVersion || FACTORS_VERSION,
    id: raw.id || uuid(),
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
    projet,
    lignes: Array.isArray(raw.lignes) ? raw.lignes.map(normalizeLigne) : [],
    sectionsStatus: raw.sectionsStatus || raw.sections_status || {},
    sectionsAssignees: raw.sectionsAssignees || raw.sections_assignees || {},
  }
}

export function migrateProjetFile(raw) {
  return normalizeData(raw)
}

function dataForWrite(input = {}, previous = {}) {
  const data = normalizeData({
    ...previous,
    ...input,
    projet: input.projet || previous.projet || input,
    lignes: input.lignes || previous.lignes || [],
    sectionsStatus: input.sectionsStatus || previous.sectionsStatus || {},
    sectionsAssignees: input.sectionsAssignees || previous.sectionsAssignees || {},
  })
  return {
    ...data,
    id: input.id || previous.id || data.id,
    createdAt: input.createdAt || previous.createdAt || data.createdAt,
    updatedAt: new Date().toISOString(),
    factorsVersion: input.factorsVersion || previous.factorsVersion || FACTORS_VERSION,
  }
}

async function readData(path) {
  return migrateProjetFile(JSON.parse(await readText(path)))
}

async function writeData(path, data) {
  return enqueue(path, async () => {
    const temporaryPath = `${path}.tmp`
    await writeText(temporaryPath, `${JSON.stringify(data, null, 2)}\n`)
    await movePath(temporaryPath, path)
  })
}

async function cleanupTemporaryFiles(workdir) {
  if (!isNative()) {
    const files = browserFiles()
    Object.keys(files)
      .filter(path => path.startsWith(`${workdir}/`) && path.endsWith('.tmp'))
      .forEach(path => delete files[path])
    saveBrowserFiles(files)
    return
  }
  try {
    const entries = await readDir(workdir)
    await Promise.all(
      entries
        .filter(entry => entry.isFile && entry.name.endsWith('.tmp'))
        .map(async entry => remove(await pathFor(workdir, entry.name))),
    )
  } catch {
    // Un dossier nouvellement créé ou temporairement inaccessible sera traité
    // par l’appelant avec un message explicite.
  }
}

export async function getWorkdir() {
  try {
    if (isNative()) return (await settingsPromise)?.get(WORKDIR_KEY) || null
    return localStorage.getItem(WORKDIR_KEY) || null
  } catch {
    return null
  }
}

async function ensureWorkdirAccess(path) {
  if (isNative()) await invoke('set_workdir', { path })
}

export async function restoreWorkdir() {
  const saved = await getWorkdir()
  return saved ? setWorkdir(saved) : ensureDefaultWorkdir()
}

export async function setWorkdir(path) {
  if (!path) return
  await ensureWorkdirAccess(path)
  if (isNative()) {
    const settings = await settingsPromise
    await settings.set(WORKDIR_KEY, path)
    await settings.save()
  } else {
    localStorage.setItem(WORKDIR_KEY, path)
  }
  await ensureDirectory(path)
  await cleanupTemporaryFiles(path)
  return path
}

export async function pickWorkdir() {
  const selected = await open({
    directory: true,
    multiple: false,
    recursive: true,
    title: 'Choisir le dossier de travail',
  })
  if (!selected || Array.isArray(selected)) return null
  return setWorkdir(selected)
}

export async function ensureDefaultWorkdir() {
  if (!isNative()) {
    const defaultPath = 'browser://Open Carbon Tool'
    await setWorkdir(defaultPath)
    return defaultPath
  }
  const defaultPath = await join(await documentDir(), 'Open Carbon Tool')
  await setWorkdir(defaultPath)
  return defaultPath
}

export async function listProjets(workdir) {
  await cleanupTemporaryFiles(workdir)
  let entries
  if (isNative()) {
    entries = (await readDir(workdir)).filter(entry => entry.isFile && entry.name.endsWith('.ocbilan.json'))
  } else {
    entries = Object.keys(browserFiles())
      .filter(path => path.startsWith(`${workdir}/`) && path.endsWith('.ocbilan.json'))
      .map(path => ({ name: path.split('/').pop(), isFile: true }))
  }

  const projets = await Promise.all(entries.map(async entry => {
    const path = await pathFor(workdir, entry.name)
    try {
      const data = await readData(path)
      return { ...data, path, filePath: path, name: entry.name, kind: 'project' }
    } catch (error) {
      return {
        kind: 'corrupt',
        path,
        filePath: path,
        name: entry.name,
        error: error.message || 'Fichier illisible',
      }
    }
  }))

  return projets.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
}

export async function readProjet(path) {
  return readData(path)
}

export async function writeProjet(path, input) {
  const previous = await pathExists(path) ? await readData(path) : {}
  const data = dataForWrite(input, previous)
  await writeData(path, data)
  return { ...data, path, filePath: path, kind: 'project' }
}

export async function createProjet(workdir) {
  await ensureWorkdirAccess(workdir)
  await ensureDirectory(workdir)
  const data = normalizeData({
    id: uuid(),
    projet: {
      nom: '',
      naf: '',
      effectif: 0,
      ca: 0,
      surface: 0,
      annee: '2025',
      perimetre: 'controle_operationnel',
      ville: '',
      secteur: '',
      sites: [],
    },
    lignes: [],
    sectionsStatus: {},
    sectionsAssignees: {},
  })
  const path = await uniqueProjectPath(workdir, data.projet)
  return writeProjet(path, data)
}

async function uniqueProjectPath(workdir, projet) {
  const baseName = fileNameFor(projet)
  let path = await pathFor(workdir, baseName)
  let suffix = 2
  while (await pathExists(path)) {
    const withoutExtension = baseName.replace(/\.ocbilan\.json$/, '')
    path = await pathFor(workdir, `${withoutExtension}-${suffix++}.ocbilan.json`)
  }
  return path
}

function cloneData(data) {
  const clone = structuredClone(data)
  clone.id = uuid()
  clone.createdAt = new Date().toISOString()
  clone.updatedAt = clone.createdAt
  clone.sectionsStatus = {}
  clone.sectionsAssignees = {}
  clone.lignes = clone.lignes.map(ligne => ({ ...ligne, _key: uuid() }))
  return clone
}

export async function duplicateProjet(path) {
  const source = await readData(path)
  const workdir = path.slice(0, Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\')))
  const data = cloneData(source)
  const destination = await uniqueProjectPath(workdir, data.projet)
  return writeProjet(destination, data)
}

export async function trashProjet(path) {
  const workdir = path.slice(0, Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\')))
  const trashDir = await pathFor(workdir, '.corbeille')
  await ensureDirectory(trashDir)
  const name = path.split(/[\\/]/).pop()
  const destination = await pathFor(trashDir, `${Date.now()}-${name}`)
  await movePath(path, destination)
  return destination
}

export async function exportProjet(path, destination) {
  const data = await readData(path)
  await writeText(destination, `${JSON.stringify(data, null, 2)}\n`)
  return destination
}

export async function importProjet(workdir, sourcePath) {
  const imported = cloneData(await readData(sourcePath))
  const destination = await uniqueProjectPath(workdir, imported.projet)
  return writeProjet(destination, imported)
}

export async function readAllProjets(workdir) {
  return (await listProjets(workdir)).filter(projet => projet.kind === 'project')
}

async function customFactorsPath(workdir) {
  return pathFor(workdir, 'facteurs-custom.json')
}

export async function readFacteursCustom(workdir) {
  const path = await customFactorsPath(workdir)
  if (!(await pathExists(path))) return []
  try {
    const raw = JSON.parse(await readText(path))
    return Array.isArray(raw.facteurs) ? raw.facteurs : []
  } catch {
    return []
  }
}

export async function writeFacteursCustom(workdir, facteurs) {
  const path = await customFactorsPath(workdir)
  const data = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    app: APP_ID,
    factorsVersion: FACTORS_VERSION,
    updatedAt: new Date().toISOString(),
    facteurs,
  }
  await writeData(path, data)
}

export async function saveExportBytes(path, bytes) {
  if (isNative()) {
    await writeFile(path, bytes)
    return
  }
  const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('')
  const files = browserFiles()
  files[path] = btoa(binary)
  saveBrowserFiles(files)
}
