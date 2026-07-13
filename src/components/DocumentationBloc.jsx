import { useState } from 'react'

export default function DocumentationBloc({ bloc }) {
  const [copied, setCopied] = useState(false)

  if (bloc.type === 'p') {
    return <p className="text-sm text-secondary leading-relaxed mb-4">{bloc.texte}</p>
  }
  if (bloc.type === 'sousTitre') {
    return (
      <h3 className="font-headline font-bold uppercase text-sm text-primary tracking-tight mt-6 mb-3">
        {bloc.texte}
      </h3>
    )
  }
  if (bloc.type === 'liste') {
    return (
      <ul className="mb-4 space-y-2">
        {bloc.items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 bg-primary-container mt-1.5 shrink-0" />
            <span className="text-sm text-secondary leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    )
  }
  if (bloc.type === 'encadre') {
    const borderColor = bloc.ton === 'alerte' ? 'border-accent-red' : 'border-primary-container'
    return (
      <div className={`bg-surface-low p-5 border-l-[3px] ${borderColor} mb-4`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">{bloc.titre}</p>
        <p className="text-sm text-secondary leading-relaxed">{bloc.texte}</p>
      </div>
    )
  }
  if (bloc.type === 'prompt') {
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(bloc.texte)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
      } catch {
        setCopied(false)
      }
    }

    return (
      <div className="bg-surface-low border-l-[3px] border-primary-container p-5 mb-4">
        {bloc.titre && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">{bloc.titre}</p>
        )}
        <pre className="whitespace-pre-wrap text-xs text-secondary leading-relaxed font-body">{bloc.texte}</pre>
        <button
          type="button"
          onClick={handleCopy}
          className="mt-4 flex items-center gap-2 bg-surface-highest text-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="Copier ce prompt"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">content_copy</span>
          {copied ? 'Copié' : 'Copier le prompt'}
        </button>
      </div>
    )
  }
  if (bloc.type === 'liens') {
    return (
      <ul className="space-y-3 my-4">
        {bloc.items.map((item, i) => (
          <li key={i} className="border-l-[3px] border-primary-container pl-4">
            <a href={item.url} target="_blank" rel="noreferrer noopener" className="text-sm font-bold text-primary underline underline-offset-2 hover:text-on-primary-container">
              {item.titre}
            </a>
            <p className="text-xs text-secondary leading-relaxed mt-0.5">{item.description}</p>
          </li>
        ))}
      </ul>
    )
  }
  return null
}
