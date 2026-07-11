import { useState } from 'react'

export default function ProjetForm({ projet, setProjet, onDemoFill, onReset, lignes = [], setLignes }) {
  const [newSite, setNewSite] = useState('')

  const handleChange = (field, value) => {
    setProjet(prev => ({ ...prev, [field]: value }))
  }

  const handleAddSite = () => {
    const name = newSite.trim()
    if (!name || (projet.sites || []).includes(name)) return
    setProjet(prev => ({ ...prev, sites: [...(prev.sites || []), name] }))
    setNewSite('')
  }

  const handleRemoveSite = (site) => {
    const orphansCount = lignes.filter(l => l.site === site).length
    if (orphansCount > 0) {
      const msg = `${orphansCount} ligne${orphansCount > 1 ? 's' : ''} ${orphansCount > 1 ? 'sont' : 'est'} associée${orphansCount > 1 ? 's' : ''} au site « ${site} ».\n\nOK : désassigner ces lignes du site (elles sont conservées).\nAnnuler : garder le site.`
      if (!window.confirm(msg)) return
      if (setLignes) {
        setLignes(prev => prev.map(l => l.site === site ? { ...l, site: null } : l))
      }
    }
    setProjet(prev => ({ ...prev, sites: (prev.sites || []).filter(s => s !== site) }))
  }

  const handleResetClick = () => {
    const n = lignes.length
    const msg = n > 0
      ? `Effacer toutes les données du projet ?\n\n${n} ligne${n > 1 ? 's' : ''} de collecte ${n > 1 ? 'seront supprimées' : 'sera supprimée'} définitivement, ainsi que les informations de l'entreprise.\n\nCette action est irréversible.`
      : `Effacer les informations du projet ?\n\nCette action est irréversible.`
    if (!window.confirm(msg)) return
    onReset()
  }

  return (
    <div>
      {/* Header */}
      <header className="mb-12">
        <div className="h-[2px] w-12 bg-primary mb-6" />
        <h1 className="text-5xl font-headline font-bold text-primary tracking-tight leading-none mb-4">
          Informations du projet
        </h1>
        <div className="flex items-center gap-6">
          <p className="text-secondary max-w-lg leading-relaxed">
            Cadrage de la mission : entreprise, effectif, période de référence et périmètre organisationnel.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            {onDemoFill && (
              <button
                onClick={onDemoFill}
                className="flex items-center gap-2 bg-accent-warm text-on-primary px-5 py-3 font-headline font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                Démo
              </button>
            )}
            {onReset && (
              <button
                onClick={handleResetClick}
                className="flex items-center gap-2 border-2 border-outline text-outline px-5 py-3 font-headline font-bold text-xs uppercase tracking-widest hover:border-error hover:text-error transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                Effacer
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Formulaire principal */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Entreprise */}
          <section className="bg-surface-lowest p-8 border-t-[3px] border-primary-container">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="font-headline text-2xl font-bold text-primary tracking-tight mb-1">
                  Entreprise
                </h3>
                <p className="text-sm text-secondary">Identité et secteur d'activité de l'entreprise.</p>
              </div>
              <span className="material-symbols-outlined text-primary-container/20">apartment</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  value={projet.nom || ''}
                  onChange={e => handleChange('nom', e.target.value)}
                  className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-xl font-headline font-medium transition-all"
                  placeholder="Ex : Transport Express SAS"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">
                  Code NAF / APE
                </label>
                <input
                  type="text"
                  value={projet.naf || ''}
                  onChange={e => handleChange('naf', e.target.value)}
                  className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-xl font-headline font-medium transition-all"
                  placeholder="Ex : 49.41A"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">
                  Secteur d'activité
                </label>
                <select
                  value={projet.secteur || ''}
                  onChange={e => handleChange('secteur', e.target.value)}
                  className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-base font-headline font-medium transition-all"
                >
                  <option value="">— Sélectionner —</option>
                  <optgroup label="Transport & logistique">
                    <option value="transport_routier">Transport routier de marchandises</option>
                    <option value="commission_transport">Commission de transport</option>
                    <option value="logistique">Logistique et entreposage</option>
                  </optgroup>
                  <optgroup label="Tertiaire">
                    <option value="services">Services aux entreprises</option>
                    <option value="informatique_numerique">Informatique et numérique</option>
                    <option value="immobilier">Immobilier et gestion de biens</option>
                  </optgroup>
                  <optgroup label="Commerce & industrie">
                    <option value="commerce">Commerce</option>
                    <option value="industrie">Industrie / Production</option>
                    <option value="btp">BTP</option>
                  </optgroup>
                  <optgroup label="Hébergement & restauration">
                    <option value="hotellerie_tourisme">Hôtellerie et tourisme</option>
                    <option value="restauration">Restauration</option>
                  </optgroup>
                  <optgroup label="Autres secteurs">
                    <option value="agriculture">Agriculture</option>
                    <option value="sante">Santé</option>
                    <option value="autre">Autre</option>
                  </optgroup>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">
                  Ville
                </label>
                <input
                  type="text"
                  value={projet.ville || ''}
                  onChange={e => handleChange('ville', e.target.value)}
                  className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-xl font-headline font-medium transition-all"
                  placeholder="Ex : Lyon"
                />
              </div>
            </div>
          </section>

          {/* Taille et Période */}
          <section className="bg-surface-lowest p-8 border-t-[3px] border-primary-container">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="font-headline text-2xl font-bold text-primary tracking-tight mb-1">
                  Taille et périmètre
                </h3>
                <p className="text-sm text-secondary">Dimensionnement de l'entreprise et cadrage temporel.</p>
              </div>
              <span className="material-symbols-outlined text-primary-container/20">analytics</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">
                  Effectif (ETP) *
                </label>
                <input
                  type="number"
                  value={projet.effectif || ''}
                  onChange={e => handleChange('effectif', parseInt(e.target.value) || '')}
                  className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-xl font-headline font-medium transition-all"
                  placeholder="Ex : 25"
                  min="1"
                  max="50"
                />
                {projet.effectif > 50 && (
                  <p className="text-[10px] text-error uppercase tracking-widest font-bold">
                    Au-delà de 50 ETP, l'outil sort de son périmètre de validité (PME &lt;50 salariés)
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">
                  Chiffre d'affaires (k€ HT)
                </label>
                <input
                  type="number"
                  value={projet.ca || ''}
                  onChange={e => handleChange('ca', parseFloat(e.target.value) || '')}
                  className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-xl font-headline font-medium transition-all"
                  placeholder="Ex : 3500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">
                  Surface des locaux (m²)
                </label>
                <input
                  type="number"
                  value={projet.surface || ''}
                  onChange={e => handleChange('surface', parseFloat(e.target.value) || '')}
                  className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-xl font-headline font-medium transition-all"
                  placeholder="Ex : 450"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">
                  Année de référence *
                </label>
                <select
                  value={projet.annee || '2025'}
                  onChange={e => handleChange('annee', e.target.value)}
                  className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-xl font-headline font-medium transition-all"
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
            </div>
          </section>
          {/* Sites / Établissements */}
          <section className="bg-surface-lowest p-8 border-t-[3px] border-primary-container">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="font-headline text-2xl font-bold text-primary tracking-tight mb-1">
                  Sites / Établissements
                </h3>
                <p className="text-sm text-secondary">Optionnel — ajoutez des sites pour ventiler la collecte par établissement.</p>
              </div>
              <span className="material-symbols-outlined text-primary-container/20">location_city</span>
            </div>

            <div className="flex items-end gap-4 mb-6">
              <div className="flex-1 space-y-2">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">
                  Ajouter un site
                </label>
                <input
                  type="text"
                  value={newSite}
                  onChange={e => setNewSite(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddSite()}
                  className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-xl font-headline font-medium transition-all"
                  placeholder="Ex : Siège Lyon, Entrepôt Marseille"
                />
              </div>
              <button
                onClick={handleAddSite}
                className="bg-primary text-on-primary px-5 py-2 font-headline font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Ajouter
              </button>
            </div>

            {(projet.sites || []).length > 0 && (
              <div className="space-y-2">
                {projet.sites.map(site => (
                  <div key={site} className="flex items-center justify-between bg-surface-container px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                      <span className="font-headline font-medium text-sm text-primary">{site}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveSite(site)}
                      className="material-symbols-outlined text-outline hover:text-error text-sm transition-colors"
                    >
                      close
                    </button>
                  </div>
                ))}
              </div>
            )}

            {(projet.sites || []).length === 0 && (
              <p className="text-xs text-outline italic">Aucun site défini — l'outil fonctionne en mode mono-site.</p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-32">
          <div className="bg-primary-container text-surface p-8">
            <span className="material-symbols-outlined mb-4 block">info</span>
            <h4 className="font-headline font-bold text-xs uppercase mb-3 tracking-widest">
              Note méthodologique
            </h4>
            <p className="text-xs opacity-80 leading-relaxed mb-4">
              L'outil utilise par défaut l'approche <strong>contrôle opérationnel</strong> et les PRG AR5 (cohérence Base Carbone ADEME).
            </p>
            <p className="text-xs opacity-80 leading-relaxed">
              Le bilan couvre les Scope 1, 2 et 3 pertinents pour une PME &lt;50 salariés.
            </p>
          </div>

          <div className="bg-surface-low p-8">
            <h4 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-4">
              Périmètre organisationnel
            </h4>
            <select
              value={projet.perimetre || 'controle_operationnel'}
              onChange={e => handleChange('perimetre', e.target.value)}
              className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-sm font-headline font-medium transition-all"
            >
              <option value="controle_operationnel">Contrôle opérationnel</option>
              <option value="controle_financier">Contrôle financier</option>
              <option value="part_capital">Part du capital</option>
            </select>
            <p className="text-[10px] text-outline mt-3 leading-relaxed">
              Recommandé pour les PME &lt;50 salariés.
            </p>
          </div>

          <div className="bg-surface-highest p-8">
            <h4 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-4">
              Référentiels
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                <span>Bilan Carbone® V9 (ABC)</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                <span>GHG Protocol Corp. Std.</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                <span>Base Carbone ADEME 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
