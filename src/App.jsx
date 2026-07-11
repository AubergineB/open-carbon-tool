import { useState, useEffect, useCallback } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { isTauri } from '@tauri-apps/api/core'
import { pickWorkdir, restoreWorkdir, readProjet, writeProjet, readFacteursCustom, writeFacteursCustom } from './lib/store'
import { useAutoSave } from './hooks/useAutoSave'
import SaveIndicator from './components/SaveIndicator'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import WorkdirSelector from './components/WorkdirSelector'
import ProjetSelector from './components/ProjetSelector'
import ProjetForm from './components/ProjetForm'
import CollecteForm from './components/CollecteForm'
import Resultats from './components/Resultats'
import FacteursPanel from './components/FacteursPanel'
import Avancement from './components/Avancement'
import MentionsLegales from './components/MentionsLegales'
import PlanAction from './components/PlanAction'
import { calculerEmission } from './utils/calculEngine'
import postesEmission from './data/postesEmission'
import { collecteGroupsMap } from './data/collecteGroups'
import { FACTORS_VERSION } from './lib/store'

function App() {
  const [showLegal, setShowLegal] = useState(false)
  const [workdir, setWorkdir] = useState(null)
  const [booting, setBooting] = useState(true)
  const [bootError, setBootError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function boot() {
      try {
        const selectedWorkdir = await restoreWorkdir()
        if (!cancelled) setWorkdir(selectedWorkdir)
      } catch (error) {
        if (!cancelled) setBootError(error.message || 'Impossible d’ouvrir le dossier de travail.')
      } finally {
        if (!cancelled) setBooting(false)
      }
    }
    boot()
    return () => { cancelled = true }
  }, [])

  if (showLegal) return <MentionsLegales onBack={() => setShowLegal(false)} />
  if (booting) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary animate-pulse mx-auto mb-4" />
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Ouverture...</p>
        </div>
      </div>
    )
  }
  if (bootError) {
    return <WorkdirSelector onSelected={setWorkdir} onShowLegal={() => setShowLegal(true)} />
  }
  if (!workdir) return <WorkdirSelector onSelected={setWorkdir} onShowLegal={() => setShowLegal(true)} />
  async function handleChangeWorkdir() {
    const selected = await pickWorkdir()
    if (selected) setWorkdir(selected)
  }
  return <AppContent workdir={workdir} onChangeWorkdir={handleChangeWorkdir} onShowLegal={() => setShowLegal(true)} />
}

const PROJET_INITIAL = {
  nom: '', naf: '', effectif: 0, ca: 0, surface: 0,
  annee: '2025', perimetre: 'controle_operationnel', ville: '', secteur: '',
  sites: [],
}

function AppContent({ workdir, onChangeWorkdir, onShowLegal }) {
  const [currentView, setCurrentView] = useState('collecte-energie')
  const [projetPath, setProjetPath] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [loadRetry, setLoadRetry] = useState(0)

  const [projet, setProjet] = useState(PROJET_INITIAL)

  const [lignes, setLignes] = useState([])
  const [facteursCustom, setFacteursCustom] = useState([])
  const [sectionsStatus, setSectionsStatus] = useState({})
  const [sectionsAssignees, setSectionsAssignees] = useState({})
  const [factorNotice, setFactorNotice] = useState(null)

  // Chargement du projet sélectionné depuis un fichier JSON local.
  useEffect(() => {
    if (!projetPath) return
    async function load() {
      setDataLoading(true)
      setLoadError(null)
      try {
        const data = await readProjet(projetPath)
        setProjet(data.projet)
        setSectionsStatus(data.sectionsStatus || {})
        setSectionsAssignees(data.sectionsAssignees || {})
        const customFactors = await readFacteursCustom(workdir)
        const sourceLines = data.lignes || []
        const factorsChanged = data.factorsVersion !== FACTORS_VERSION
        const nextLines = factorsChanged
          ? sourceLines.map(line => ({
            ...line,
            resultat: calculerEmission(
              line.valeur,
              line.facteurId,
              customFactors.find(factor => factor.id === line.facteurId) || null,
            ),
          }))
          : sourceLines
        setLignes(nextLines)
        setFacteursCustom(customFactors)
        if (factorsChanged) {
          const previousTotal = sourceLines.reduce((sum, line) => sum + (line.resultat?.total_t || 0), 0)
          const nextTotal = nextLines.reduce((sum, line) => sum + (line.resultat?.total_t || 0), 0)
          const delta = nextTotal - previousTotal
          const deltaPercent = previousTotal > 0 ? (delta / previousTotal) * 100 : 0
          setFactorNotice(`Les facteurs ont été mis à jour (${FACTORS_VERSION}). Écart total : ${delta >= 0 ? '+' : ''}${delta.toFixed(3)} tCO₂e (${deltaPercent >= 0 ? '+' : ''}${deltaPercent.toFixed(1)} %).`)
        } else {
          setFactorNotice(null)
        }
      } catch (err) {
        console.error('Erreur chargement projet:', err)
        setLoadError(`Impossible de charger ${projetPath}. Le fichier est-il toujours accessible ?`)
      }
      setDataLoading(false)
    }
    load()
  }, [projetPath, workdir, loadRetry])


  function resetProjetState() {
    setProjet(PROJET_INITIAL)
    setLignes([])
    setSectionsStatus({})
    setSectionsAssignees({})
  }

  function handleBackToList() {
    setProjetPath(null)
    setCurrentView('collecte-energie')
    resetProjetState()
  }

  // Auto-save projet
  const saveProjetFn = useCallback(async () => {
    if (projetPath) await writeProjet(projetPath, {
      projet,
      lignes,
      sectionsStatus,
      sectionsAssignees,
      factorsVersion: FACTORS_VERSION,
    })
  }, [projetPath, projet, lignes, sectionsStatus, sectionsAssignees])
  const projectData = { projet, lignes, sectionsStatus, sectionsAssignees }
  const { saveStatus: projetSaveStatus, retry: retryProjet, flush: flushProjet } = useAutoSave(saveProjetFn, projectData)

  // Auto-save facteurs custom
  const saveFcFn = useCallback(async () => {
    if (workdir) await writeFacteursCustom(workdir, facteursCustom)
  }, [workdir, facteursCustom])
  const { saveStatus: fcSaveStatus, retry: retryFc, flush: flushFacteurs } = useAutoSave(saveFcFn, facteursCustom)

  useEffect(() => {
    if (!isTauri()) return undefined
    let unlisten
    getCurrentWindow().onCloseRequested(async event => {
      event.preventDefault()
      try {
        await Promise.all([flushProjet(), flushFacteurs()])
        await getCurrentWindow().destroy()
      } catch (error) {
        console.error('Impossible de sauvegarder avant la fermeture :', error)
      }
    }).then(listener => { unlisten = listener })
    return () => { unlisten?.() }
  }, [flushProjet, flushFacteurs])

  // Les quatre morceaux du bilan vivent désormais dans un seul fichier.
  const allStatuses = [projetSaveStatus, fcSaveStatus]
  const saveStatus = ['error', 'saving', 'saved'].find(s => allStatuses.includes(s)) ?? 'idle'

  const handleRetryAll = useCallback(() => {
    if (projetSaveStatus === 'error') retryProjet()
    if (fcSaveStatus === 'error') retryFc()
  }, [projetSaveStatus, fcSaveStatus, retryProjet, retryFc])

  const collecteGroup = collecteGroupsMap[currentView] || null
  const showSidebar = !!collecteGroup


  const handleDemoFill = () => {
    setProjet({
      nom: 'Acme Corp',
      naf: '49.41A',
      effectif: 28,
      ca: 3500,
      surface: 450,
      annee: '2025',
      perimetre: 'controle_operationnel',
      ville: 'Lyon',
      secteur: 'transport_routier',
    })

    const demoData = [
      // Scope 1 — Combustion fixe
      { posteId: 'combustion_fixe', facteurId: 'gaz_nat_kwh', valeur: 85000, precision: 'P2', source: 'Facture GRDF' },
      { posteId: 'combustion_fixe', facteurId: 'fioul_dom_l', valeur: 1200, precision: 'P2', source: 'Facture fioul' },
      // Scope 1 — Combustion mobile
      { posteId: 'combustion_mobile', facteurId: 'diesel_l', valeur: 42000, precision: 'P2', source: 'Cartes carburant' },
      { posteId: 'combustion_mobile', facteurId: 'essence_sp95_l', valeur: 3500, precision: 'P2', source: 'Cartes carburant' },
      { posteId: 'combustion_mobile', facteurId: 'biodiesel_b100_l', valeur: 5000, precision: 'P2', source: 'Cartes carburant — flotte B100' },
      // Scope 2 — Électricité
      { posteId: 'electricite', facteurId: 'elec_france_kwh', valeur: 120000, precision: 'P2', source: 'Facture EDF' },
      // Scope 3 — Achats
      { posteId: 'achats', facteurId: 'achats_services_info', valeur: 45000, precision: 'P0', source: 'Comptabilité' },
      { posteId: 'achats', facteurId: 'achats_conseil_juridique', valeur: 18000, precision: 'P0', source: 'Comptabilité' },
      { posteId: 'achats', facteurId: 'achats_assurance', valeur: 32000, precision: 'P0', source: 'Comptabilité' },
      { posteId: 'achats', facteurId: 'achats_telecom', valeur: 8500, precision: 'P0', source: 'Comptabilité' },
      { posteId: 'achats', facteurId: 'achats_alimentaire', valeur: 15000, precision: 'P0', source: 'Restaurant inter-entreprise' },
      // Scope 3 — Immobilisations
      { posteId: 'immobilisations', facteurId: 'immo_laptop', valeur: 8, precision: 'P1', source: 'Inventaire IT' },
      { posteId: 'immobilisations', facteurId: 'immo_smartphone', valeur: 12, precision: 'P1', source: 'Inventaire IT' },
      // Scope 3 — Fret amont
      { posteId: 'fret_amont', facteurId: 'fret_routier_pl44_tkm', valeur: 280000, precision: 'P1', source: 'Estimation tonnage' },
      // Scope 3 — Déchets
      { posteId: 'dechets', facteurId: 'dechets_dib_incin', valeur: 4.5, precision: 'P1', source: 'Prestataire déchets' },
      { posteId: 'dechets', facteurId: 'dechets_papier_recycl', valeur: 1.2, precision: 'P1', source: 'Prestataire déchets' },
      // Scope 3 — Déplacements pro
      { posteId: 'deplacements_pro', facteurId: 'train_tgv_km', valeur: 45000, precision: 'P2', source: 'Notes de frais' },
      { posteId: 'deplacements_pro', facteurId: 'avion_court_km', valeur: 8000, precision: 'P2', source: 'Notes de frais' },
      // Scope 3 — Trajets domicile-travail
      { posteId: 'deplacements_dt', facteurId: 'dt_voiture_solo_km', valeur: 180000, precision: 'P1', source: 'Enquête mobilité' },
      { posteId: 'deplacements_dt', facteurId: 'dt_metro_km', valeur: 25000, precision: 'P1', source: 'Enquête mobilité' },
      { posteId: 'deplacements_dt', facteurId: 'dt_velo_elec_km', valeur: 8000, precision: 'P1', source: 'Enquête mobilité' },
      // Scope 3 — Fret aval
      { posteId: 'fret_aval', facteurId: 'fret_routier_vul_tkm', valeur: 95000, precision: 'P1', source: 'Estimation livraisons' },
    ]

    const postesById = new Map(postesEmission.map(p => [p.id, p])) // lookup pour la démo
    const validDemoData = demoData.filter(d => postesById.has(d.posteId))
    const newLignes = validDemoData.map(d => {
      const poste = postesById.get(d.posteId)
      const resultat = calculerEmission(d.valeur, d.facteurId)
      return {
        _key: crypto.randomUUID(),
        posteId: d.posteId,
        scope: poste.scope,
        categorie_bc: poste.nom_bc,
        categorie_ghg: poste.nom_ghg,
        facteurId: d.facteurId,
        valeur: d.valeur,
        precision: d.precision,
        source: d.source,
        resultat,
      }
    })

    setLignes(newLignes)

    const newStatus = {}
    const touchedPostes = new Set(validDemoData.map(d => d.posteId))
    postesEmission.forEach(p => {
      if (touchedPostes.has(p.id)) newStatus[p.id] = 'confirmed'
    })
    setSectionsStatus(newStatus)
  }

  // Étape 1 : sélection du bilan
  if (!projetPath) {
    return (
      <ProjetSelector
        workdir={workdir}
        onSelectProjet={setProjetPath}
        onBack={onChangeWorkdir}
        onChangeWorkdir={onChangeWorkdir}
      />
    )
  }

  // Étape 3 : chargement des données
  if (loadError) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 bg-error mx-auto mb-6 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-2xl">cloud_off</span>
          </div>
          <h2 className="font-headline text-xl font-bold text-primary mb-3">Erreur de chargement</h2>
          <p className="text-secondary text-sm mb-8">{loadError}</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => { setProjetPath(null); setLoadError(null) }}
              className="bg-surface-highest text-primary px-6 py-3 font-bold text-xs uppercase tracking-widest hover:bg-surface-container transition-all"
            >
              Retour
            </button>
            <button
              onClick={() => { setLoadError(null); setLoadRetry(r => r + 1) }}
              className="bg-primary text-on-primary px-6 py-3 font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary animate-pulse mx-auto mb-4" />
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Chargement des données...</p>
        </div>
      </div>
    )
  }

  // Étape 4 : espace de travail
  return (
    <div className="min-h-screen bg-surface">
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        projet={projet}
        saveStatus={saveStatus}
        onBackToList={handleBackToList}
        onShowLegal={onShowLegal}
        onChangeWorkdir={onChangeWorkdir}
      />
      {showSidebar && <Sidebar currentView={currentView} setCurrentView={setCurrentView} projet={projet} />}

      {saveStatus === 'error' && (
        <div className={`${showSidebar ? 'ml-64' : 'ml-0'} bg-error text-on-primary px-8 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-sm">error</span>
            <span className="text-xs font-bold uppercase tracking-widest">
              Impossible d'écrire dans {workdir} — le dossier est-il toujours accessible ?
            </span>
          </div>
          <button
            onClick={handleRetryAll}
            className="flex items-center gap-2 bg-on-primary/20 hover:bg-on-primary/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Réessayer
          </button>
          <button
            onClick={onChangeWorkdir}
            className="flex items-center gap-2 bg-on-primary/20 hover:bg-on-primary/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <span className="material-symbols-outlined text-sm">save_as</span>
            Enregistrer sous…
          </button>
        </div>
      )}
      {factorNotice && (
        <div className={`${showSidebar ? 'ml-64' : 'ml-0'} bg-accent-warm text-on-primary px-8 py-3 flex items-center justify-between`}>
          <span className="text-xs font-bold uppercase tracking-widest">{factorNotice}</span>
          <button onClick={() => setFactorNotice(null)} className="material-symbols-outlined text-sm">close</button>
        </div>
      )}

      <main className={`${showSidebar ? 'ml-64' : 'ml-0'} flex-1 p-8 pt-12 bg-surface`}>
        {currentView === 'projet' && (
          <ProjetForm projet={projet} setProjet={setProjet} onDemoFill={handleDemoFill} onReset={resetProjetState} lignes={lignes} setLignes={setLignes} />
        )}
        {collecteGroup && (
          <CollecteForm collecteGroup={collecteGroup} currentView={currentView} lignes={lignes} setLignes={setLignes} facteursCustom={facteursCustom} sectionsStatus={sectionsStatus} setSectionsStatus={setSectionsStatus} sectionsAssignees={sectionsAssignees} secteur={projet.secteur} sites={projet.sites || []} />
        )}
        {currentView === 'avancement' && (
          <Avancement lignes={lignes} sectionsStatus={sectionsStatus} setSectionsStatus={setSectionsStatus} sectionsAssignees={sectionsAssignees} setSectionsAssignees={setSectionsAssignees} setCurrentView={setCurrentView} />
        )}
        {currentView === 'facteurs' && (
          <FacteursPanel facteursCustom={facteursCustom} setFacteursCustom={setFacteursCustom} />
        )}
        {currentView === 'resultats' && (
          <Resultats projet={projet} lignes={lignes} workdir={workdir} projetPath={projetPath} />
        )}
        {currentView === 'plan-action' && (
          <PlanAction projet={projet} lignes={lignes} />
        )}
      </main>

      <footer className={`${showSidebar ? 'ml-64' : 'ml-0'} border-t border-surface-container px-8 py-6 bg-surface`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img src="/logo-oct.svg" alt="Open Carbon Tool" className="h-4 opacity-40" />
            <span className="text-[10px] text-outline uppercase tracking-widest">
              Open Carbon Tool — édité par Mobility Transition Lab
            </span>
          </div>
          <div className="flex items-center gap-6">
            {onShowLegal && (
              <button
                onClick={onShowLegal}
                className="text-[10px] text-outline hover:text-primary uppercase tracking-widest transition-colors"
              >
                Mentions légales
              </button>
            )}
            <span className="text-[10px] text-outline uppercase tracking-widest">
              contact : henri.m.ducasse@gmail.com
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
