import { useState } from 'react'
import SaveIndicator from './SaveIndicator'

export default function Header({ currentView, setCurrentView, projet, saveStatus, onBackToList, onShowLegal, onChangeWorkdir }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const topNavItems = [
    { id: 'projet', label: 'Projet' },
    { id: 'collecte-energie', label: 'Collecte' },
    { id: 'avancement', label: 'Gestion de projet' },
    { id: 'facteurs', label: 'Facteurs' },
    { id: 'espace-travail', label: 'Espace de travail' },
    { id: 'resultats', label: 'Résultats' },
    { id: 'documentation', label: 'Documentation' },
  ]

  const isCollecte = currentView.startsWith('collecte-')
  const isResultats = currentView === 'resultats'

  const title = projet?.nom || ''

  return (
    <header className="flex justify-between items-center w-full px-8 py-4 sticky top-0 z-50 bg-surface relative">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-3">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="flex items-center justify-center w-8 h-8 hover:bg-surface-low transition-colors"
              title="Retour aux bilans"
            >
              <span className="material-symbols-outlined text-primary text-lg">arrow_back</span>
            </button>
          )}
          <img src="/logo-oct.svg" alt="Open Carbon Tool" className="h-7" />
          <span className="text-lg font-bold text-primary uppercase tracking-tighter font-headline">
            Open Carbon Tool{title ? ` — ${title}` : ''}
          </span>
        </div>
        <nav className="flex gap-8 items-center">
          {topNavItems.map(item => {
            const isActive =
              item.id === 'collecte-energie' ? isCollecte :
              item.id === 'resultats' ? isResultats :
              item.id === 'avancement' ? currentView === 'avancement' :
              item.id === 'facteurs' ? currentView === 'facteurs' :
              currentView === item.id

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`font-headline font-bold tracking-tight uppercase text-xs pb-1 transition-colors duration-200
                  ${isActive
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-secondary hover:text-primary'
                  }`}
              >
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4 relative">
        {saveStatus && <SaveIndicator status={saveStatus} />}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-8 h-8 bg-primary-container flex items-center justify-center text-on-primary text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined text-sm">more_vert</span>
        </button>
        {menuOpen && (
          <div className="absolute top-full right-0 mt-2 bg-surface-lowest border border-outline-variant/20 shadow-lg min-w-[200px] z-50">
            <div className="px-4 py-3 border-b border-surface-container">
              <p className="text-xs font-bold text-primary truncate">Open Carbon Tool</p>
              <p className="text-[10px] text-outline mt-1 truncate">Fichiers locaux</p>
            </div>
            {onChangeWorkdir && (
              <button
                onClick={() => { onChangeWorkdir(); setMenuOpen(false) }}
                className="w-full text-left px-4 py-3 text-xs font-bold text-secondary uppercase tracking-widest hover:bg-surface-low transition-colors flex items-center gap-2 border-b border-surface-container"
              >
                <span className="material-symbols-outlined text-sm">folder_open</span>
                Changer de dossier
              </button>
            )}
            {onShowLegal && (
              <button
                onClick={() => { onShowLegal(); setMenuOpen(false) }}
                className="w-full text-left px-4 py-3 text-xs font-bold text-secondary uppercase tracking-widest hover:bg-surface-low transition-colors flex items-center gap-2 border-b border-surface-container"
              >
                <span className="material-symbols-outlined text-sm">gavel</span>
                Mentions légales
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-surface-container h-[1px] w-full absolute bottom-0 left-0" />
    </header>
  )
}
