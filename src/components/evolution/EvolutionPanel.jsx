import EvolutionDeltaCards from './EvolutionDeltaCards'
import EvolutionStackedBar from './EvolutionStackedBar'
import EvolutionIntensity from './EvolutionIntensity'
import EvolutionDecoupling from './EvolutionDecoupling'

export default function EvolutionPanel({ snapshots, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-outline animate-spin text-2xl">progress_activity</span>
        <span className="ml-3 text-sm text-outline">Chargement des bilans...</span>
      </div>
    )
  }

  if (snapshots.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-outline/30 text-5xl mb-4 block">timeline</span>
        <p className="text-sm text-outline">Aucune donnée disponible.</p>
      </div>
    )
  }

  if (snapshots.length === 1) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-primary/30 text-5xl mb-4 block">timeline</span>
        <p className="text-lg font-headline font-bold text-primary mb-2">Premier bilan en cours</p>
        <p className="text-sm text-secondary max-w-md mx-auto">
          Créez un second bilan sur une autre année pour commencer le suivi. L'outil comparera automatiquement vos émissions d'une année sur l'autre.
        </p>
      </div>
    )
  }

  return (
    <div>
      <EvolutionDeltaCards snapshots={snapshots} />
      <EvolutionStackedBar snapshots={snapshots} />
      <EvolutionIntensity snapshots={snapshots} />
      <EvolutionDecoupling snapshots={snapshots} />
    </div>
  )
}
