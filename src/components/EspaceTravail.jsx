import { useState } from 'react'
import { densites, ratiosPcsPci, energieVersKwh, densitesDechets } from '../data/conversionConstants'
import { getFactorsByCategory } from '../data/emissionFactors'
import { convertirMasseVolume, convertirPcsPci, estimerTkmDepuisEuros, convertirEnergie, convertirDechetsVolume } from '../utils/conversions'

const fretFactorsTkm = getFactorsByCategory('fret').filter(f => f.unite === 'tkm')
const fluidesFugitifs = getFactorsByCategory('fugitives').filter(f => f.unite === 'kg')
const energieUnites = Object.keys(energieVersKwh)
const dechetsTypes = Object.keys(densitesDechets)

function parseInputValeur(raw) {
  if (raw === '' || raw == null) return NaN
  return parseFloat(String(raw).replace(',', '.'))
}

function formatNombre(valeur) {
  if (typeof valeur !== 'number' || !Number.isFinite(valeur)) return '—'
  return new Intl.NumberFormat('fr-FR', { maximumSignificantDigits: 4 }).format(valeur)
}

function roundForInput(valeur) {
  return String(parseFloat(valeur.toPrecision(6)))
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  if (!text) return null

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="flex items-center gap-2 bg-surface-highest text-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container transition-colors"
    >
      <span className="material-symbols-outlined text-sm">content_copy</span>
      {copied ? 'Copié' : 'Copier'}
    </button>
  )
}

function SwapButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Inverser le sens"
      className="w-8 h-8 flex items-center justify-center bg-surface-highest text-primary hover:bg-surface-container transition-colors"
    >
      <span className="material-symbols-outlined text-sm">swap_horiz</span>
    </button>
  )
}

function CarteMasseVolume() {
  const [carburantId, setCarburantId] = useState(densites[0].id)
  const [depuis, setDepuis] = useState('L')
  const [valeurRaw, setValeurRaw] = useState('')

  const valeurNum = parseInputValeur(valeurRaw)
  const resultat = convertirMasseVolume({ carburantId, valeur: valeurNum, depuis })

  function handleSwap() {
    if (resultat) setValeurRaw(roundForInput(resultat.resultat))
    setDepuis(depuis === 'L' ? 'kg' : 'L')
  }

  return (
    <section className="bg-surface-lowest p-8 border-t-[3px] border-primary-container space-y-6">
      <h2 className="font-headline font-bold text-lg uppercase tracking-tight text-primary">
        Masse ↔ volume carburants
      </h2>

      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Carburant</label>
        <select
          value={carburantId}
          onChange={e => setCarburantId(e.target.value)}
          className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-base font-headline font-medium transition-all"
        >
          {densites.map(d => (
            <option key={d.id} value={d.id}>{d.nom}</option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">
            Valeur en {depuis}
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={valeurRaw}
            onChange={e => setValeurRaw(e.target.value)}
            className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-xl font-headline font-medium transition-all"
          />
        </div>
        <SwapButton onClick={handleSwap} />
      </div>

      <div className="min-h-[4rem]">
        {resultat ? (
          <>
            <p className="font-headline text-3xl font-black text-primary">
              ≈ {formatNombre(resultat.resultat)} {resultat.unite}
            </p>
            <p className="mt-1 text-[10px] text-outline">{resultat.source}</p>
          </>
        ) : (
          <p className="text-sm text-outline">Saisir une valeur pour convertir.</p>
        )}
      </div>

      <CopyButton text={resultat ? `${formatNombre(resultat.resultat)} ${resultat.unite}` : ''} />
    </section>
  )
}

function CartePcsPci() {
  const [energieId, setEnergieId] = useState(ratiosPcsPci[0].id)
  const [depuis, setDepuis] = useState('PCS')
  const [valeurRaw, setValeurRaw] = useState('')

  const valeurNum = parseInputValeur(valeurRaw)
  const resultat = convertirPcsPci({ energieId, valeur: valeurNum, depuis })
  const uniteResultat = depuis === 'PCS' ? 'kWh PCI' : 'kWh PCS'

  function handleSwap() {
    if (resultat) setValeurRaw(roundForInput(resultat.resultat))
    setDepuis(depuis === 'PCS' ? 'PCI' : 'PCS')
  }

  return (
    <section className="bg-surface-lowest p-8 border-t-[3px] border-primary-container space-y-6">
      <h2 className="font-headline font-bold text-lg uppercase tracking-tight text-primary">
        kWh PCS ↔ kWh PCI
      </h2>

      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Énergie</label>
        <select
          value={energieId}
          onChange={e => setEnergieId(e.target.value)}
          className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-base font-headline font-medium transition-all"
        >
          {ratiosPcsPci.map(r => (
            <option key={r.id} value={r.id}>{r.nom}</option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">
            Valeur en kWh {depuis}
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={valeurRaw}
            onChange={e => setValeurRaw(e.target.value)}
            className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-xl font-headline font-medium transition-all"
          />
        </div>
        <SwapButton onClick={handleSwap} />
      </div>

      <div className="min-h-[4rem]">
        {resultat ? (
          <>
            <p className="font-headline text-3xl font-black text-primary">
              ≈ {formatNombre(resultat.resultat)} {uniteResultat}
            </p>
            <p className="mt-1 text-[10px] text-outline">{resultat.source}</p>
          </>
        ) : (
          <p className="text-sm text-outline">Saisir une valeur pour convertir.</p>
        )}
      </div>

      <CopyButton text={resultat ? `${formatNombre(resultat.resultat)} ${uniteResultat}` : ''} />
    </section>
  )
}

function CarteTkm() {
  const [modeFacteurId, setModeFacteurId] = useState(fretFactorsTkm[0]?.id || '')
  const [montantRaw, setMontantRaw] = useState('')

  const montantNum = parseInputValeur(montantRaw)
  const resultat = estimerTkmDepuisEuros({ montantEur: montantNum, modeFacteurId })

  return (
    <section className="bg-surface-lowest p-8 border-t-[3px] border-primary-container space-y-6">
      <h2 className="font-headline font-bold text-lg uppercase tracking-tight text-primary">
        Estimer des t.km depuis un montant de fret
      </h2>

      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Mode de transport</label>
        <select
          value={modeFacteurId}
          onChange={e => setModeFacteurId(e.target.value)}
          className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-base font-headline font-medium transition-all"
        >
          {fretFactorsTkm.map(f => (
            <option key={f.id} value={f.id}>{f.nom}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Montant en € HT</label>
        <input
          type="text"
          inputMode="decimal"
          value={montantRaw}
          onChange={e => setMontantRaw(e.target.value)}
          className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-xl font-headline font-medium transition-all"
        />
      </div>

      <div className="min-h-[5rem]">
        {resultat ? (
          <>
            <p className="font-headline text-3xl font-black text-primary">
              ≈ {formatNombre(resultat.emissions_t)} tCO₂e
            </p>
            <p className="font-headline text-xl font-bold text-on-primary-container">
              ≈ {formatNombre(resultat.tkm)} t.km ({resultat.feMode.nom})
            </p>
            <p className="mt-1 text-[10px] text-outline">
              {resultat.feMonetaire.source} · {resultat.feMode.source}
            </p>
          </>
        ) : (
          <p className="text-sm text-outline">Saisir un montant pour estimer.</p>
        )}
      </div>

      <CopyButton text={resultat ? `${formatNombre(resultat.tkm)} t.km` : ''} />

      <div className="bg-surface-low border-l-4 border-accent-red p-4">
        <p className="text-xs text-secondary leading-relaxed">
          Estimation d'ordre de grandeur (précision P0). Le ratio monétaire ADEME
          couvre les transports terrestres : pour l'aérien et le maritime,
          l'équivalent t.km est purement indicatif. Dès que possible, préférez des
          t.km réels : tonnage transporté × distance.
        </p>
      </div>
    </section>
  )
}

function CarteEnergie() {
  const [uniteFrom, setUniteFrom] = useState('kwh')
  const [uniteTo, setUniteTo] = useState('mj')
  const [valeurRaw, setValeurRaw] = useState('')

  const valeurNum = parseInputValeur(valeurRaw)
  const resultat = convertirEnergie(valeurNum, uniteFrom, uniteTo)

  function handleSwap() {
    if (resultat) setValeurRaw(roundForInput(resultat))
    setUniteFrom(uniteTo)
    setUniteTo(uniteFrom)
  }

  return (
    <section className="bg-surface-lowest p-8 border-t-[3px] border-primary-container space-y-6">
      <h2 className="font-headline font-bold text-lg uppercase tracking-tight text-primary flex items-center gap-2">
        <span className="material-symbols-outlined">bolt</span>
        Énergie
      </h2>

      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Valeur</label>
          <input
            type="text"
            inputMode="decimal"
            value={valeurRaw}
            onChange={e => setValeurRaw(e.target.value)}
            className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-xl font-headline font-medium transition-all"
          />
        </div>
        <select
          value={uniteFrom}
          onChange={e => setUniteFrom(e.target.value)}
          className="bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-sm font-headline font-medium"
        >
          {energieUnites.map(id => (
            <option key={id} value={id}>{energieVersKwh[id].label}</option>
          ))}
        </select>
        <SwapButton onClick={handleSwap} />
        <select
          value={uniteTo}
          onChange={e => setUniteTo(e.target.value)}
          className="bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-sm font-headline font-medium"
        >
          {energieUnites.map(id => (
            <option key={id} value={id}>{energieVersKwh[id].label}</option>
          ))}
        </select>
      </div>

      <div className="min-h-[4rem]">
        {resultat != null ? (
          <>
            <p className="font-headline text-3xl font-black text-primary">
              ≈ {formatNombre(resultat)} {energieVersKwh[uniteTo].label}
            </p>
            <p className="mt-1 text-[10px] text-outline">1 kWh = 3,6 MJ · 1 tep = 11 630 kWh (convention AIE)</p>
          </>
        ) : (
          <p className="text-sm text-outline">Saisir une valeur pour convertir.</p>
        )}
      </div>

      <CopyButton text={resultat != null ? `${formatNombre(resultat)} ${energieVersKwh[uniteTo].label}` : ''} />
    </section>
  )
}

function CarteDechets() {
  const [typeId, setTypeId] = useState(dechetsTypes[0])
  const [volumeRaw, setVolumeRaw] = useState('')

  const volumeNum = parseInputValeur(volumeRaw)
  const resultat = convertirDechetsVolume(volumeNum, typeId)

  return (
    <section className="bg-surface-lowest p-8 border-t-[3px] border-primary-container space-y-6">
      <h2 className="font-headline font-bold text-lg uppercase tracking-tight text-primary flex items-center gap-2">
        <span className="material-symbols-outlined">delete</span>
        Déchets volume → masse
      </h2>

      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Type de déchet</label>
        <select
          value={typeId}
          onChange={e => setTypeId(e.target.value)}
          className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-base font-headline font-medium transition-all"
        >
          {dechetsTypes.map(id => (
            <option key={id} value={id}>{densitesDechets[id].label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Volume (m³)</label>
        <input
          type="text"
          inputMode="decimal"
          value={volumeRaw}
          onChange={e => setVolumeRaw(e.target.value)}
          className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-xl font-headline font-medium transition-all"
        />
      </div>

      <div className="min-h-[4rem]">
        {resultat ? (
          <>
            <p className="font-headline text-3xl font-black text-primary">
              ≈ {formatNombre(resultat.resultat)} t
            </p>
            <p className="mt-1 text-[10px] text-outline">{resultat.source}</p>
          </>
        ) : (
          <p className="text-sm text-outline">Saisir un volume pour convertir.</p>
        )}
      </div>

      <CopyButton text={resultat ? `${formatNombre(resultat.resultat)} t` : ''} />

      <p className="text-[10px] text-outline">
        Ordre de grandeur : la masse volumique réelle dépend du tassement.
        Privilégiez les pesées du prestataire déchets (bordereaux).
      </p>
    </section>
  )
}

function CarteFluides() {
  const [fluideId, setFluideId] = useState(fluidesFugitifs[0]?.id || '')
  const [kgRaw, setKgRaw] = useState('')

  const kgNum = parseInputValeur(kgRaw)
  const fe = fluidesFugitifs.find(f => f.id === fluideId)
  const resultat = fe && Number.isFinite(kgNum) && kgNum >= 0 ? (kgNum * fe.valeur) / 1000 : null

  return (
    <section className="bg-surface-lowest p-8 border-t-[3px] border-primary-container space-y-6">
      <h2 className="font-headline font-bold text-lg uppercase tracking-tight text-primary flex items-center gap-2">
        <span className="material-symbols-outlined">mode_fan</span>
        Fluides frigorigènes
      </h2>

      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Fluide</label>
        <select
          value={fluideId}
          onChange={e => setFluideId(e.target.value)}
          className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-base font-headline font-medium transition-all"
        >
          {fluidesFugitifs.map(f => (
            <option key={f.id} value={f.id}>{f.nom}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Masse (kg)</label>
        <input
          type="text"
          inputMode="decimal"
          value={kgRaw}
          onChange={e => setKgRaw(e.target.value)}
          className="w-full bg-transparent border-0 border-b-2 border-surface-highest focus:ring-0 focus:border-primary px-0 py-2 text-xl font-headline font-medium transition-all"
        />
      </div>

      <div className="min-h-[5rem]">
        {resultat != null ? (
          <>
            <p className="font-headline text-3xl font-black text-primary">
              ≈ {formatNombre(resultat)} tCO₂e
            </p>
            {fe && (
              <p className="mt-1 text-[10px] text-outline">
                GWP {fe.valeur} kgCO₂e/kg — {fe.source}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-outline">Saisir une masse pour convertir.</p>
        )}
      </div>

      <CopyButton text={resultat != null ? `${formatNombre(resultat)} tCO₂e` : ''} />

      <p className="text-[10px] text-outline">
        Calculatrice indicative : pour le bilan, saisissez les kg rechargés dans le
        poste Climatisation et réfrigération.
      </p>
    </section>
  )
}

export default function EspaceTravail() {
  return (
    <div>
      <header className="mb-12">
        <h1 className="font-headline text-5xl font-black text-primary tracking-tighter uppercase leading-none">
          Espace <span className="text-on-primary-container">de travail</span>
        </h1>
        <p className="mt-4 text-secondary max-w-2xl leading-relaxed">
          Ces convertisseurs affichent un résultat à copier dans la collecte.
          Rien n'est enregistré ici : aucune ligne de collecte ni le projet ne
          sont modifiés par cette vue.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <CarteMasseVolume />
        <CartePcsPci />
        <CarteTkm />
        <CarteEnergie />
        <CarteDechets />
        <CarteFluides />
      </div>
    </div>
  )
}
