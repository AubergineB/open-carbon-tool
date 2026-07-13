import { useState } from 'react'
import { isTauri } from '@tauri-apps/api/core'
import { openUrl } from '@tauri-apps/plugin-opener'
import emissionFactors, { getAllFactors } from '../data/emissionFactors'
import emissionFactorSources from '../data/emissionFactorSources'
import { splitArchivedFactors } from '../utils/factorFiltering'

const categoryLabels = {
  combustion_fixe: 'Combustion fixe (Scope 1)',
  combustion_mobile: 'Combustion mobile (Scope 1)',
  fugitives: 'Émissions fugitives (Scope 1)',
  electricite: 'Électricité (Scope 2)',
  reseaux: 'Réseaux chaleur/froid (Scope 2)',
  achats: 'Achats de biens et services (Scope 3)',
  immobilisations: 'Biens d\'équipement (Scope 3)',
  fret: 'Transport de marchandises (Scope 3)',
  dechets: 'Déchets (Scope 3)',
  deplacements_pro: 'Déplacements professionnels (Scope 3)',
  deplacements_dt: 'Trajets domicile-travail (Scope 3)',
  numerique: 'Empreinte numérique (Scope 3)',
  eau: 'Consommation d\'eau (Scope 3)',
  hebergement: 'Hébergement professionnel (Scope 3)',
  energie_autre: 'Énergies alternatives (Scope 1/2)',
  usage_produits: 'Usage des produits et services vendus (Scope 3 aval)',
}

const defaultForm = {
  nom: '',
  unite: '',
  valeur: '',
  incertitude: '50',
  source: '',
  categorieFE: 'achats',
}

function CustomFactorCard({ factor, archived, onEdit, onArchive }) {
  return (
    <div className={`bg-surface-lowest p-5 border-t-[3px] ${archived ? 'border-accent-warm/50' : 'border-primary-container/30'} flex items-center gap-6`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-headline font-bold text-sm text-primary truncate">{factor.nom}</p>
          {archived && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-accent-warm border border-accent-warm px-2 py-0.5">
              Archivé
            </span>
          )}
        </div>
        <p className="text-xs text-secondary mt-1">
          {categoryLabels[factor.categorieFE] || factor.categorieFE} · {factor.source}
        </p>
      </div>
      <div className="text-right shrink-0">
        <span className="font-headline font-black text-lg text-primary">{factor.valeur}</span>
        <span className="text-xs text-secondary ml-1">kgCO₂e/{factor.unite}</span>
      </div>
      <div className="text-right shrink-0 text-xs text-secondary">
        ±{factor.incertitude}%
      </div>
      <div className="flex gap-3 items-center shrink-0">
        <button
          type="button"
          onClick={() => onEdit(factor)}
          aria-label={`Modifier ${factor.nom}`}
          className="material-symbols-outlined text-outline hover:text-primary transition-colors text-sm p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          edit
        </button>
        <button
          type="button"
          onClick={() => onArchive(factor.id, !archived)}
          className="text-[10px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {archived ? 'Restaurer' : 'Archiver'}
        </button>
      </div>
    </div>
  )
}

function CatalogFactorTable({ factors, archived, onArchive }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-surface-highest">
          <th className="text-left text-[10px] font-bold text-outline uppercase tracking-widest pb-2">Nom</th>
          <th className="text-right text-[10px] font-bold text-outline uppercase tracking-widest pb-2">Valeur (kgCO₂e)</th>
          <th className="text-right text-[10px] font-bold text-outline uppercase tracking-widest pb-2">Par unité</th>
          <th className="text-right text-[10px] font-bold text-outline uppercase tracking-widest pb-2">Incertitude</th>
          <th className="text-right text-[10px] font-bold text-outline uppercase tracking-widest pb-2">Source</th>
          <th className="text-right text-[10px] font-bold text-outline uppercase tracking-widest pb-2">Action</th>
        </tr>
      </thead>
      <tbody>
        {factors.map(factor => (
          <tr key={factor.id} className="border-b border-surface-highest/50 last:border-b-0">
            <td className="py-3 text-sm font-medium text-primary">{factor.nom}</td>
            <td className="py-3 text-sm font-headline font-bold text-primary text-right">{factor.valeur}</td>
            <td className="py-3 text-xs text-secondary text-right">/ {factor.unite}</td>
            <td className="py-3 text-xs text-secondary text-right">±{factor.incertitude}%</td>
            <td className="py-3 text-xs text-secondary text-right max-w-[200px] truncate">{factor.source}</td>
            <td className="py-3 text-right">
              <button
                type="button"
                onClick={() => onArchive(factor.id, !archived)}
                className="text-[10px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {archived ? 'Restaurer' : 'Archiver'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function FacteursPanel({
  facteursCustom,
  setFacteursCustom,
  archivedCatalogIds = [],
  setArchivedCatalogIds = () => {},
}) {
  const [search, setSearch] = useState('')
  const [openCategories, setOpenCategories] = useState({})
  const [openArchived, setOpenArchived] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ ...defaultForm })

  const allFactors = getAllFactors()
  const totalADEME = allFactors.length
  const totalCustom = facteursCustom.length
  const activeADEME = allFactors.filter(factor => !archivedCatalogIds.includes(factor.id)).length
  const activeCustomFactors = splitArchivedFactors(facteursCustom, [], true).active
  const archivedCustomFactors = splitArchivedFactors(facteursCustom, [], true).archived
  const totalArchived = totalADEME - activeADEME + archivedCustomFactors.length
  const normalizedSearch = search.toLowerCase()

  // Filtrer les facteurs ADEME par recherche
  const filteredCategories = Object.entries(emissionFactors)
    .map(([catId, factors]) => {
      const matchingFactors = factors.filter(factor =>
        factor.nom.toLowerCase().includes(normalizedSearch) ||
        factor.unite.toLowerCase().includes(normalizedSearch)
      )
      const split = splitArchivedFactors(matchingFactors, archivedCatalogIds)
      return {
        catId,
        label: categoryLabels[catId] || catId,
        activeFactors: split.active,
        archivedFactors: split.archived,
      }
    })
    .filter(cat => cat.activeFactors.length > 0 || cat.archivedFactors.length > 0)

  const toggleCategory = (catId) => {
    setOpenCategories(prev => ({ ...prev, [catId]: !prev[catId] }))
  }

  const toggleArchived = (key) => {
    setOpenArchived(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // CRUD facteurs custom
  const handleSave = () => {
    if (!form.nom || form.valeur === '' || !form.unite) return

    const existing = editingId ? facteursCustom.find(f => f.id === editingId) : null
    const parsedIncertitude = parseFloat(form.incertitude)
    const facteur = {
      ...existing,
      id: editingId || crypto.randomUUID(),
      nom: form.nom,
      unite: form.unite,
      valeur: parseFloat(form.valeur),
      incertitude: Number.isFinite(parsedIncertitude) ? parsedIncertitude : 50,
      perimetre: 'total',
      source: form.source || 'Facteur personnalisé',
      categorie_bc: '',
      categorie_ghg: '',
      custom: true,
      categorieFE: form.categorieFE,
      archived: existing?.archived === true,
    }

    if (editingId) {
      setFacteursCustom(prev => prev.map(f => f.id === editingId ? facteur : f))
    } else {
      setFacteursCustom(prev => [...prev, facteur])
    }

    setForm({ ...defaultForm })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (facteur) => {
    setForm({
      nom: facteur.nom,
      unite: facteur.unite,
      valeur: String(facteur.valeur),
      incertitude: String(facteur.incertitude ?? ''),
      source: facteur.source,
      categorieFE: facteur.categorieFE,
    })
    setEditingId(facteur.id)
    setShowForm(true)
  }

  const handleArchiveCustom = (id, archived) => {
    setFacteursCustom(prev => prev.map(factor => (
      factor.id === id ? { ...factor, archived } : factor
    )))
  }

  const handleArchiveCatalog = (id, archived) => {
    setArchivedCatalogIds(prev => archived
      ? [...new Set([...prev, id])]
      : prev.filter(factorId => factorId !== id)
    )
  }

  const handleCancel = () => {
    setForm({ ...defaultForm })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="grid grid-cols-12 gap-8 items-start">
      {/* Sidebar résumé */}
      <div className="col-span-12 lg:col-span-3 lg:sticky lg:top-32 space-y-6">
        <div className="bg-surface-low p-6">
          <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-4">Bibliothèque</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-secondary">Base ADEME <span className="text-[10px]">actifs / total</span></span>
              <span className="text-2xl font-headline font-black text-primary">{activeADEME}<span className="text-xs text-secondary">/{totalADEME}</span></span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-secondary">Personnalisés <span className="text-[10px]">actifs / total</span></span>
              <span className="text-2xl font-headline font-black text-primary">{activeCustomFactors.length}<span className="text-xs text-secondary">/{totalCustom}</span></span>
            </div>
            <div className="h-[1px] bg-surface-highest my-2" />
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium text-primary">Total actif</span>
              <span className="text-2xl font-headline font-black text-primary">{activeADEME + activeCustomFactors.length}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-secondary">Archivés</span>
              <span className="text-sm font-headline font-bold text-accent-warm">{totalArchived}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-primary-container text-surface">
          <span className="material-symbols-outlined mb-4 block">info</span>
          <h4 className="font-headline font-bold text-xs uppercase mb-2">À propos</h4>
          <p className="text-xs opacity-80 leading-relaxed">
            Les facteurs ADEME proviennent de la Base Carbone 2024. Vous pouvez ajouter vos propres facteurs pour des cas spécifiques (fournisseur, ACV interne, etc.).
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="col-span-12 lg:col-span-9">
        <header className="mb-12">
          <div className="flex items-center gap-2 text-outline text-xs font-bold uppercase tracking-tighter mb-2">
            <span>Configuration</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary">Facteurs d'émission</span>
          </div>
          <h1 className="font-headline text-5xl font-black text-primary tracking-tighter uppercase leading-none">
            Facteurs <span className="text-on-primary-container">d'émission</span>
          </h1>
          <p className="mt-4 text-secondary max-w-2xl leading-relaxed">
            Consultez les facteurs de la Base Carbone ADEME et gérez vos facteurs personnalisés.
          </p>
        </header>

        {/* === Section : Mes facteurs personnalisés === */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight">
              Mes facteurs personnalisés
            </h2>
            {!showForm && (
              <button
                onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...defaultForm }) }}
                className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 hover:opacity-70 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Ajouter un facteur
              </button>
            )}
          </div>

          {/* Formulaire inline */}
          {showForm && (
            <div className="bg-surface-lowest p-8 border-t-[3px] border-primary-container mb-6">
              <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-primary mb-6">
                {editingId ? 'Modifier le facteur' : 'Nouveau facteur'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6">
                <div className="md:col-span-4 space-y-2">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Nom</label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                    className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-base font-headline font-medium transition-all"
                    placeholder="Ex : Acier recyclé"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Valeur (kgCO₂e)</label>
                  <input
                    type="number"
                    value={form.valeur}
                    onChange={e => setForm(f => ({ ...f, valeur: e.target.value }))}
                    className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-xl font-headline font-medium transition-all"
                    placeholder="0.00"
                    min="0"
                    step="any"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Unité</label>
                  <input
                    type="text"
                    value={form.unite}
                    onChange={e => setForm(f => ({ ...f, unite: e.target.value }))}
                    className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-base font-headline font-medium transition-all"
                    placeholder="kg, kWh, L..."
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Incertitude (%)</label>
                  <input
                    type="number"
                    value={form.incertitude}
                    onChange={e => setForm(f => ({ ...f, incertitude: e.target.value }))}
                    className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-base font-headline font-medium transition-all"
                    placeholder="50"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Source</label>
                  <input
                    type="text"
                    value={form.source}
                    onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                    className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-base font-headline font-medium transition-all"
                    placeholder="Fournisseur..."
                  />
                </div>
                <div className="md:col-span-4 space-y-2">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Catégorie d'émission</label>
                  <select
                    value={form.categorieFE}
                    onChange={e => setForm(f => ({ ...f, categorieFE: e.target.value }))}
                    className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-base font-headline font-medium transition-all"
                  >
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-8 flex items-end gap-4">
                  <button
                    onClick={handleSave}
                    disabled={!form.nom || form.valeur === '' || !form.unite}
                    className="bg-primary text-on-primary px-6 py-3 font-headline font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-30"
                  >
                    {editingId ? 'Enregistrer' : 'Ajouter'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-xs font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors px-4 py-3"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Liste des facteurs custom */}
          {facteursCustom.length === 0 && !showForm ? (
            <div className="flex justify-center items-center py-16 border-2 border-dashed border-outline-variant/30">
              <p className="text-sm text-secondary">Aucun facteur personnalisé. Cliquez sur "Ajouter un facteur" pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeCustomFactors.length > 0 ? (
                <div className="space-y-2">
                  {activeCustomFactors.map(factor => (
                    <CustomFactorCard
                      key={factor.id}
                      factor={factor}
                      archived={false}
                      onEdit={handleEdit}
                      onArchive={handleArchiveCustom}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-secondary py-4">Aucun facteur personnalisé actif.</p>
              )}
              {archivedCustomFactors.length > 0 && (
                <div className="border-t border-surface-highest pt-3">
                  <button
                    type="button"
                    onClick={() => toggleArchived('custom')}
                    aria-expanded={Boolean(openArchived.custom)}
                    aria-controls="custom-archived-factors"
                    className="w-full flex items-center justify-between text-left text-[10px] font-bold uppercase tracking-widest text-accent-warm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <span>Archivés ({archivedCustomFactors.length})</span>
                    <span className="material-symbols-outlined text-sm">{openArchived.custom ? 'expand_less' : 'expand_more'}</span>
                  </button>
                  {openArchived.custom && (
                    <div id="custom-archived-factors" className="space-y-2 mt-3">
                      {archivedCustomFactors.map(factor => (
                        <CustomFactorCard
                          key={factor.id}
                          factor={factor}
                          archived
                          onEdit={handleEdit}
                          onArchive={handleArchiveCustom}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* === Section : Base Carbone ADEME === */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight">
              Base Carbone ADEME 2024
            </h2>
            <span className="text-xs text-secondary">{activeADEME} actifs / {totalADEME} facteurs</span>
          </div>

          {/* Barre de recherche */}
          <div className="mb-6">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary pl-8 pr-0 py-3 text-base font-headline font-medium transition-all"
                placeholder="Rechercher un facteur..."
              />
            </div>
          </div>

          {/* Accordéon par catégorie */}
          <div className="space-y-2">
            {filteredCategories.map(({ catId, label, activeFactors, archivedFactors }) => (
              <div key={catId} className="bg-surface-container">
                <button
                  type="button"
                  onClick={() => toggleCategory(catId)}
                  aria-expanded={Boolean(openCategories[catId])}
                  aria-controls={`category-${catId}`}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-container/80 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-headline font-bold text-sm text-primary">{label}</span>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                      {activeFactors.length} actifs{archivedFactors.length > 0 ? ` · ${archivedFactors.length} archivés` : ''}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-outline text-sm transition-transform" style={{ transform: openCategories[catId] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                  </span>
                </button>

                {openCategories[catId] && (
                  <div id={`category-${catId}`} className="px-5 pb-5">
                    {activeFactors.length > 0 ? (
                      <CatalogFactorTable factors={activeFactors} onArchive={handleArchiveCatalog} />
                    ) : (
                      <p className="text-sm text-secondary py-4">Aucun facteur actif pour cette recherche.</p>
                    )}
                    {archivedFactors.length > 0 && (
                      <div className="border-t border-surface-highest mt-5 pt-3">
                        <button
                          type="button"
                          onClick={() => toggleArchived(`catalog-${catId}`)}
                          aria-expanded={Boolean(openArchived[`catalog-${catId}`])}
                          aria-controls={`archived-${catId}`}
                          className="w-full flex items-center justify-between text-left text-[10px] font-bold uppercase tracking-widest text-accent-warm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          <span>Archivés ({archivedFactors.length})</span>
                          <span className="material-symbols-outlined text-sm">
                            {openArchived[`catalog-${catId}`] ? 'expand_less' : 'expand_more'}
                          </span>
                        </button>
                        {openArchived[`catalog-${catId}`] && (
                          <div id={`archived-${catId}`} className="mt-3">
                            <CatalogFactorTable factors={archivedFactors} archived onArchive={handleArchiveCatalog} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* === Section : Sources de données === */}
        <section className="mt-12">
          <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-6">
            Sources de données disponibles
          </h2>
          <p className="text-sm text-secondary mb-6 max-w-2xl">
            Bases de facteurs d'émission publiques ou semi-publiques utilisables pour enrichir votre bilan carbone.
          </p>
          <div className="space-y-3">
            {emissionFactorSources.map(src => (
              <div key={src.id} className="bg-surface-container p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-headline font-bold text-sm text-primary">{src.nom}</span>
                      {src.feMonetaires && (
                        <span className="text-[9px] font-bold uppercase tracking-widest bg-primary text-on-primary px-2 py-0.5">€ monétaire</span>
                      )}
                    </div>
                    <p className="text-xs text-secondary mb-2">{src.organisme}</p>
                    <p className="text-xs text-outline leading-relaxed">{src.description}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3">
                      <span className="text-[10px] text-secondary"><strong>Accès :</strong> {src.acces}</span>
                      <span className="text-[10px] text-secondary"><strong>MAJ :</strong> {src.miseAJour}</span>
                      <span className="text-[10px] text-secondary"><strong>Licence :</strong> {src.licence}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => isTauri() ? openUrl(src.url) : window.open(src.url, '_blank', 'noopener,noreferrer')}
                    className="shrink-0 text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1 hover:opacity-70 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    Accéder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
