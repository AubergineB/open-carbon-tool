import { useState, useEffect, useMemo } from 'react'
import { readAllProjets } from '../lib/store'
import { computeYearSnapshot } from '../utils/calculEngine'

export function useMultiYearData(workdir, currentProjetPath, currentProjet, currentLignes, enabled) {
  const [otherProjets, setOtherProjets] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled || !workdir) return
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      const projets = await readAllProjets(workdir)
      if (cancelled) return
      const others = projets.filter(p => p.path !== currentProjetPath)
      setOtherProjets(others)
      setLoading(false)
    }

    fetchData().catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [enabled, workdir, currentProjetPath])

  const snapshots = useMemo(() => {
    if (!enabled) return []

    // Current project snapshot
    const currentSnapshot = computeYearSnapshot(
      { ...currentProjet, id: currentProjetPath },
      currentLignes,
    )

    // Other projects snapshots
    const otherSnapshots = otherProjets.map(proj => {
      return computeYearSnapshot({ ...proj.projet, id: proj.path }, proj.lignes)
    })

    // Un projet sans année de référence ne peut pas être placé sur l'axe temporel
    const all = [currentSnapshot, ...otherSnapshots].filter(s => s.annee)

    // Deduplicate by year (keep most recent projet per year)
    const byYear = {}
    for (const s of all) {
      if (!byYear[s.annee] || s.projetId === currentProjetPath) {
        byYear[s.annee] = s
      }
    }

    return Object.values(byYear).sort((a, b) => a.annee.localeCompare(b.annee))
  }, [enabled, currentProjet, currentProjetPath, currentLignes, otherProjets])

  return { snapshots, loading }
}
