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
  { id: 'bois',        nom: 'Bois (indicatif, dépend de l’humidité)', ratio: 1.08, source: 'Doc. Base Carbone ADEME — valeur indicative' },
]
