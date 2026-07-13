import { useState } from 'react'
import faqItems, { faqIntro, faqOutro } from '../data/faqContent'
import DocumentationBloc from './DocumentationBloc'

export default function Faq({ onNavigate }) {
  const [openId, setOpenId] = useState(null)

  function handleToggle(id) {
    setOpenId(currentId => currentId === id ? null : id)
  }

  return (
    <div id="faq" className="w-full max-w-3xl mx-auto pb-16">
      <header className="mb-10 border-b-2 border-primary pb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-outline">RÉPONSES MÉTHODOLOGIQUES</p>
        <h1 className="font-headline font-bold uppercase text-3xl text-primary tracking-tight mt-2">FAQ</h1>
        <p className="text-sm text-secondary leading-relaxed mt-3">
          Les réponses aux questions les plus fréquentes sur la comptabilité carbone et la lecture des résultats.
        </p>
      </header>

      <DocumentationBloc bloc={faqIntro} />

      <div className="space-y-3" aria-label="Questions fréquentes">
        {faqItems.map(item => {
          const isOpen = openId === item.id
          const buttonId = `faq-question-${item.id}`
          const panelId = `faq-panel-${item.id}`

          return (
            <article key={item.id} className="bg-surface-low border-t-[3px] border-primary-container">
              <h2>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => handleToggle(item.id)}
                  className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span className="font-headline font-bold uppercase text-sm text-primary tracking-tight">
                    {item.question}
                  </span>
                  <span className="material-symbols-outlined shrink-0 text-primary" aria-hidden="true">
                    {isOpen ? 'remove' : 'add'}
                  </span>
                </button>
              </h2>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
                className="border-t border-surface-container px-5 py-5"
              >
                {item.blocs.map((bloc, index) => (
                  <DocumentationBloc key={index} bloc={bloc} />
                ))}
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-8">
        <DocumentationBloc bloc={faqOutro} />
      </div>

      <div className="mt-10 border-t-2 border-primary pt-6">
        <p className="text-sm text-secondary leading-relaxed mb-4">
          Pour approfondir la méthode et les étapes du bilan, consultez la Documentation.
        </p>
        <button
          type="button"
          onClick={() => onNavigate?.('documentation')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary underline underline-offset-4 hover:text-on-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Voir la Documentation
          <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}
