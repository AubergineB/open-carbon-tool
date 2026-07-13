import { useState, useMemo } from 'react'
import postesEmission from '../data/postesEmission'
import { getFactorsByCategory } from '../data/emissionFactors'
import { calculerEmission } from '../utils/calculEngine'
import { formatCO2 } from '../utils/formatEmission'
import { collecteGroupsMap as groupConfigMap } from '../data/collecteGroups'
import { getMaterialite } from '../data/materialiteSectorielle'
import { isTreated } from '../utils/statuts'

function isMonetaire(unite) {
  if (!unite) return false
  const u = unite.toLowerCase()
  return u.includes('€') || /\b(eur|euro)\b/.test(u)
}

const scopeIcons = {
  combustion_fixe: 'gas_meter',
  combustion_mobile: 'directions_car',
  fugitives: 'cloud_off',
  electricite: 'bolt',
  reseaux: 'thermostat',
  achats: 'shopping_cart',
  immobilisations: 'devices',
  fret_amont: 'inventory_2',
  dechets: 'delete',
  deplacements_pro: 'flight',
  deplacements_dt: 'commute',
  fret_aval: 'local_shipping',
  numerique: 'computer',
  eau: 'water_drop',
  hebergement: 'hotel',
  energie_autre: 'electric_bolt',
  usage_produits: 'storefront',
}

const materialiteConfig = {
  3: { label: 'Poste majeur', dots: '●●●', color: 'text-error' },
  2: { label: 'Significatif', dots: '●●○', color: 'text-accent-warm' },
  1: { label: 'Mineur', dots: '●○○', color: 'text-outline' },
  0: { label: 'Non applicable', dots: '○○○', color: 'text-outline/50' },
}

function MaterialiteBadge({ materialite }) {
  if (!materialite) return null
  const config = materialiteConfig[materialite.score] || materialiteConfig[1]
  return (
    <div className="flex items-center gap-2 mt-2">
      <span className={`text-sm font-bold ${config.color}`}>{config.dots}</span>
      {materialite.tip && (
        <span className="text-[10px] text-outline italic">{materialite.tip}</span>
      )}
    </div>
  )
}

function GuidePanel({ guide }) {
  const [open, setOpen] = useState(false)
  if (!guide) return null

  const sections = [
    { key: 'ou_trouver', label: 'Où trouver les données', icon: 'folder_open' },
    { key: 'quoi_chercher', label: 'Quoi relever', icon: 'search' },
    { key: 'ordres_grandeur', label: 'Ordres de grandeur', icon: 'straighten' },
    { key: 'erreurs_courantes', label: 'Pièges courants', icon: 'warning' },
  ]

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-primary-container hover:text-primary border border-primary-container px-3 py-1.5 transition-colors"
      >
        <span className="material-symbols-outlined text-sm">menu_book</span>
        Guide pratique
        <span
          className="material-symbols-outlined text-sm transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : '' }}
        >expand_more</span>
      </button>
      {open && (
        <div className="mt-3 bg-surface-low p-5 border-l-[3px] border-primary-container space-y-5">
          {guide.pourquoi && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Pourquoi ce poste compte</span>
              <p className="mt-1.5 text-xs text-primary leading-relaxed">{guide.pourquoi}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sections.map(s => guide[s.key]?.length > 0 && (
              <div key={s.key}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="material-symbols-outlined text-xs text-on-primary-container">{s.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline">{s.label}</span>
                </div>
                <ul className="space-y-1.5">
                  {guide[s.key].map((item, i) => (
                    <li key={i} className="flex gap-2 text-xs leading-relaxed">
                      <span className="mt-[5px] w-1.5 h-1.5 bg-primary-container shrink-0" />
                      <span className={s.key === 'ordres_grandeur' ? 'text-primary' : 'text-secondary'}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AssigneeBadge({ assignee }) {
  if (!assignee) return null
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary border border-primary px-2 py-0.5 uppercase tracking-widest">
      <span className="material-symbols-outlined text-xs">person</span>
      {assignee}
    </span>
  )
}

function PosteSection({ poste, lignes, onAddLigne, onUpdateLigne, onRemoveLigne, facteursCustom, status, onStatusChange, assignee, materialite, sites }) {
  const facteurs = getFactorsByCategory(poste.categorieFE)
  const facteursCustomFiltered = facteursCustom.filter(f => f.categorieFE === poste.categorieFE)
  const icon = scopeIcons[poste.id] || 'eco'
  const totalPoste = lignes.reduce((sum, l) => l.resultat ? sum + l.resultat.total_t : sum, 0)

  // Section non matérielle — rendu compact avec badge
  if (status === 'non_material') {
    return (
      <div className="flex items-center justify-between px-6 py-3 border-b border-surface-highest/50 bg-surface-container/30">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-outline text-sm">trending_flat</span>
          <span className="font-headline text-sm text-outline">{poste.nom}</span>
          <span className="text-[10px] font-bold text-outline uppercase tracking-widest bg-surface-highest px-2 py-0.5">
            Non matériel
          </span>
        </div>
        <button
          onClick={() => onStatusChange(poste.id, 'inactive')}
          className="text-[10px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors"
        >
          Réactiver
        </button>
      </div>
    )
  }

  // Section désactivée (non concernée) — rendu minimal inline
  if (status === 'dismissed') {
    return (
      <div className="flex items-center justify-between px-6 py-2 border-b border-surface-highest/50 opacity-40 hover:opacity-60 transition-opacity">
        <span className="font-headline text-sm text-outline line-through">{poste.nom}</span>
        <button
          onClick={() => onStatusChange(poste.id, 'inactive')}
          className="text-[10px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors"
        >
          Réactiver
        </button>
      </div>
    )
  }

  // Section confirmée
  if (status === 'confirmed') {
    return (
      <section className="bg-surface-lowest p-8 border-t-[3px] border-primary-container relative">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-headline text-2xl font-bold text-primary tracking-tight">
                {poste.nom}
              </h3>
              <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
              <AssigneeBadge assignee={assignee} />
            </div>
            <MaterialiteBadge materialite={materialite} />
            {totalPoste > 0 && (
              <div className="mt-2 inline-flex items-center gap-2 bg-primary text-on-primary px-3 py-1">
                <span className="font-headline font-bold text-sm">{formatCO2(totalPoste)}</span>
              </div>
            )}
            <p className="text-xs text-secondary mt-2">{lignes.length} donnée{lignes.length > 1 ? 's' : ''} collectée{lignes.length > 1 ? 's' : ''} — Confirmé</p>
            <GuidePanel guide={poste.guide} />
          </div>
          <button
            onClick={() => onStatusChange(poste.id, 'active')}
            className="text-xs font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors"
          >
            Modifier
          </button>
        </div>
      </section>
    )
  }

  // Section inactive (par défaut)
  if (status !== 'active') {
    return (
      <section className="bg-surface-container p-8 border-t-[3px] border-on-primary-container/30 relative">
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-headline text-2xl font-bold text-primary tracking-tight opacity-60">
                {poste.nom}
              </h3>
              <AssigneeBadge assignee={assignee} />
            </div>
            <p className="text-sm text-secondary">{poste.aide}</p>
            <MaterialiteBadge materialite={materialite} />
            <GuidePanel guide={poste.guide} />
          </div>
          <span className="material-symbols-outlined text-primary-container/20">{icon}</span>
        </div>
        <div className="flex justify-center items-center gap-4 py-12 border-2 border-dashed border-outline-variant/30">
          <button
            onClick={() => { onStatusChange(poste.id, 'active'); if (lignes.length === 0) onAddLigne(poste.id) }}
            className="bg-surface-lowest text-primary px-6 py-3 font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all"
          >
            Activer cette section
          </button>
          <button
            onClick={() => onStatusChange(poste.id, 'non_material')}
            className="text-outline px-6 py-3 font-headline font-bold text-xs uppercase tracking-widest hover:text-primary transition-all"
          >
            Non matériel
          </button>
          <button
            onClick={() => onStatusChange(poste.id, 'dismissed')}
            className="text-secondary px-6 py-3 font-headline font-bold text-xs uppercase tracking-widest hover:text-primary transition-all"
          >
            Non concerné
          </button>
        </div>
      </section>
    )
  }

  // Section active (saisie en cours)
  return (
    <section className="bg-surface-lowest p-8 border-t-[3px] border-primary-container relative group transition-all duration-300">
      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-headline text-2xl font-bold text-primary tracking-tight">
              {poste.nom}
            </h3>
            <AssigneeBadge assignee={assignee} />
          </div>
          <p className="text-sm text-secondary">{poste.donnees_attendues}</p>
          <MaterialiteBadge materialite={materialite} />
          <GuidePanel guide={poste.guide} />
          {totalPoste > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 bg-primary text-on-primary px-3 py-1">
              <span className="font-headline font-bold text-sm">{formatCO2(totalPoste)}</span>
            </div>
          )}
        </div>
        <span className="material-symbols-outlined text-primary-container/20 group-hover:text-primary-container transition-colors">
          {icon}
        </span>
      </div>

      {lignes.map(ligne => (
        <LigneInput
          key={ligne._key}
          ligne={ligne}
          facteurs={facteurs}
          facteursCustom={facteursCustomFiltered}
          onUpdate={(field, value) => onUpdateLigne(ligne._key, field, value)}
          onRemove={() => onRemoveLigne(ligne._key)}
          sites={sites}
        />
      ))}

      <div className="mt-10 pt-6 border-t border-surface-container flex items-center justify-between">
        <button
          onClick={() => onAddLigne(poste.id)}
          className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Ajouter une donnée
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onStatusChange(poste.id, 'non_material')}
            className="text-xs font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors"
          >
            Non matériel
          </button>
          <button
            onClick={() => onStatusChange(poste.id, 'dismissed')}
            className="text-xs font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors"
          >
            Non concerné
          </button>
          <button
            onClick={() => onStatusChange(poste.id, 'confirmed')}
            className="bg-primary text-on-primary px-5 py-2 font-headline font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">check</span>
            Confirmer
          </button>
        </div>
      </div>
    </section>
  )
}

function LigneInput({ ligne, facteurs, facteursCustom, onUpdate, onRemove, sites }) {
  const calculerAvecFacteur = (valeur, facteurId) => {
    const customFactor = facteursCustom.find(f => f.id === facteurId)
    return customFactor
      ? calculerEmission(valeur, null, customFactor)
      : calculerEmission(valeur, facteurId)
  }

  const handleValueChange = (value) => {
    const num = parseFloat(value)
    if (value !== '' && !isNaN(num) && num < 0) return
    onUpdate('valeur', value)
    if (value && ligne.facteurId) onUpdate('resultat', calculerAvecFacteur(value, ligne.facteurId))
  }

  const handleFacteurChange = (facteurId) => {
    onUpdate('facteurId', facteurId)

    // Auto-détection proxy monétaire
    const customFactor = facteursCustom.find(f => f.id === facteurId)
    const fe = customFactor || facteurs.find(f => f.id === facteurId)
    if (fe && isMonetaire(fe.unite)) {
      onUpdate('precision', 'P0')
    } else if (ligne.precision === 'P0') {
      onUpdate('precision', 'P1')
    }

    if (ligne.valeur && facteurId) onUpdate('resultat', calculerAvecFacteur(ligne.valeur, facteurId))
  }

  return (
    <div className="mb-8 pb-8 border-b border-surface-container last:border-b-0 last:mb-0 last:pb-0">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6">
        <div className="md:col-span-4 space-y-2">
          <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Type de donnée</label>
          {facteurs.length === 0 && facteursCustom.length === 0 ? (
            <div className="py-2 border-b-2 border-surface-highest">
              <p className="text-xs text-secondary">
                Aucun facteur standard disponible pour ce poste.
              </p>
              <p className="text-xs text-outline mt-1">
                Créez un facteur personnalisé dans l'onglet <strong>Facteurs</strong>, ou contactez votre consultant.
              </p>
            </div>
          ) : (
            <select
              value={ligne.facteurId || ''}
              onChange={e => handleFacteurChange(e.target.value)}
              className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-base font-headline font-medium transition-all"
            >
              <option value="">— Sélectionner —</option>
              {facteurs.length > 0 && (
                <optgroup label="Base Carbone ADEME">
                  {facteurs.map(f => (
                    <option key={f.id} value={f.id}>{f.nom} ({f.unite})</option>
                  ))}
                </optgroup>
              )}
              {facteursCustom.length > 0 && (
                <optgroup label="Mes facteurs personnalisés">
                  {facteursCustom.map(f => (
                    <option key={f.id} value={f.id}>{f.nom} ({f.unite})</option>
                  ))}
                </optgroup>
              )}
            </select>
          )}
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Quantité</label>
          <input
            type="number"
            value={ligne.valeur || ''}
            onChange={e => handleValueChange(e.target.value)}
            className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-xl font-headline font-medium transition-all"
            placeholder="0.00"
            min="0"
            step="any"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="block text-[10px] font-bold text-outline uppercase tracking-widest" title="À quel point le facteur d'émission utilisé est représentatif de votre activité réelle ?">
            Qualité de la donnée
          </label>
          {(() => {
            const customFactor = facteursCustom.find(f => f.id === ligne.facteurId)
            const fe = customFactor || facteurs.find(f => f.id === ligne.facteurId)
            const monetaire = fe && isMonetaire(fe.unite)

            if (monetaire) {
              return (
                <div className="py-2 border-b-2 border-surface-highest">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline text-sm">euro</span>
                    <span className="text-sm font-headline font-medium text-outline">Estimation monétaire</span>
                  </div>
                  <p className="text-[10px] text-outline mt-1">Détecté automatiquement — incertitude ±50%</p>
                </div>
              )
            }

            return (
              <select
                value={ligne.precision || 'P1'}
                onChange={e => onUpdate('precision', e.target.value)}
                className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-base font-headline font-medium transition-all"
              >
                <option value="P3">Donnée mesurée</option>
                <option value="P2">FE représentatif</option>
                <option value="P1">Moyenne sectorielle</option>
              </select>
            )
          })()}
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Source</label>
          <input
            type="text"
            value={ligne.source || ''}
            onChange={e => onUpdate('source', e.target.value)}
            className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-base font-headline font-medium transition-all"
            placeholder="Facture..."
          />
        </div>

        {sites.length > 0 && (
          <div className="md:col-span-2 space-y-2">
            <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Site</label>
            <select
              value={ligne.site || ''}
              onChange={e => onUpdate('site', e.target.value || null)}
              className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-base font-headline font-medium transition-all"
            >
              <option value="">— Non assigné —</option>
              {sites.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        <div className={`${sites.length > 0 ? 'md:col-span-2' : 'md:col-span-2'} space-y-2`}>
          <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Émissions</label>
          <div className="flex items-center justify-between py-2 border-b-2 border-transparent">
            <div>
              <span className="text-xl font-headline font-bold text-primary">
                {ligne.resultat ? formatCO2(ligne.resultat.total_t, { suffixe: '' }) : '—'}
              </span>
              {ligne.resultat && ligne.resultat.amont_t > 0 && (
                <span className="block text-[10px] text-outline mt-0.5" title="Détail : Scope 1 (combustion directe) + Scope 3.3 (amont énergie)">
                  S1 {formatCO2(ligne.resultat.emission_t, { suffixe: '' })} + S3.3 {formatCO2(ligne.resultat.amont_t, { suffixe: '' })}
                </span>
              )}
              {ligne.resultat && ligne.resultat.co2b_t > 0 && (
                <span className="block text-[10px] text-outline mt-0.5" title="CO₂ biogénique (non comptabilisé dans le total GES, reporté séparément)">
                  + {formatCO2(ligne.resultat.co2b_t, { suffixe: '' })} CO₂b
                </span>
              )}
            </div>
            <button onClick={onRemove} className="material-symbols-outlined text-outline hover:text-error transition-colors text-sm">
              close
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default function CollecteForm({ collecteGroup, currentView, lignes, setLignes, facteursCustom = [], sectionsStatus = {}, setSectionsStatus, sectionsAssignees = {}, secteur, sites = [] }) {
  const [selectedSite, setSelectedSite] = useState(null)
  const config = groupConfigMap[currentView] || groupConfigMap['collecte-energie']
  const groupPostes = useMemo(
    () => postesEmission.filter(p => collecteGroup.scopes.includes(p.scope)),
    [collecteGroup.scopes],
  )

  const totalGroup = useMemo(
    () => lignes.filter(l => collecteGroup.scopes.includes(l.scope) && l.resultat).reduce((sum, l) => sum + l.resultat.total_t, 0),
    [lignes, collecteGroup.scopes],
  )

  const treatedSections = useMemo(
    () => groupPostes.filter(p => isTreated(sectionsStatus[p.id])).length,
    [groupPostes, sectionsStatus],
  )

  const completionPct = useMemo(
    () => groupPostes.length > 0 ? Math.round((treatedSections / groupPostes.length) * 100) : 0,
    [groupPostes, treatedSections],
  )

  const handleStatusChange = (posteId, newStatus) => {
    setSectionsStatus(prev => ({ ...prev, [posteId]: newStatus }))
  }

  const handleAddLigne = (posteId) => {
    const poste = postesEmission.find(p => p.id === posteId)
    setLignes(prev => [...prev, {
      _key: crypto.randomUUID(),
      posteId, scope: poste.scope, categorie_bc: poste.nom_bc, categorie_ghg: poste.nom_ghg,
      facteurId: '', valeur: '', precision: 'P1', source: '', resultat: null,
      site: selectedSite || null,
    }])
  }

  const handleUpdateLigne = (ligneKey, field, value) => {
    setLignes(prev => prev.map(l => l._key === ligneKey ? { ...l, [field]: value } : l))
  }

  const handleRemoveLigne = (ligneKey) => {
    setLignes(prev => prev.filter(l => l._key !== ligneKey))
  }

  return (
    <div className="grid grid-cols-12 gap-8 items-start">
      {/* Progress Sidebar */}
      <div className="col-span-12 lg:col-span-3 lg:sticky lg:top-32 space-y-6">
        <div className="bg-surface-low p-6">
          <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-4">Avancement</h3>
          <div className="h-1 bg-surface-highest w-full mb-2">
            <div className="h-full bg-primary transition-all" style={{ width: `${completionPct}%` }} />
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-headline font-black text-primary">{completionPct}%</span>
            <span className="text-[10px] font-bold text-outline uppercase tracking-tight">{treatedSections} sur {groupPostes.length}</span>
          </div>
        </div>

        {totalGroup > 0 && (
          <div className="bg-surface-low p-6">
            <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-2">Total {config.label}</h3>
            <span className="text-3xl font-headline font-black text-primary">
              {formatCO2(totalGroup, { decimales: 1, suffixe: '' })}
            </span>
            <span className="text-sm text-secondary ml-1">CO₂e</span>
          </div>
        )}

        <div className="p-6 bg-primary-container text-surface">
          <span className="material-symbols-outlined mb-4 block">lightbulb</span>
          <h4 className="font-headline font-bold text-xs uppercase mb-2">Conseil</h4>
          <p className="text-xs opacity-80 leading-relaxed">{config.hint}</p>
        </div>
      </div>

      {/* Main Forms */}
      <div className="col-span-12 lg:col-span-9">
        <header className="mb-12">
          <div className="flex items-center gap-2 text-outline text-xs font-bold uppercase tracking-tighter mb-2">
            <span>Collecte des données</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary">{config.label}</span>
          </div>
          <h1 className="font-headline text-5xl font-black text-primary tracking-tighter uppercase leading-none">
            {config.label} — <span className="text-on-primary-container">{config.sublabel}</span>
          </h1>
          <p className="mt-4 text-secondary max-w-2xl leading-relaxed">{config.description}</p>

          {sites.length > 0 && (
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Site :</span>
              <button
                onClick={() => setSelectedSite(null)}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  selectedSite === null ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline hover:text-primary'
                }`}
              >
                Tous
              </button>
              {sites.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSite(s)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    selectedSite === s ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline hover:text-primary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </header>

        <div className="space-y-8">
          {groupPostes.filter(p => sectionsStatus[p.id] !== 'dismissed' && sectionsStatus[p.id] !== 'non_material').map(poste => (
            <PosteSection
              key={poste.id}
              poste={poste}
              lignes={lignes.filter(l => l.posteId === poste.id && (!selectedSite || l.site === selectedSite))}
              onAddLigne={handleAddLigne}
              onUpdateLigne={handleUpdateLigne}
              onRemoveLigne={handleRemoveLigne}
              facteursCustom={facteursCustom}
              status={sectionsStatus[poste.id] || 'inactive'}
              onStatusChange={handleStatusChange}
              assignee={sectionsAssignees[poste.id] || null}
              materialite={getMaterialite(secteur, poste.id)}
              sites={sites}
            />
          ))}
        </div>
        {groupPostes.some(p => sectionsStatus[p.id] === 'dismissed' || sectionsStatus[p.id] === 'non_material') && (
          <div className="mt-8 bg-surface-container/50 py-2">
            {groupPostes.filter(p => sectionsStatus[p.id] === 'dismissed' || sectionsStatus[p.id] === 'non_material').map(poste => (
              <PosteSection
                key={poste.id}
                poste={poste}
                lignes={[]}
                onAddLigne={handleAddLigne}
                onUpdateLigne={handleUpdateLigne}
                onRemoveLigne={handleRemoveLigne}
                facteursCustom={facteursCustom}
                status={sectionsStatus[poste.id]}
                onStatusChange={handleStatusChange}
                sites={sites}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
