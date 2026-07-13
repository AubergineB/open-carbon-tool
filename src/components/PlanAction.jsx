import { useMemo } from 'react'
import { agregerParScope, getTopPostes } from '../utils/calculEngine'
import { formatNombre } from '../utils/formatEmission'

// Suggestions de leviers de réduction par catégorie
const LEVIERS = {
  'Émissions directes — Sources fixes de combustion': {
    actions: [
      { titre: 'Isolation thermique des locaux', impact: 'moyen', description: 'Réduction de 20-40% de la consommation de chauffage', cout: '€€', priorite: true },
      { titre: 'Pompe à chaleur (PAC)', impact: 'fort', description: 'Remplacement chaudière gaz par PAC air/eau', cout: '€€€', priorite: true },
      { titre: 'Thermostat intelligent', impact: 'faible', description: 'Régulation automatique température bureaux', cout: '€', priorite: false },
    ]
  },
  'Émissions directes — Sources mobiles': {
    actions: [
      { titre: 'Électrification de la flotte', impact: 'fort', description: 'Remplacement progressif par véhicules électriques', cout: '€€€', priorite: true },
      { titre: 'Formation éco-conduite', impact: 'faible', description: 'Réduction de 10-15% de la consommation carburant', cout: '€', priorite: false },
      { titre: 'Optimisation des tournées', impact: 'moyen', description: 'Réduction des km parcourus par planification', cout: '€', priorite: false },
    ]
  },
  'Émissions indirectes — Électricité': {
    actions: [
      { titre: 'Contrat électricité verte', impact: 'fort', description: 'PPA ou garantie d\'origine renouvelable', cout: '€', priorite: true },
      { titre: 'Panneaux solaires en toiture', impact: 'fort', description: 'Autoconsommation + revente surplus', cout: '€€€', priorite: true },
      { titre: 'LED et détecteurs de présence', impact: 'faible', description: 'Réduction conso éclairage de 50-70%', cout: '€', priorite: false },
    ]
  },
  'Achats de produits ou services': {
    actions: [
      { titre: 'Politique achats responsables', impact: 'moyen', description: 'Critères carbone dans les appels d\'offres', cout: '€', priorite: false },
      { titre: 'Réduction du numérique', impact: 'faible', description: 'Allongement durée de vie du matériel IT', cout: '€', priorite: false },
    ]
  },
  'Déplacements domicile-travail': {
    actions: [
      { titre: 'Forfait mobilité durable', impact: 'moyen', description: 'Incitation vélo, covoiturage, transports en commun', cout: '€', priorite: false },
      { titre: 'Télétravail', impact: 'moyen', description: '2 jours/semaine = réduction ~40% des trajets', cout: '€', priorite: true },
    ]
  },
  'Déplacements professionnels': {
    actions: [
      { titre: 'Politique train vs avion', impact: 'fort', description: 'Train obligatoire sous 4h de trajet', cout: '€', priorite: true },
      { titre: 'Visioconférence par défaut', impact: 'moyen', description: 'Réduction des déplacements non essentiels', cout: '€', priorite: false },
    ]
  },
  'Transport de marchandises': {
    actions: [
      { titre: 'Report modal vers le rail', impact: 'fort', description: 'Transfert des flux longue distance vers le ferroviaire', cout: '€€', priorite: true },
      { titre: 'Massification des envois', impact: 'moyen', description: 'Réduction fréquence, augmentation taux de remplissage', cout: '€', priorite: false },
    ]
  },
}

function getActionsForPoste(categorie_bc) {
  // Lookup exact d'abord : un matching par préfixe ferait matcher « Sources mobiles »
  // sur les leviers « Sources fixes » (préfixe « Émissions directes » commun).
  if (LEVIERS[categorie_bc]) return LEVIERS[categorie_bc].actions

  // Fallback par mot-clé pour les catégories sans entrée dédiée
  if (categorie_bc?.includes('Transport')) return LEVIERS['Transport de marchandises'].actions
  if (categorie_bc?.includes('Déplacements pro')) return LEVIERS['Déplacements professionnels'].actions
  if (categorie_bc?.includes('domicile')) return LEVIERS['Déplacements domicile-travail'].actions
  if (categorie_bc?.includes('Achats')) return LEVIERS['Achats de produits ou services'].actions
  if (categorie_bc?.includes('Électricité')) return LEVIERS['Émissions indirectes — Électricité'].actions
  return []
}

const impactColors = {
  fort: 'text-error',
  moyen: 'text-accent-warm',
  faible: 'text-secondary',
}

export default function PlanAction({ projet, lignes }) {
  const resultats = useMemo(() => agregerParScope(lignes), [lignes])
  const topPostes = useMemo(() => getTopPostes(lignes, 6), [lignes])
  const hasData = resultats.total > 0

  // Construire la liste d'actions à partir des top postes
  const allActions = useMemo(() => {
    const actions = []
    const seen = new Set()
    topPostes.forEach(ligne => {
      const posteActions = getActionsForPoste(ligne.categorie_bc)
      posteActions.forEach(a => {
        if (!seen.has(a.titre)) {
          seen.add(a.titre)
          actions.push({
            ...a,
            poste: ligne.categorie_ghg,
            emission: ligne.resultat.emission_t,
          })
        }
      })
    })
    // Trier : priorité d'abord, puis impact fort
    return actions.sort((a, b) => {
      if (a.priorite && !b.priorite) return -1
      if (!a.priorite && b.priorite) return 1
      const order = { fort: 0, moyen: 1, faible: 2 }
      return (order[a.impact] || 2) - (order[b.impact] || 2)
    })
  }, [topPostes])

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-8">
        <div className="max-w-2xl">
          <div className="h-[2px] w-12 bg-primary mb-6" />
          <h1 className="text-5xl font-headline font-bold text-primary tracking-tight leading-none mb-4">
            Plan de décarbonation
          </h1>
          <p className="text-secondary max-w-lg leading-relaxed">
            Actions prioritaires identifiées à partir du bilan carbone.
            Sélectionnez et planifiez les interventions selon leur impact et leur faisabilité.
          </p>
        </div>
        {hasData && (
          <div className="text-right flex flex-col items-end">
            <span className="text-[10px] font-label font-bold text-outline uppercase tracking-widest mb-1">
              Émissions à réduire
            </span>
            <span className="text-6xl font-headline font-light text-primary tracking-tighter">
              {formatNombre(resultats.total, { decimales: resultats.total < 10 ? 1 : 0 })}
              <span className="text-xl font-bold ml-1 uppercase">tCO₂e</span>
            </span>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="bg-surface-low p-16 text-center">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-6 block">
            strategy
          </span>
          <h3 className="font-headline text-xl font-bold text-primary mb-2">
            Aucune donnée disponible
          </h3>
          <p className="text-secondary text-sm">
            Complétez d'abord la collecte des données pour générer un plan d'action.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8 mb-16">
          {/* Main Action Ledger */}
          <div className="col-span-12 lg:col-span-8 bg-surface-low p-12 border-t-[3px] border-primary-container relative">
            <div className="absolute top-8 right-8 text-outline-variant opacity-20">
              <span className="material-symbols-outlined text-8xl">trending_down</span>
            </div>

            <h2 className="text-sm font-label font-black text-primary uppercase tracking-[0.2em] mb-12 flex items-center gap-3">
              <span className="w-2 h-2 bg-primary" />
              Actions identifiées
            </h2>

            <div className="space-y-4">
              {allActions.map((action, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-12 items-center p-6 group hover:bg-primary hover:text-on-primary transition-all duration-300 cursor-pointer
                    ${action.priorite
                      ? 'bg-surface-lowest border-t-[3px] border-error'
                      : 'bg-surface-container'
                    }`}
                >
                  <div className="col-span-6">
                    {action.priorite && (
                      <span className="text-[10px] font-bold text-error uppercase tracking-widest group-hover:text-accent-red mb-1 block">
                        Action prioritaire
                      </span>
                    )}
                    <h3 className="text-xl font-headline font-bold group-hover:text-on-primary">
                      {action.titre}
                    </h3>
                    <p className="text-xs text-secondary group-hover:text-on-primary/70 mt-1">
                      {action.description}
                    </p>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest group-hover:text-on-primary/50 block">
                      Impact
                    </span>
                    <span className={`text-lg font-headline font-bold group-hover:text-on-primary ${impactColors[action.impact]}`}>
                      {action.impact.charAt(0).toUpperCase() + action.impact.slice(1)}
                    </span>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest group-hover:text-on-primary/50 block">
                      Investissement
                    </span>
                    <span className="text-xl font-headline font-bold text-primary group-hover:text-on-primary">
                      {action.cout}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            {/* Summary */}
            <div className="bg-surface-highest p-8 relative overflow-hidden h-full min-h-[300px]">
              <div className="relative z-10 h-full flex flex-col">
                <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-12">
                  Synthèse des leviers
                </h3>
                <div className="mt-auto">
                  <div className="text-5xl font-headline font-bold text-primary mb-2">
                    {allActions.filter(a => a.priorite).length}
                  </div>
                  <p className="text-xs text-secondary font-medium leading-relaxed">
                    actions prioritaires identifiées sur {allActions.length} leviers au total.
                  </p>
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-secondary">Impact fort</span>
                      <span className="font-bold text-error">{allActions.filter(a => a.impact === 'fort').length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-secondary">Impact moyen</span>
                      <span className="font-bold text-accent-warm">{allActions.filter(a => a.impact === 'moyen').length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-secondary">Impact faible</span>
                      <span className="font-bold">{allActions.filter(a => a.impact === 'faible').length}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/5 -rotate-12" />
            </div>

            {/* Context Card */}
            <div className="bg-primary p-8 text-on-primary flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-4 block">
                  Approche recommandée
                </span>
                <h3 className="text-2xl font-headline font-bold mb-6 leading-tight">
                  Prioriser les leviers à fort impact et faible investissement
                </h3>
              </div>
              <p className="text-sm opacity-80 leading-relaxed">
                Les actions marquées "€" représentent des quick wins mobilisables immédiatement.
                Les investissements "€€€" nécessitent une étude de faisabilité préalable.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-outline-variant/10 pt-8 flex justify-between items-center opacity-60">
        <div className="flex gap-12">
          <div>
            <span className="text-[8px] font-black uppercase tracking-widest block mb-1">Statut</span>
            <span className="text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-error" />
              Brouillon
            </span>
          </div>
          <div>
            <span className="text-[8px] font-black uppercase tracking-widest block mb-1">Exercice</span>
            <span className="text-xs font-bold">{projet.annee || '2025'}</span>
          </div>
        </div>
        <div className="text-[10px] font-headline font-medium tracking-widest text-right">
          MTL / BILAN CARBONE
        </div>
      </div>
    </div>
  )
}
