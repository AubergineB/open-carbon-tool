import { useState } from 'react'
import { isTauri } from '@tauri-apps/api/core'
import { openUrl } from '@tauri-apps/plugin-opener'
import emissionFactors, { getAllFactors } from '../data/emissionFactors'
import emissionFactorSources from '../data/emissionFactorSources'

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

export default function FacteursPanel({ facteursCustom, setFacteursCustom }) {
  const [search, setSearch] = useState('')
  const [openCategories, setOpenCategories] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ ...defaultForm })

  const allFactors = getAllFactors()
  const totalADEME = allFactors.length
  const totalCustom = facteursCustom.length

  // Filtrer les facteurs ADEME par recherche
  const filteredCategories = Object.entries(emissionFactors)
    .map(([catId, factors]) => ({
      catId,
      label: categoryLabels[catId] || catId,
      factors: factors.filter(f =>
        f.nom.toLowerCase().includes(search.toLowerCase()) ||
        f.unite.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(cat => cat.factors.length > 0)

  const toggleCategory = (catId) => {
    setOpenCategories(prev => ({ ...prev, [catId]: !prev[catId] }))
  }

  // CRUD facteurs custom
  const handleSave = () => {
    if (!form.nom || !form.valeur || !form.unite) return

    const facteur = {
      id: editingId || crypto.randomUUID(),
      nom: form.nom,
      unite: form.unite,
      valeur: parseFloat(form.valeur),
      incertitude: parseFloat(form.incertitude) || 50,
      perimetre: 'total',
      source: form.source || 'Facteur personnalisé',
      categorie_bc: '',
      categorie_ghg: '',
      custom: true,
      categorieFE: form.categorieFE,
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
      incertitude: String(facteur.incertitude),
      source: facteur.source,
      categorieFE: facteur.categorieFE,
    })
    setEditingId(facteur.id)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    setFacteursCustom(prev => prev.filter(f => f.id !== id))
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
              <span className="text-sm text-secondary">Base ADEME</span>
              <span className="text-2xl font-headline font-black text-primary">{totalADEME}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-secondary">Personnalisés</span>
              <span className="text-2xl font-headline font-black text-primary">{totalCustom}</span>
            </div>
            <div className="h-[1px] bg-surface-highest my-2" />
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium text-primary">Total disponible</span>
              <span className="text-2xl font-headline font-black text-primary">{totalADEME + totalCustom}</span>
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
                    disabled={!form.nom || !form.valeur || !form.unite}
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
            <div className="space-y-2">
              {facteursCustom.map(f => (
                <div key={f.id} className="bg-surface-lowest p-5 border-t-[3px] border-primary-container/30 flex items-center gap-6">
                  <div className="flex-1 min-w-0">
                    <p className="font-headline font-bold text-sm text-primary truncate">{f.nom}</p>
                    <p className="text-xs text-secondary mt-1">
                      {categoryLabels[f.categorieFE] || f.categorieFE} · {f.source}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-headline font-black text-lg text-primary">{f.valeur}</span>
                    <span className="text-xs text-secondary ml-1">kgCO₂e/{f.unite}</span>
                  </div>
                  <div className="text-right shrink-0 text-xs text-secondary">
                    ±{f.incertitude}%
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(f)}
                      className="material-symbols-outlined text-outline hover:text-primary transition-colors text-sm p-1"
                    >
                      edit
                    </button>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="material-symbols-outlined text-outline hover:text-error transition-colors text-sm p-1"
                    >
                      delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* === Section : Base Carbone ADEME === */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight">
              Base Carbone ADEME 2024
            </h2>
            <span className="text-xs text-secondary">{totalADEME} facteurs</span>
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
            {filteredCategories.map(({ catId, label, factors }) => (
              <div key={catId} className="bg-surface-container">
                <button
                  onClick={() => toggleCategory(catId)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-container/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-headline font-bold text-sm text-primary">{label}</span>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{factors.length} FE</span>
                  </div>
                  <span className="material-symbols-outlined text-outline text-sm transition-transform" style={{ transform: openCategories[catId] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                  </span>
                </button>

                {openCategories[catId] && (
                  <div className="px-5 pb-5">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-surface-highest">
                          <th className="text-left text-[10px] font-bold text-outline uppercase tracking-widest pb-2">Nom</th>
                          <th className="text-right text-[10px] font-bold text-outline uppercase tracking-widest pb-2">Valeur (kgCO₂e)</th>
                          <th className="text-right text-[10px] font-bold text-outline uppercase tracking-widest pb-2">Par unité</th>
                          <th className="text-right text-[10px] font-bold text-outline uppercase tracking-widest pb-2">Incertitude</th>
                          <th className="text-right text-[10px] font-bold text-outline uppercase tracking-widest pb-2">Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {factors.map(f => (
                          <tr key={f.id} className="border-b border-surface-highest/50 last:border-b-0">
                            <td className="py-3 text-sm font-medium text-primary">{f.nom}</td>
                            <td className="py-3 text-sm font-headline font-bold text-primary text-right">{f.valeur}</td>
                            <td className="py-3 text-xs text-secondary text-right">/ {f.unite}</td>
                            <td className="py-3 text-xs text-secondary text-right">±{f.incertitude}%</td>
                            <td className="py-3 text-xs text-secondary text-right max-w-[200px] truncate">{f.source}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
