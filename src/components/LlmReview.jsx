import { useMemo, useRef, useState } from 'react'
import { isTauri } from '@tauri-apps/api/core'
import postesEmission from '../data/postesEmission'
import { getFactorsByCategory } from '../data/emissionFactors'
import {
  LLM_PRECISIONS,
  validateLlmProposition,
} from '../utils/llmTemplate'

function activePostes(context = {}) {
  const allowed = Array.isArray(context.allowedPosteIds)
    ? new Set(context.allowedPosteIds)
    : null
  return postesEmission.filter(poste => (
    ['active', 'confirmed'].includes(context.sectionsStatus?.[poste.id])
    && (!allowed || allowed.has(poste.id))
  ))
}

function selectableFactors(posteId, context = {}) {
  const poste = postesEmission.find(candidate => candidate.id === posteId)
  if (!poste) return []
  const archivedCatalogIds = new Set(context.archivedCatalogIds || [])
  const catalog = getFactorsByCategory(poste.categorieFE)
    .filter(factor => !factor.nonSelectable && !archivedCatalogIds.has(factor.id))
  const catalogIds = new Set(catalog.map(factor => factor.id))
  const custom = (context.facteursCustom || [])
    .filter(factor => factor.categorieFE === poste.categorieFE
      && factor.archived !== true
      && !catalogIds.has(factor.id))
  return [...catalog, ...custom]
}

function initialEditor(review, context) {
  const proposition = review.propositionNormalisee || review.proposition || {}
  const postes = activePostes(context)
  const posteId = postes.some(poste => poste.id === proposition.posteId)
    ? proposition.posteId
    : postes[0]?.id || ''
  const factors = selectableFactors(posteId, context)
  const facteurId = factors.some(factor => factor.id === proposition.facteurId)
    ? proposition.facteurId
    : ''
  const facteur = factors.find(factor => factor.id === facteurId)
  return {
    posteId,
    facteurId,
    valeur: proposition.valeur ?? '',
    unite: facteur?.unite || proposition.unite || '',
    precision: proposition.precision || 'P1',
    source: proposition.source || '',
    commentaire: proposition.commentaire || proposition.justification || '',
    annee: proposition.annee ?? '',
    site: proposition.site || '',
  }
}

function ReviewBadge({ statut }) {
  const config = {
    'a-revoir': { label: 'À revoir', className: 'bg-surface-highest text-secondary' },
    accepte: { label: 'Acceptée', className: 'bg-primary text-on-primary' },
    rejete: { label: 'Rejetée', className: 'bg-surface-container text-outline' },
  }[statut] || { label: 'À revoir', className: 'bg-surface-highest text-secondary' }
  return (
    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${config.className}`}>
      {config.label}
    </span>
  )
}

export function LlmFilePicker({ onImport, dark = false }) {
  const inputRef = useRef(null)

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) onImport?.(file)
  }

  function handleClick() {
    if (isTauri()) onImport?.()
    else inputRef.current?.click()
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Choisir un fichier JSON OCLLM"
      />
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-2 px-5 py-3 font-bold text-[10px] uppercase tracking-widest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          dark
            ? 'border border-surface/60 text-surface hover:bg-surface/10'
            : 'border-2 border-primary text-primary hover:bg-surface-low'
        }`}
      >
        <span className="material-symbols-outlined text-sm" aria-hidden="true">upload_file</span>
        Importer un JSON rempli
      </button>
    </>
  )
}

function Editor({ review, context, onSave, onCancel }) {
  const [values, setValues] = useState(() => initialEditor(review, context))
  const postes = useMemo(() => activePostes(context), [context])
  const factors = useMemo(
    () => selectableFactors(values.posteId, context),
    [values.posteId, context],
  )

  function update(field, value) {
    setValues(previous => ({ ...previous, [field]: value }))
  }

  function handlePosteChange(event) {
    const posteId = event.target.value
    const firstFactor = selectableFactors(posteId, context)[0]
    setValues(previous => ({
      ...previous,
      posteId,
      facteurId: firstFactor?.id || '',
      unite: firstFactor?.unite || '',
    }))
  }

  function handleFactorChange(event) {
    const facteurId = event.target.value
    const factor = factors.find(candidate => candidate.id === facteurId)
    setValues(previous => ({
      ...previous,
      facteurId,
      unite: factor?.unite || '',
    }))
  }

  return (
    <form
      className="mt-6 bg-surface-low p-5 border-l-[3px] border-primary-container"
      onSubmit={event => {
        event.preventDefault()
        onSave({
          ...values,
          valeur: values.valeur === '' ? '' : Number(values.valeur),
        })
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <label className="space-y-2">
          <span className="block text-[10px] font-bold text-outline uppercase tracking-widest">Poste actif</span>
          <select
            value={values.posteId}
            onChange={handlePosteChange}
            className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-sm"
          >
            <option value="">— Sélectionner —</option>
            {postes.map(poste => <option key={poste.id} value={poste.id}>{poste.nom}</option>)}
          </select>
        </label>
        <label className="space-y-2">
          <span className="block text-[10px] font-bold text-outline uppercase tracking-widest">Facteur actif</span>
          <select
            value={values.facteurId}
            onChange={handleFactorChange}
            className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-sm"
          >
            <option value="">— Sélectionner —</option>
            {factors.map(factor => (
              <option key={factor.id} value={factor.id}>{factor.nom} ({factor.unite})</option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="block text-[10px] font-bold text-outline uppercase tracking-widest">Valeur numérique</span>
          <input
            type="number"
            min="0"
            step="any"
            value={values.valeur}
            onChange={event => update('valeur', event.target.value === '' ? '' : Number(event.target.value))}
            className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-sm"
          />
        </label>
        <label className="space-y-2">
          <span className="block text-[10px] font-bold text-outline uppercase tracking-widest">Unité exacte du facteur</span>
          <input
            value={values.unite}
            readOnly
            aria-readonly="true"
            className="w-full bg-surface-container border-0 border-b-2 border-surface-highest px-0 py-2 text-sm text-secondary"
          />
        </label>
        <label className="space-y-2">
          <span className="block text-[10px] font-bold text-outline uppercase tracking-widest">Précision</span>
          <select
            value={values.precision}
            onChange={event => update('precision', event.target.value)}
            className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-sm"
          >
            {LLM_PRECISIONS.map(precision => <option key={precision} value={precision}>{precision}</option>)}
          </select>
        </label>
        <label className="space-y-2">
          <span className="block text-[10px] font-bold text-outline uppercase tracking-widest">Année / période</span>
          <input
            value={values.annee}
            onChange={event => update('annee', event.target.value)}
            placeholder={context.projet?.annee || 'Exercice du projet'}
            className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-sm"
          />
        </label>
        <label className="space-y-2">
          <span className="block text-[10px] font-bold text-outline uppercase tracking-widest">Source / justificatif</span>
          <input
            value={values.source}
            onChange={event => update('source', event.target.value)}
            className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-sm"
            placeholder="Facture, relevé..."
          />
        </label>
        {Array.isArray(context.projet?.sites) && context.projet.sites.length > 0 && (
          <label className="space-y-2">
            <span className="block text-[10px] font-bold text-outline uppercase tracking-widest">Site</span>
            <select
              value={values.site}
              onChange={event => update('site', event.target.value)}
              className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-sm"
            >
              <option value="">— Non assigné —</option>
              {context.projet.sites.map(site => <option key={site} value={site}>{site}</option>)}
            </select>
          </label>
        )}
        <label className="space-y-2 md:col-span-2">
          <span className="block text-[10px] font-bold text-outline uppercase tracking-widest">Justification / commentaire</span>
          <textarea
            value={values.commentaire}
            onChange={event => update('commentaire', event.target.value)}
            rows="2"
            className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-sm"
          />
        </label>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          className="bg-primary text-on-primary px-5 py-2 font-bold text-[10px] uppercase tracking-widest hover:opacity-90"
        >
          Appliquer la correction
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-secondary px-4 py-2 font-bold text-[10px] uppercase tracking-widest hover:text-primary"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}

function ReviewRow({ review, context, onDecision, onCorrect }) {
  const [editing, setEditing] = useState(false)
  const proposition = review.propositionNormalisee || review.proposition || {}

  function handleSaveCorrection(values) {
    onCorrect(review.id, values)
    setEditing(false)
  }

  return (
    <article className="bg-surface-lowest border-t-[3px] border-primary-container p-6" aria-label={`Proposition ${review.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Ligne {review.id}</p>
          <h3 className="font-headline text-lg font-bold text-primary">
            {review.poste?.nom || proposition.posteId || 'Poste non reconnu'}
          </h3>
        </div>
        <ReviewBadge statut={review.statut} />
      </div>

      <dl className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
        <div>
          <dt className="text-[10px] font-bold text-outline uppercase tracking-widest">Facteur</dt>
          <dd className="mt-1 text-primary">{review.facteur?.nom || proposition.facteurId || '—'}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold text-outline uppercase tracking-widest">Valeur</dt>
          <dd className="mt-1 text-primary">{String(proposition.valeur ?? '—')}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold text-outline uppercase tracking-widest">Unité</dt>
          <dd className="mt-1 text-primary">{proposition.unite || '—'}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold text-outline uppercase tracking-widest">Précision</dt>
          <dd className="mt-1 text-primary">{proposition.precision || 'P1'}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold text-outline uppercase tracking-widest">Source</dt>
          <dd className="mt-1 text-primary break-words">{proposition.source || 'Absente'}</dd>
        </div>
      </dl>

      {review.erreurs.length > 0 && (
        <div className="mt-5 bg-error/10 border-l-[3px] border-error p-4" role="alert">
          <p className="text-[10px] font-bold text-error uppercase tracking-widest mb-2">Correction obligatoire</p>
          <ul className="space-y-1">
            {review.erreurs.map((erreur, index) => <li key={index} className="text-xs text-error">{erreur}</li>)}
          </ul>
        </div>
      )}
      {review.avertissements.length > 0 && (
        <div className="mt-4 bg-accent-warm/10 border-l-[3px] border-accent-warm p-4">
          <p className="text-[10px] font-bold text-accent-warm uppercase tracking-widest mb-2">Avertissements à confirmer</p>
          <ul className="space-y-1">
            {review.avertissements.map((warning, index) => <li key={index} className="text-xs text-secondary">{warning}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onDecision(review.id, 'accepte')}
          disabled={review.erreurs.length > 0}
          className="bg-primary text-on-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Accepter
        </button>
        <button
          type="button"
          onClick={() => setEditing(value => !value)}
          className="border-2 border-primary text-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-surface-low"
        >
          Corriger
        </button>
        <button
          type="button"
          onClick={() => onDecision(review.id, 'rejete')}
          className="text-secondary px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:text-error"
        >
          Rejeter
        </button>
      </div>

      {editing && (
        <Editor
          review={review}
          context={context}
          onSave={handleSaveCorrection}
          onCancel={() => setEditing(false)}
        />
      )}
    </article>
  )
}

export default function LlmReview({
  reviewFile,
  context = {},
  onClose,
  onCommit,
}) {
  const [reviews, setReviews] = useState(reviewFile?.reviews || [])

  function handleDecision(id, statut) {
    setReviews(previous => previous.map(review => (
      review.id === id ? { ...review, statut } : review
    )))
  }

  function handleCorrection(id, values) {
    setReviews(previous => previous.map(review => {
      if (review.id !== id) return review
      return {
        ...validateLlmProposition(values, context, id),
        id,
        statut: 'a-revoir',
      }
    }))
  }

  const undecided = reviews.some(review => !['accepte', 'rejete'].includes(review.statut))
  const acceptedWithErrors = reviews.some(review => review.statut === 'accepte' && review.erreurs.length > 0)
  const acceptedCount = reviews.filter(review => review.statut === 'accepte').length
  const canCommit = reviews.length > 0 && acceptedCount > 0 && !undecided && !acceptedWithErrors

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-outline text-xs font-bold uppercase tracking-tighter mb-2">
            <span>Collecte assistée par IA</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary">Revue humaine</span>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-black text-primary tracking-tighter uppercase leading-none">
            Revue <span className="text-on-primary-container">des propositions</span>
          </h1>
          <p className="mt-4 text-secondary max-w-2xl leading-relaxed">
            Fichier : {reviewFile?.sourceFileName || 'JSON local'} · schéma {reviewFile?.data?.schemaVersion} · facteurs {reviewFile?.data?.factorsVersion}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 text-secondary px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:text-primary"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">close</span>
          Fermer sans importer
        </button>
      </header>

      {reviewFile?.globalWarnings?.length > 0 && (
        <div className="mb-8 bg-accent-warm/10 border-l-[3px] border-accent-warm p-5">
          <p className="text-[10px] font-bold text-accent-warm uppercase tracking-widest mb-2">Informations du fichier</p>
          <ul className="space-y-1">
            {reviewFile.globalWarnings.map((warning, index) => <li key={index} className="text-sm text-secondary">{warning}</li>)}
          </ul>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-secondary">
          {reviews.length} proposition{reviews.length > 1 ? 's' : ''} · {acceptedCount} acceptée{acceptedCount > 1 ? 's' : ''}
        </p>
        <p className="text-[10px] text-outline uppercase tracking-widest">
          Une décision est obligatoire pour chaque ligne
        </p>
      </div>

      <div className="space-y-5">
        {reviews.length > 0 ? reviews.map(review => (
          <ReviewRow
            key={review.id}
            review={review}
            context={context}
            onDecision={handleDecision}
            onCorrect={handleCorrection}
          />
        )) : (
          <div className="border-2 border-dashed border-outline-variant/30 p-12 text-center">
            <p className="text-sm text-secondary">Aucune proposition à relire.</p>
          </div>
        )}
      </div>

      <footer className="mt-10 pt-6 border-t-2 border-primary flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-secondary max-w-xl">
          Les lignes existantes sont conservées. Le calcul sera refait localement
          avec le facteur sélectionné avant l’ajout.
        </p>
        <button
          type="button"
          disabled={!canCommit}
          onClick={() => onCommit?.({
            reviews,
            sourceFileName: reviewFile?.sourceFileName,
            sourceText: reviewFile?.sourceText,
            sourceData: reviewFile?.data,
          })}
          className="bg-primary text-on-primary px-6 py-3 font-headline font-bold text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Importer les lignes acceptées
        </button>
      </footer>
      {!canCommit && reviews.length > 0 && (
        <p className="mt-3 text-right text-[10px] font-bold text-error uppercase tracking-widest" role="status">
          {acceptedWithErrors
            ? 'Une ligne acceptée contient encore une erreur.'
            : undecided
              ? 'Décidez du sort de chaque ligne avant l’import.'
              : 'Aucune ligne acceptée à importer.'}
        </p>
      )}
    </div>
  )
}
