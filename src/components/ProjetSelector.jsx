import { useState, useEffect } from 'react'
import { open, save } from '@tauri-apps/plugin-dialog'
import { revealItemInDir } from '@tauri-apps/plugin-opener'
import {
  createProjet,
  duplicateProjet,
  exportProjet,
  importProjet,
  listProjets,
  trashProjet,
} from '../lib/store'

export default function ProjetSelector({ workdir, onSelectProjet, onBack, onChangeWorkdir }) {
  const [projets, setProjets] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listProjets(workdir)
      .then(data => { if (!cancelled) setProjets(data) })
      .catch(error => { if (!cancelled) setMessage({ type: 'error', text: error.message }) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [workdir])

  function refresh() {
    return listProjets(workdir).then(setProjets)
  }

  async function handleCreate() {
    setCreating(true)
    setMessage(null)
    try {
      const proj = await createProjet(workdir)
      onSelectProjet(proj.path)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error?.message || String(error) || 'Impossible de créer le bilan.',
      })
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(path) {
    setMessage(null)
    try {
      await trashProjet(path)
      await refresh()
    } catch (err) {
      setMessage({ type: 'error', text: `Le bilan n'a pas pu être archivé : ${err.message}` })
    }
    setConfirmDelete(null)
  }

  async function handleDuplicate(path) {
    try {
      const copy = await duplicateProjet(path)
      await refresh()
      onSelectProjet(copy.path)
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Impossible de dupliquer le bilan.' })
    }
  }

  async function handleImport() {
    try {
      const selected = await open({
        title: 'Importer un bilan Open Carbon Tool',
        multiple: false,
        filters: [{ name: 'Bilan Open Carbon Tool', extensions: ['json'] }],
      })
      if (!selected || Array.isArray(selected)) return
      await importProjet(workdir, selected)
      await refresh()
      setMessage({ type: 'success', text: 'Bilan importé dans ce dossier.' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Impossible d’importer ce fichier.' })
    }
  }

  async function handleExport(path) {
    try {
      const destination = await save({
        title: 'Exporter le bilan',
        defaultPath: path.split(/[\\/]/).pop(),
        filters: [{ name: 'Bilan Open Carbon Tool', extensions: ['json'] }],
      })
      if (!destination) return
      await exportProjet(path, destination)
      setMessage({ type: 'success', text: 'Bilan exporté.' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Impossible d’exporter ce fichier.' })
    }
  }

  async function handleReveal(path) {
    try {
      await revealItemInDir(path)
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Impossible de révéler ce fichier.' })
    }
  }

  const yearCounts = projets
    .filter(projet => projet.kind === 'project')
    .reduce((counts, projet) => {
      counts[projet.projet.annee] = (counts[projet.projet.annee] || 0) + 1
      return counts
    }, {})
  const duplicatedYears = Object.entries(yearCounts)
    .filter(([, count]) => count > 1)
    .map(([year]) => year)

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary animate-pulse mx-auto mb-4" />
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-8 py-16">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-8">
          <button
              onClick={onBack}
              className="flex items-center justify-center w-8 h-8 hover:bg-surface-low transition-colors"
            title="Changer de dossier"
            >
              <span className="material-symbols-outlined text-primary text-lg">arrow_back</span>
            </button>
            <img src="/logo-oct.svg" alt="Open Carbon Tool" className="h-7" />
            <span className="text-lg font-bold text-primary uppercase tracking-tighter font-headline">
              Open Carbon Tool
            </span>
          </div>
          <div className="h-[2px] w-12 bg-primary mb-6" />
          <h1 className="text-5xl font-headline font-bold text-primary tracking-tight leading-none mb-4">
            Vos bilans
          </h1>
          <p className="text-secondary max-w-lg leading-relaxed">
            Chaque bilan est un fichier JSON lisible sur votre disque. Le dossier de travail actuel est :
          </p>
          <code className="block mt-3 text-xs text-primary break-all">{workdir}</code>
        </header>

        {message && (
          <div className={`mb-6 px-6 py-4 flex items-center gap-3 ${message.type === 'error' ? 'bg-error text-on-primary' : 'bg-primary text-on-primary'}`}>
            <span className="material-symbols-outlined text-sm">{message.type === 'error' ? 'error' : 'check_circle'}</span>
            <span className="text-xs font-bold uppercase tracking-widest">{message.text}</span>
          </div>
        )}
        {duplicatedYears.length > 0 && (
          <div className="mb-6 bg-accent-warm text-on-primary px-6 py-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-sm">warning</span>
            <span className="text-xs font-bold uppercase tracking-widest">
              Plusieurs bilans partagent l’année {duplicatedYears.join(', ')}. L’onglet Évolution en conservera un seul par année.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center justify-center gap-3 bg-primary text-on-primary px-6 py-4 font-headline font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            {creating ? 'Création...' : 'Nouveau bilan'}
          </button>
          <button
            onClick={handleImport}
            className="flex items-center justify-center gap-3 bg-surface-highest text-primary px-6 py-4 font-headline font-bold text-xs uppercase tracking-widest hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-sm">upload_file</span>
            Importer
          </button>
          <button
            onClick={onChangeWorkdir}
            className="flex items-center justify-center gap-3 bg-surface-highest text-primary px-6 py-4 font-headline font-bold text-xs uppercase tracking-widest hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-sm">folder_open</span>
            Changer de dossier
          </button>
        </div>

        {projets.length === 0 ? (
          <div className="bg-surface-lowest p-12 border-t-[3px] border-primary-container text-center">
            <span className="material-symbols-outlined text-4xl text-primary-container/30 mb-4 block">eco</span>
            <p className="text-secondary text-sm">
              Aucun bilan pour le moment. Créez votre premier bilan carbone.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {projets.map(proj => (
              proj.kind === 'corrupt' ? (
                <div key={proj.path} className="bg-error text-on-primary border-t-[3px] border-error px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-headline font-bold">{proj.name}</p>
                      <p className="text-xs mt-1 opacity-80">{proj.error}</p>
                    </div>
                    <button
                      onClick={() => handleReveal(proj.path)}
                      className="flex items-center gap-2 bg-on-primary/20 px-3 py-2 text-[10px] font-bold uppercase tracking-widest"
                    >
                      <span className="material-symbols-outlined text-sm">folder_open</span>
                      Révéler
                    </button>
                  </div>
                </div>
              ) : (
              <div
                key={proj.path}
                className="bg-surface-lowest border-t-[3px] border-primary-container hover:border-primary transition-colors group"
              >
                <div className="flex items-center justify-between p-6">
                  <button
                    onClick={() => onSelectProjet(proj.path)}
                    className="flex-1 text-left"
                  >
                    <h3 className="font-headline text-xl font-bold text-primary tracking-tight group-hover:underline">
                      {proj.projet.nom || 'Bilan sans nom'}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      {proj.projet.annee && (
                        <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                          Année {proj.projet.annee}
                        </span>
                      )}
                      <span className="text-[10px] text-outline">
                        Modifié le {new Date(proj.updatedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectProjet(proj.path)}
                      className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      Ouvrir
                    </button>

                    {confirmDelete === proj.path ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(proj.path)}
                          className="flex items-center gap-1 bg-error text-on-primary px-3 py-2 font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="flex items-center gap-1 bg-surface-highest text-secondary px-3 py-2 font-bold text-[10px] uppercase tracking-widest hover:bg-surface-container transition-all"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(proj.path)}
                        className="flex items-center gap-1 text-secondary hover:text-error px-2 py-2 transition-colors"
                        title="Archiver"
                      >
                        <span className="material-symbols-outlined text-sm">archive</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDuplicate(proj.path)}
                      className="flex items-center gap-1 text-secondary hover:text-primary px-2 py-2 transition-colors"
                      title="Dupliquer"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                    </button>
                    <button
                      onClick={() => handleExport(proj.path)}
                      className="flex items-center gap-1 text-secondary hover:text-primary px-2 py-2 transition-colors"
                      title="Exporter"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                    </button>
                    <button
                      onClick={() => handleReveal(proj.path)}
                      className="flex items-center gap-1 text-secondary hover:text-primary px-2 py-2 transition-colors"
                      title="Révéler dans le Finder"
                    >
                      <span className="material-symbols-outlined text-sm">folder_open</span>
                    </button>
                  </div>
                </div>
              </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
