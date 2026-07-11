export default function Sidebar({ currentView, setCurrentView, projet }) {
  const navItems = [
    { id: 'collecte-energie', label: 'Énergie', icon: 'bolt' },
    { id: 'collecte-indirect', label: 'Sources indirectes', icon: 'local_shipping' },
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col pt-20 bg-surface-low z-40">
      {/* Projet info */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined">eco</span>
          </div>
          <div>
            <p className="font-headline font-black text-primary text-sm leading-none">
              {projet.nom || 'Nouveau projet'}
            </p>
            <p className="text-[10px] font-medium tracking-widest text-outline uppercase mt-1">
              Exercice {projet.annee || '2025'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-0">
        {navItems.map(item => {
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-medium tracking-wide transition-all duration-150 text-left
                ${isActive
                  ? 'bg-surface-container text-primary font-bold border-l-4 border-primary translate-x-1'
                  : 'text-secondary hover:bg-surface-container/50'
                }`}
            >
              <span
                className="material-symbols-outlined text-lg"
                style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto space-y-1">
        <button
          onClick={() => setCurrentView('resultats')}
          className="w-full bg-primary text-on-primary py-3 mb-4 font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Exporter le rapport
        </button>
      </div>
    </aside>
  )
}
