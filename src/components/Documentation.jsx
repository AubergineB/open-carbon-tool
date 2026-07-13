import { useEffect, useRef, useState } from 'react'
import documentationSections from '../data/documentationContent'

function Bloc({ bloc }) {
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
  return null
}

export default function Documentation() {
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
              <Bloc key={idx} bloc={bloc} />
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
