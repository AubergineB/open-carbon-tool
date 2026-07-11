export default function EvolutionDecoupling({ snapshots }) {
  if (snapshots.length < 2) return null

  const first = snapshots[0]
  const last = snapshots[snapshots.length - 1]

  const hasCA = first.ca && last.ca && first.ca > 0 && last.ca > 0
  const hasEmissions = first.total > 0 && last.total > 0
  if (!hasCA || !hasEmissions) {
    return (
      <div className="bg-surface-lowest p-8 mb-8">
        <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-4">
          Découplage
        </h3>
        <p className="text-xs text-outline italic">
          Renseignez le chiffre d'affaires et au moins une émission sur 2 années pour voir l'indicateur de découplage.
        </p>
      </div>
    )
  }

  const emissionsDelta = ((last.total - first.total) / first.total) * 100
  const caDelta = ((last.ca - first.ca) / first.ca) * 100

  let label, color, icon
  if (emissionsDelta < 0 && caDelta >= 0) {
    label = 'Découplage absolu'
    color = 'text-primary'
    icon = 'trending_down'
  } else if (emissionsDelta > 0 && caDelta > 0 && emissionsDelta < caDelta) {
    label = 'Découplage relatif'
    color = 'text-accent-warm'
    icon = 'trending_flat'
  } else {
    label = 'Pas de découplage'
    color = 'text-error'
    icon = 'trending_up'
  }

  return (
    <div className="bg-surface-lowest p-8 mb-8">
      <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-6">
        Découplage émissions / activité
      </h3>

      <div className="flex items-center gap-4 mb-6">
        <span className={`material-symbols-outlined text-3xl ${color}`}>{icon}</span>
        <div>
          <p className={`text-xl font-headline font-black ${color}`}>{label}</p>
          <p className="text-xs text-outline">{first.annee} → {last.annee}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Émissions</p>
          <p className={`text-lg font-headline font-bold ${emissionsDelta < 0 ? 'text-primary' : 'text-error'}`}>
            {emissionsDelta > 0 ? '+' : ''}{emissionsDelta.toFixed(0)}%
          </p>
          <div className="h-1 bg-surface-highest mt-2">
            <div
              className={`h-full ${emissionsDelta < 0 ? 'bg-primary' : 'bg-error'}`}
              style={{ width: `${Math.min(Math.abs(emissionsDelta), 100)}%` }}
            />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Chiffre d'affaires</p>
          <p className={`text-lg font-headline font-bold ${caDelta >= 0 ? 'text-primary' : 'text-error'}`}>
            {caDelta > 0 ? '+' : ''}{caDelta.toFixed(0)}%
          </p>
          <div className="h-1 bg-surface-highest mt-2">
            <div
              className={`h-full ${caDelta >= 0 ? 'bg-primary' : 'bg-error'}`}
              style={{ width: `${Math.min(Math.abs(caDelta), 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
