import { formatCO2 } from '../../utils/formatEmission'

const scopeColors = { scope1: '#001D17', scope2: '#1B7A5A', scope3: '#FF5C67' }

export default function EvolutionStackedBar({ snapshots }) {
  if (snapshots.length === 0) return null

  const maxTotal = Math.max(...snapshots.map(s => s.total), 0.001)

  return (
    <div className="bg-surface-lowest p-8 mb-8">
      <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-6">
        Émissions par année
      </h3>

      <div className="flex items-end gap-2 mb-4">
        {['Scope 1', 'Scope 2', 'Scope 3'].map((label, i) => (
          <div key={label} className="flex items-center gap-1.5 mr-4">
            <div className="w-3 h-3" style={{ backgroundColor: Object.values(scopeColors)[i] }} />
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {snapshots.map(s => {
          const widthPct = maxTotal > 0 ? (s.total / maxTotal) * 100 : 0
          const s1Pct = s.total > 0 ? (s.scope1 / s.total) * 100 : 0
          const s2Pct = s.total > 0 ? (s.scope2 / s.total) * 100 : 0
          const s3Pct = s.total > 0 ? (s.scope3 / s.total) * 100 : 0

          return (
            <div key={s.annee} className="flex items-center gap-4">
              <span className="w-12 text-sm font-headline font-bold text-primary text-right">{s.annee}</span>
              <div className="flex-1">
                <div className="flex h-8" style={{ width: `${widthPct}%`, minWidth: '4px' }}>
                  {s1Pct > 0 && <div style={{ width: `${s1Pct}%`, backgroundColor: scopeColors.scope1 }} />}
                  {s2Pct > 0 && <div style={{ width: `${s2Pct}%`, backgroundColor: scopeColors.scope2 }} />}
                  {s3Pct > 0 && <div style={{ width: `${s3Pct}%`, backgroundColor: scopeColors.scope3 }} />}
                </div>
              </div>
              <span className="text-sm font-headline font-bold text-primary w-24 text-right">
                {formatCO2(s.total)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
