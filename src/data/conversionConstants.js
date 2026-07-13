// Constantes physiques pour les convertisseurs de l'Espace de travail.
// Ces valeurs ne sont PAS des facteurs d'émission : elles ne vivent pas dans
// emissionFactors.js et ne participent à aucun calcul du bilan carbone.

// Masses volumiques usuelles des carburants, kg/L à 15 °C.
// Sources : documentation Base Empreinte ADEME / conventions DGEC.
// Les valeurs marquées « dérivée ADEME » sont recoupées avec les paires de
// facteurs kg/L déjà présentes dans src/data/emissionFactors.js.
export const densites = [
  { id: 'gazole_b7',   nom: 'Gazole routier (B7)',        kgParL: 0.845, source: 'Documentation Base Empreinte ADEME / DGEC' },
  { id: 'essence',     nom: 'Essence (SP95/SP98/E10)',    kgParL: 0.755, source: 'Documentation Base Empreinte ADEME / DGEC' },
  { id: 'fioul_dom',   nom: 'Fioul domestique',           kgParL: 0.845, source: 'Documentation Base Empreinte ADEME / DGEC' },
  { id: 'fioul_lourd', nom: 'Fioul lourd',                kgParL: 0.99,  source: 'Documentation Base Empreinte ADEME / DGEC' },
  { id: 'gpl_carb',    nom: 'GPL carburant (50/50)',      kgParL: 0.55,  source: 'Documentation Base Empreinte ADEME / DGEC' },
  { id: 'propane',     nom: 'Propane',                    kgParL: 0.516, source: 'Dérivée ADEME : ratio FE L/kg (1.59/3.08) de emissionFactors.js' },
  { id: 'butane',      nom: 'Butane',                     kgParL: 0.579, source: 'Dérivée ADEME : ratio FE L/kg (1.79/3.09) de emissionFactors.js' },
  { id: 'b100',        nom: 'Biodiesel B100',             kgParL: 0.88,  source: 'Documentation Base Empreinte ADEME' },
  { id: 'e85',         nom: 'Superéthanol E85',           kgParL: 0.78,  source: 'Documentation Base Empreinte ADEME' },
]

// Conventions énergétiques usuelles (documentation Base Carbone ADEME,
// IEA Energy Statistics Manual). PCI = PCS / ratio.
export const ratiosPcsPci = [
  { id: 'gaz_naturel', nom: 'Gaz naturel',                          ratio: 1.11, source: 'Convention réglementaire française / doc. Base Carbone ADEME' },
  { id: 'gpl',         nom: 'GPL (propane, butane)',                ratio: 1.09, source: 'Doc. Base Carbone ADEME / IEA' },
  { id: 'petroliers',  nom: 'Produits pétroliers liquides (fioul, gazole, essence)', ratio: 1.07, source: 'Doc. Base Carbone ADEME / IEA' },
  { id: 'houille',     nom: 'Houille (charbon)',                    ratio: 1.05, source: 'Doc. Base Carbone ADEME / IEA' },
  { id: 'bois',        nom: 'Bois (indicatif, dépend de l\'humidité)', ratio: 1.08, source: 'Doc. Base Carbone ADEME — valeur indicative' },
]

// Équivalences énergétiques, pivot kWh.
// Sources : SI / ISO 80000-5 (MJ, GJ, kcal, BTU) ; convention AIE pour la tep
// (1 tep = 11 630 kWh) ; 1 therm = 100 000 BTU.
export const energieVersKwh = {
  kwh:   { label: 'kWh',   kwh: 1 },
  mwh:   { label: 'MWh',   kwh: 1000 },
  mj:    { label: 'MJ',    kwh: 1 / 3.6 },          // 1 kWh = 3,6 MJ exact
  gj:    { label: 'GJ',    kwh: 1000 / 3.6 },
  tep:   { label: 'tep',   kwh: 11630 },             // convention AIE
  kcal:  { label: 'kcal',  kwh: 0.001163 },          // 1 kcal = 4 186,8 J
  btu:   { label: 'BTU',   kwh: 0.000293071 },       // 1 BTU = 1 055,06 J
  therm: { label: 'therm', kwh: 29.3071 },
}

// Masses volumiques apparentes des déchets en tonnes/m³ (benne, non tassé
// sauf mention). Ordres de grandeur issus des guides de conversion
// volume/masse (ADEME, éco-organismes) — sources ligne à ligne validées
// 2026-07-13 (lot 15, voir docs/decisions.md).
export const densitesDechets = {
  carton_vrac: {
    label: 'Papiers/cartons en vrac',
    t_m3: 0.08,
    source: 'ADEME — fiche « Estimer les émissions de GES liées aux déchets », tableau conversion volume/masse ; recoupe CARADEME (carton vrac 30–90 kg/m³)',
  },
  carton_balles: {
    label: 'Papiers/cartons compactés (balles)',
    t_m3: 0.45,
    source: 'Citeo — standards matériaux emballages papier-carton en balles ; recoupe fiche ADEME déchets GES (~400–500 kg/m³)',
  },
  dib_melange: {
    label: 'Déchets en mélange (DIB, benne)',
    t_m3: 0.15,
    source: 'ADEME — fiche « Estimer les émissions de GES liées aux déchets », tableau conversion volume/masse (DIB 150–300 kg/m³, valeur basse non tassée)',
  },
  plastique_vrac: {
    label: 'Films et plastiques en vrac',
    t_m3: 0.03,
    source: 'ADEME — Étude coûts REP Emballages Professionnels 2025 (densité collecte plastiques 34 kg/m³) ; recoupe fiche déchets GES',
  },
  plastique_balles: {
    label: 'Plastiques compactés (balles)',
    t_m3: 0.30,
    source: 'Elipso — filière emballages plastiques, balles films compactées ~250–350 kg/m³ (ordre de grandeur)',
  },
  bois_benne: {
    label: 'Bois et palettes (benne)',
    t_m3: 0.25,
    source: 'ADEME — Caractérisation déchets REP en déchèteries (benne bois) ; fourchette 150–400 kg/m³',
  },
  gravats: {
    label: 'Gravats et inertes',
    t_m3: 1.30,
    source: 'Guides BTP / FFB déchets de chantier ; inertes en benne ~1,2–1,8 t/m³ (foisonnement, ordre de grandeur)',
  },
  biodechets: {
    label: 'Biodéchets',
    t_m3: 0.50,
    source: 'ADEME — fiche « Estimer les émissions de GES liées aux déchets », tableau conversion volume/masse (biodéchets ~400–600 kg/m³)',
  },
  verre_vrac: {
    label: 'Verre en vrac',
    t_m3: 0.35,
    source: 'ADEME — Caractérisation déchets REP en déchèteries (benne verre) ; verre cassé en vrac ~300–500 kg/m³',
  },
}
