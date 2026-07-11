import { formatCO2 } from '../../utils/formatEmission'

export default function EvolutionDeltaCards({ snapshots }) {
  if (snapshots.length < 2) return null

  const current = snapshots[snapshots.length - 1]
  const previous = snapshots[snapshots.length - 2]

  const cards = [
    { label: 'Total', current: current.total, previous: previous.total },
    { label: 'Scope 1', current: current.scope1, previous: previous.scope1 },
    { label: 'Scope 2', current: current.scope2, previous: previous.scope2 },
    { label: 'Scope 3', current: current.scope3, previous: previous.scope3 },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map(card => {
        const delta = card.current - card.previous
        const deltaPct = card.previous > 0 ? ((delta / card.previous) * 100) : 0
        const isDown = delta < 0
        const isZero = Math.abs(delta) < 0.001

        return (
          <div key={card.label} className="bg-surface-lowest p-6 relative overflow-hidden">
            <div className={`absolute bottom-0 left-0 right-0 h-1 ${isZero ? 'bg-surface-highest' : isDown ? 'bg-primary' : 'bg-error'}`} />
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">{card.label}</p>
            <p className="text-2xl font-headline font-black text-primary">{formatCO2(card.current)}</p>
            {!isZero && (
              <div className={`flex items-center gap-1 mt-2 ${isDown ? 'text-primary' : 'text-error'}`}>
                <span className="material-symbols-outlined text-sm">
                  {isDown ? 'trending_down' : 'trending_up'}
                </span>
                <span className="text-xs font-bold">
                  {isDown ? '' : '+'}{delta.toFixed(1)} t ({deltaPct > 0 ? '+' : ''}{deltaPct.toFixed(0)}%)
                </span>
              </div>
            )}
            <p className="text-[10px] text-outline mt-1">{current.annee} vs {previous.annee}</p>
          </div>
        )
      })}
    </div>
  )
}
