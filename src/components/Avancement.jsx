import { useState, useMemo } from 'react'
import postesEmission from '../data/postesEmission'
import collecteGroups from '../data/collecteGroups'
import { formatCO2 } from '../utils/formatEmission'
import { isTreated } from '../utils/statuts'

const statusConfig = {
  inactive: { label: 'À traiter', icon: 'radio_button_unchecked', color: 'text-outline', bg: 'bg-surface-highest' },
  active: { label: 'En cours', icon: 'pending', color: 'text-primary', bg: 'bg-primary/10' },
  confirmed: { label: 'Confirmé', icon: 'check_circle', color: 'text-primary', bg: 'bg-primary/10' },
  dismissed: { label: 'Non concerné', icon: 'do_not_disturb_on', color: 'text-outline', bg: 'bg-surface-highest' },
  non_material: { label: 'Non matériel', icon: 'trending_flat', color: 'text-outline', bg: 'bg-surface-container' },
}

const STATUS_CHOICES = [
  { key: 'confirmed', label: 'Confirmer', icon: 'check_circle', desc: 'Données validées' },
  { key: 'active', label: 'En cours', icon: 'pending', desc: 'Collecte en cours' },
  { key: 'dismissed', label: 'Non concerné', icon: 'do_not_disturb_on', desc: 'Exclure ce poste' },
  { key: 'non_material', label: 'Non matériel', icon: 'trending_flat', desc: 'Poste existant mais négligeable (<5%)' },
  { key: 'inactive', label: 'À traiter', icon: 'radio_button_unchecked', desc: 'Remettre en attente' },
]


function AssigneeSelect({ value, onChange, assignees }) {
  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <input
        list="assignee-list"
        value={value || ''}
        onChange={e => onChange(e.target.value || null)}
        placeholder="Responsable"
        className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-primary border border-primary px-2 py-1 cursor-text placeholder:text-outline"
        style={{ minWidth: '180px' }}
      />
      <datalist id="assignee-list">
        {assignees.map(name => <option key={name} value={name} />)}
      </datalist>
    </div>
  )
}

export default function Avancement({ lignes, sectionsStatus, setSectionsStatus, sectionsAssignees, setSectionsAssignees, setCurrentView }) {
  const [expandedPoste, setExpandedPoste] = useState(null)
  const [notifToast, setNotifToast] = useState(null)

  // Single-pass statut calculation memoized
  const { totalPostes, treatedPostes, confirmedPostes, dismissedPostes, nonMaterialPostes, activePostes, inactivePostes, globalPct } = useMemo(() => {
    const allPostes = postesEmission
    const totalPostes = allPostes.length
    let confirmed = 0, dismissed = 0, nonMaterial = 0, active = 0
    for (const p of allPostes) {
      const status = sectionsStatus[p.id]
      if (status === 'confirmed') confirmed++
      else if (status === 'dismissed') dismissed++
      else if (status === 'non_material') nonMaterial++
      else if (status === 'active') active++
    }
    const treated = confirmed + dismissed + nonMaterial
    const inactive = totalPostes - treated - active
    const pct = totalPostes > 0 ? Math.round((treated / totalPostes) * 100) : 0
    return { totalPostes, treatedPostes: treated, confirmedPostes: confirmed, dismissedPostes: dismissed, nonMaterialPostes: nonMaterial, activePostes: active, inactivePostes: inactive, globalPct: pct }
  }, [sectionsStatus])

  // Single pass : totalEmissions + émissions + comptage lignes par poste + par scope
  const { totalEmissions, emissionsParPoste, emissionsParScope, lignesParPoste } = useMemo(() => {
    let total = 0
    const parPoste = {}
    const parScope = {}
    const lignesCount = {}
    for (const l of lignes) {
      lignesCount[l.posteId] = (lignesCount[l.posteId] || 0) + 1
      if (!l.resultat) continue
      const v = l.resultat.total_t
      total += v
      parPoste[l.posteId] = (parPoste[l.posteId] || 0) + v
      parScope[l.scope] = (parScope[l.scope] || 0) + v
    }
    return { totalEmissions: total, emissionsParPoste: parPoste, emissionsParScope: parScope, lignesParPoste: lignesCount }
  }, [lignes])

  const uniqueAssignedUserIds = [...new Set(Object.values(sectionsAssignees).filter(Boolean))]

  function handleStatusChange(posteId, newStatus) {
    setSectionsStatus(prev => ({ ...prev, [posteId]: newStatus }))
  }

  function handleAssigneeChange(posteId, assignee) {
    const next = { ...sectionsAssignees }
    if (assignee) next[posteId] = assignee
    else delete next[posteId]
    setSectionsAssignees(next)
  }

  function handleCopyAssignments() {
    const text = postesEmission
      .filter(poste => sectionsAssignees[poste.id])
      .map(poste => `${sectionsAssignees[poste.id]} — ${poste.nom}${poste.aide ? `\n${poste.aide}` : ''}`)
      .join('\n\n')
    navigator.clipboard.writeText(text || 'Aucun poste n’est assigné.')
    setNotifToast({ message: 'Liste copiée dans le presse-papier', type: 'success' })
    setTimeout(() => setNotifToast(null), 3000)
  }

  function getGroupForPoste(poste) {
    return collecteGroups.find(g => g.scopes.includes(poste.scope))
  }

  return (
    <div className="grid grid-cols-12 gap-8 items-start">
      {/* Sidebar résumé */}
      <div className="col-span-12 lg:col-span-3 lg:sticky lg:top-32 space-y-6">
        <div className="bg-surface-low p-6">
          <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-4">Avancement global</h3>
          <div className="h-2 bg-surface-highest w-full mb-3">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${globalPct}%` }} />
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-4xl font-headline font-black text-primary">{globalPct}%</span>
            <span className="text-[10px] font-bold text-outline uppercase tracking-tight">{treatedPostes} sur {totalPostes}</span>
          </div>
        </div>

        <div className="bg-surface-low p-6 space-y-3">
          <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-2">Répartition</h3>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Confirmés</span>
            <span className="font-headline font-bold text-primary">{confirmedPostes}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Non concernés</span>
            <span className="font-headline font-bold text-outline">{dismissedPostes}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Non matériels</span>
            <span className="font-headline font-bold text-outline">{nonMaterialPostes}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">En cours</span>
            <span className="font-headline font-bold text-primary">{activePostes}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">À traiter</span>
            <span className="font-headline font-bold text-outline">{inactivePostes}</span>
          </div>
        </div>

        {totalEmissions > 0 && (
          <div className="bg-surface-low p-6">
            <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-2">Total provisoire</h3>
            <span className="text-3xl font-headline font-black text-primary">
              {formatCO2(totalEmissions, { decimales: 1, suffixe: '' })}
            </span>
            <span className="text-sm text-secondary ml-1">CO₂e</span>
          </div>
        )}

        {uniqueAssignedUserIds.length > 0 && (
          <div className="bg-surface-low p-6 space-y-2">
            <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-2">Équipe</h3>
            {uniqueAssignedUserIds.map(uid => {
              const displayName = uid
              const count = postesEmission.filter(p => sectionsAssignees[p.id] === uid).length
              return (
                <div key={uid} className="flex justify-between text-sm">
                  <span className="text-secondary">{displayName}</span>
                  <span className="font-headline font-bold text-primary">{count} poste{count > 1 ? 's' : ''}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="col-span-12 lg:col-span-9">
        <header className="mb-12">
          <h1 className="font-headline text-5xl font-black text-primary tracking-tighter uppercase leading-none">
            Gestion <span className="text-on-primary-container">de projet</span>
          </h1>
          <p className="mt-4 text-secondary max-w-2xl leading-relaxed">
            Gérez le statut de chaque poste d'émission. Cliquez sur un poste pour choisir son statut et assigner un responsable.
          </p>
          <button
            onClick={handleCopyAssignments}
            className="mt-5 flex items-center gap-2 bg-surface-highest text-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-sm">content_copy</span>
            Copier la liste des postes assignés
          </button>
        </header>

        {collecteGroups.map(group => {
          const groupPostes = postesEmission.filter(p => group.scopes.includes(p.scope))
          const groupTreated = groupPostes.filter(p => isTreated(sectionsStatus[p.id])).length
          const groupPct = groupPostes.length > 0 ? Math.round((groupTreated / groupPostes.length) * 100) : 0
          const groupEmissions = group.scopes.reduce((sum, s) => sum + (emissionsParScope[s] || 0), 0)

          return (
            <section key={group.id} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">{group.icon}</span>
                  <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight">
                    {group.label}
                  </h2>
                  <div className="h-1 w-24 bg-surface-highest">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${groupPct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-primary">{groupPct}%</span>
                </div>
                {groupEmissions > 0 && (
                  <span className="text-sm font-headline font-bold text-primary">
                    {formatCO2(groupEmissions)}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {groupPostes.map(poste => {
                  const st = sectionsStatus[poste.id] || 'inactive'
                  const stCfg = statusConfig[st]
                  const posteEmissions = emissionsParPoste[poste.id] || 0
                  const posteLignesCount = lignesParPoste[poste.id] || 0
                  const assignee = sectionsAssignees[poste.id] || null
                  const isExpanded = expandedPoste === poste.id
                  const targetGroup = getGroupForPoste(poste)

                  return (
                    <div key={poste.id}>
                      {/* Ligne principale — clic = expand/collapse */}
                      <button
                        className={`w-full text-left p-4 flex items-center gap-4 transition-colors ${isExpanded ? 'bg-surface-low' : 'bg-surface-container hover:bg-surface-container/80'}`}
                        onClick={() => setExpandedPoste(isExpanded ? null : poste.id)}
                      >
                        <span
                          className={`material-symbols-outlined text-lg flex-shrink-0 ${stCfg.color}`}
                          style={st === 'confirmed' ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        >
                          {stCfg.icon}
                        </span>

                        <div className="flex-1 min-w-0">
                          <p className={`font-headline font-bold text-sm ${st === 'dismissed' ? 'text-outline line-through' : 'text-primary'}`}>
                            {poste.nom}
                          </p>
                          <p className="text-[10px] text-outline">Scope {poste.scope}</p>
                        </div>

                        {assignee && (
                          <span className="text-[10px] font-bold text-primary border border-primary px-2 py-0.5 uppercase tracking-widest hidden sm:block">
                            {assignee}
                          </span>
                        )}

                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${stCfg.bg} ${stCfg.color} hidden sm:block`}>
                          {stCfg.label}
                        </span>

                        {posteEmissions > 0 && (
                          <span className="text-sm font-headline font-bold text-primary">
                            {formatCO2(posteEmissions, { suffixe: '' })}
                          </span>
                        )}

                        <span className={`material-symbols-outlined text-outline text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </button>

                      {/* Panel déplié — choix du statut + assignation */}
                      {isExpanded && (
                        <div className="bg-surface-low border-t border-surface-container px-4 py-5 space-y-5">
                          {/* Choix du statut */}
                          <div>
                            <h4 className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3">Statut</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {STATUS_CHOICES.map(choice => {
                                const isActive = st === choice.key
                                return (
                                  <button
                                    key={choice.key}
                                    onClick={() => handleStatusChange(poste.id, choice.key)}
                                    className={`p-3 border-2 text-left transition-all ${
                                      isActive
                                        ? 'border-primary bg-primary/5'
                                        : 'border-surface-container hover:border-primary/30'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span
                                        className={`material-symbols-outlined text-base ${isActive ? 'text-primary' : 'text-outline'}`}
                                        style={choice.key === 'confirmed' && isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                      >
                                        {choice.icon}
                                      </span>
                                      <span className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'text-primary' : 'text-outline'}`}>
                                        {choice.label}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-secondary leading-snug">{choice.desc}</p>
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Assignation + lien collecte */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Responsable</span>
                              <AssigneeSelect
                                value={assignee}
                                onChange={name => handleAssigneeChange(poste.id, name)}
                                assignees={uniqueAssignedUserIds}
                              />
                            </div>

                            {targetGroup && (
                              <button
                                onClick={() => setCurrentView(targetGroup.id)}
                                className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest hover:opacity-70 transition-opacity"
                              >
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                Ouvrir la collecte
                              </button>
                            )}
                          </div>

                          {/* Résumé données si existantes */}
                          {posteLignesCount > 0 && (
                            <div className="border-t border-surface-container pt-3">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                                  {posteLignesCount} ligne{posteLignesCount > 1 ? 's' : ''} saisie{posteLignesCount > 1 ? 's' : ''}
                                </span>
                                {posteEmissions > 0 && (
                                  <span className="text-xs font-headline font-bold text-primary">
                                    {formatCO2(posteEmissions)}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {/* Toast notification */}
      {notifToast && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-3 flex items-center gap-3 shadow-lg ${
          notifToast.type === 'success' ? 'bg-primary text-on-primary' : 'bg-error text-on-primary'
        }`}>
          <span className="material-symbols-outlined text-sm">
            {notifToast.type === 'success' ? 'mail' : 'error'}
          </span>
          <span className="text-xs font-bold uppercase tracking-widest">{notifToast.message}</span>
          <button onClick={() => setNotifToast(null)} className="material-symbols-outlined text-sm opacity-70 hover:opacity-100">close</button>
        </div>
      )}
    </div>
  )
}
