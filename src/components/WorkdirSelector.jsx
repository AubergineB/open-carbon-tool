import { useState } from 'react'
import { ensureDefaultWorkdir, pickWorkdir } from '../lib/store'

export default function WorkdirSelector({ onSelected, onShowLegal }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function chooseWorkdir(useDefault = false) {
    setLoading(true)
    setError(null)
    try {
      const path = useDefault ? await ensureDefaultWorkdir() : await pickWorkdir()
      if (path) onSelected(path)
    } catch (selectionError) {
      setError(selectionError.message || 'Impossible d’ouvrir ce dossier.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-12">
          <img src="/logo-oct.svg" alt="Open Carbon Tool" className="h-8" />
          <span className="text-lg font-bold text-primary uppercase tracking-tighter font-headline">
            Open Carbon Tool
          </span>
        </div>

        <div className="h-[2px] w-12 bg-primary mb-6" />
        <h1 className="text-5xl font-headline font-bold text-primary tracking-tight leading-none mb-6">
          Votre espace de travail
        </h1>
        <p className="text-secondary max-w-xl leading-relaxed mb-10">
          Vos bilans sont des fichiers JSON sur votre disque. Aucune donnée ne quitte votre ordinateur.
          Placez ce dossier dans un Drive partagé pour travailler à plusieurs.
        </p>

        {error && (
          <div className="bg-error text-on-primary px-6 py-4 mb-6 text-xs font-bold uppercase tracking-widest">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => chooseWorkdir(true)}
            disabled={loading}
            className="bg-primary text-on-primary px-6 py-5 font-headline font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Dossier par défaut
          </button>
          <button
            onClick={() => chooseWorkdir(false)}
            disabled={loading}
            className="bg-surface-highest text-primary px-6 py-5 font-headline font-bold text-xs uppercase tracking-widest hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Choisir un dossier
          </button>
        </div>

        <div className="mt-10 border-t border-surface-container pt-6 flex items-center justify-between">
          <p className="text-[10px] text-outline uppercase tracking-widest">
            Fichiers ouverts · lisibles · exportables
          </p>
          {onShowLegal && (
            <button
              onClick={onShowLegal}
              className="text-[10px] text-outline hover:text-primary uppercase tracking-widest transition-colors"
            >
              Mentions légales
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
