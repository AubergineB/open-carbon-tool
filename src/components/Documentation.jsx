import { useEffect, useRef, useState } from 'react'
import documentationSections from '../data/documentationContent'
import DocumentationBloc from './DocumentationBloc'

export default function Documentation({ onNavigate }) {
  const [activeId, setActiveId] = useState(documentationSections[0]?.id)
  const sectionRefs = useRef({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-10% 0px -80% 0px' },
    )
    documentationSections.forEach(section => {
      const el = sectionRefs.current[section.id]
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  function handleNavClick(id) {
    const el = sectionRefs.current[id]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex gap-16 px-8 pt-4 pb-16 max-w-5xl mx-auto">
      <aside className="w-56 shrink-0">
        <nav className="sticky top-24 flex flex-col gap-1">
          {documentationSections.map(section => (
            <button
              key={section.id}
              onClick={() => handleNavClick(section.id)}
              className={`text-left text-[10px] font-bold uppercase tracking-widest py-1.5 pl-3 border-l-2 transition-colors
                ${activeId === section.id
                  ? 'text-primary border-primary'
                  : 'text-outline border-surface-container hover:text-primary'
                }`}
            >
              {section.titre}
            </button>
          ))}
        </nav>
      </aside>

      <div className="max-w-3xl flex-1">
        <div className="mb-10 border-l-[3px] border-primary-container bg-surface-low p-5">
          <p className="text-sm text-secondary leading-relaxed mb-4">
            Une question précise sur la comptabilité carbone ?
          </p>
          <button
            type="button"
            onClick={() => onNavigate?.('faq')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary underline underline-offset-4 hover:text-on-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Voir la FAQ
            <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
          </button>
        </div>
        {documentationSections.map(section => (
          <section
            key={section.id}
            id={section.id}
            ref={el => { sectionRefs.current[section.id] = el }}
            className="mb-16 scroll-mt-24"
          >
            <h2 className="flex items-center gap-3 font-headline font-bold uppercase text-xl text-primary tracking-tight mb-6">
              <span className="material-symbols-outlined text-2xl">{section.icon}</span>
              {section.titre}
            </h2>
            {section.blocs.map((bloc, idx) => (
              <DocumentationBloc key={idx} bloc={bloc} />
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
