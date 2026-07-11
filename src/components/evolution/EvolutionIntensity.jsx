export default function EvolutionIntensity({ snapshots }) {
  if (snapshots.length === 0) return null

  return (
    <div className="bg-surface-lowest p-8 mb-8">
      <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-6">
        Intensité carbone
      </h3>

      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-primary">
            <th className="text-left text-[10px] font-bold text-outline uppercase tracking-widest pb-3">Année</th>
            <th className="text-right text-[10px] font-bold text-outline uppercase tracking-widest pb-3">Total tCO₂e</th>
            <th className="text-right text-[10px] font-bold text-outline uppercase tracking-widest pb-3">Effectif</th>
            <th className="text-right text-[10px] font-bold text-outline uppercase tracking-widest pb-3">tCO₂e/salarié</th>
            <th className="text-right text-[10px] font-bold text-outline uppercase tracking-widest pb-3">CA (k€)</th>
            <th className="text-right text-[10px] font-bold text-outline uppercase tracking-widest pb-3">tCO₂e/M€ CA</th>
          </tr>
        </thead>
        <tbody>
          {snapshots.map(s => {
            const perEmployee = s.effectif ? (s.total / s.effectif).toFixed(1) : '—'
            const perMEuro = s.ca ? ((s.total / s.ca) * 1000).toFixed(1) : '—'

            return (
              <tr key={s.annee} className="border-b border-surface-highest">
                <td className="py-3 text-sm font-headline font-bold text-primary">{s.annee}</td>
                <td className="py-3 text-sm font-headline font-bold text-primary text-right">{s.total.toFixed(1)}</td>
                <td className="py-3 text-sm text-secondary text-right">{s.effectif || '—'}</td>
                <td className="py-3 text-sm font-headline font-bold text-primary text-right">{perEmployee}</td>
                <td className="py-3 text-sm text-secondary text-right">{s.ca || '—'}</td>
                <td className="py-3 text-sm font-headline font-bold text-primary text-right">{perMEuro}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
