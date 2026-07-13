// Base de Facteurs d'Émission — Extrait Base Carbone ADEME + sources complémentaires
// Données vérifiées via l'API ADEME Base Carbone V23.6 (data.ademe.fr)
// Ratios monétaires : ADEME 2023 (méthodologie mars 2025)
// Dernière mise à jour : Mars 2026
// Unité : kgCO₂e par unité indiquée
// 219 facteurs couvrant l'ensemble des postes d'un bilan carbone PME

const emissionFactors = {

  // ============================================================
  // SCOPE 1 — Sources fixes de combustion
  // ============================================================
  // valeur = combustion directe (Scope 1) en kgCO₂e/unité
  // amont = émissions amont Scope 3.3 (extraction, transport, raffinage) en kgCO₂e/unité
  // co2b = CO₂ biogénique en kgCO₂/unité (reporté séparément, hors total GES)
  combustion_fixe: [
    // --- Gaz --- (ADEME : total 0.243, combustion 0.205, amont 0.038)
    { id: 'gaz_nat_kwh', nom: 'Gaz naturel', unite: 'kWh PCI', valeur: 0.205, amont: 0.038, incertitude: 5, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
    { id: 'gaz_nat_kg', nom: 'Gaz naturel', unite: 'kg', valeur: 2.72, amont: 0.50, incertitude: 5, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
    // --- Fioul --- (ADEME : fioul dom total 3.25, combustion 2.67, amont 0.58)
    { id: 'fioul_dom_l', nom: 'Fioul domestique', unite: 'L', valeur: 2.67, amont: 0.58, incertitude: 5, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
    { id: 'fioul_dom_kwh', nom: 'Fioul domestique', unite: 'kWh PCI', valeur: 0.266, amont: 0.058, incertitude: 5, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
    { id: 'fioul_lourd_kg', nom: 'Fioul lourd', unite: 'kg', valeur: 2.98, amont: 0.54, incertitude: 5, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
    // --- GPL --- (ADEME : propane kWh total 0.271, combustion 0.238, amont 0.033)
    { id: 'propane_kwh', nom: 'Propane (GPL)', unite: 'kWh PCI', valeur: 0.238, amont: 0.033, incertitude: 5, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
    { id: 'propane_l', nom: 'Propane (GPL)', unite: 'L', valeur: 1.59, amont: 0.22, incertitude: 5, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
    { id: 'propane_kg', nom: 'Propane (GPL)', unite: 'kg', valeur: 3.08, amont: 0.43, incertitude: 5, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
    { id: 'butane_kwh', nom: 'Butane', unite: 'kWh PCI', valeur: 0.239, amont: 0.033, incertitude: 5, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
    { id: 'butane_l', nom: 'Butane', unite: 'L', valeur: 1.79, amont: 0.25, incertitude: 5, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
    { id: 'butane_kg', nom: 'Butane', unite: 'kg', valeur: 3.09, amont: 0.43, incertitude: 5, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
    // --- Biomasse --- (combustion directe quasi nulle en fossile, l'essentiel est biogénique)
    { id: 'bois_buche_kwh', nom: 'Bois bûche', unite: 'kWh PCI', valeur: 0.017, amont: 0.013, incertitude: 30, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe', co2b: 0.295 },
    { id: 'granules_bois_kwh', nom: 'Granulés bois (pellets)', unite: 'kWh PCI', valeur: 0.0033, amont: 0.008, incertitude: 25, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe', co2b: 0.295 },
    { id: 'plaquettes_bois_kwh', nom: 'Plaquettes forestières', unite: 'kWh PCI', valeur: 0.0063, amont: 0.006, incertitude: 25, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe', co2b: 0.295 },
    { id: 'dechets_bois_kwh', nom: 'Déchets de bois', unite: 'kWh PCI', valeur: 0.0124, amont: 0.005, incertitude: 25, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe', co2b: 0.295 },
    // --- Charbon --- (ADEME : houille total 0.377, combustion 0.349, amont 0.028)
    { id: 'houille_kwh', nom: 'Houille (charbon)', unite: 'kWh PCI', valeur: 0.349, amont: 0.028, incertitude: 20, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
    { id: 'anthracite_kwh', nom: 'Anthracite', unite: 'kWh PCI', valeur: 0.359, amont: 0.028, incertitude: 20, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
    { id: 'lignite_kwh', nom: 'Lignite', unite: 'kWh PCI', valeur: 0.375, amont: 0.020, incertitude: 20, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
    { id: 'coke_houille_kwh', nom: 'Coke de houille', unite: 'kWh PCI', valeur: 0.390, amont: 0.030, incertitude: 20, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
    // --- Fallback monétaire ---
    { id: 'combustion_fixe_eur', nom: 'Chauffage — fallback monétaire', unite: '€ HT', valeur: 0.310, incertitude: 80, perimetre: 'total', source: 'ADEME / SDES ratios monétaires 2023', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
  ],

  // ============================================================
  // SCOPE 1 — Sources mobiles (carburants)
  // ============================================================
  combustion_mobile: [
    // --- Carburants classiques ---
    // valeur = combustion directe (Scope 1), amont = Scope 3.3
    // Diesel B7 : ADEME total 3.17, combustion 2.67, amont 0.50
    { id: 'diesel_l', nom: 'Diesel (B7)', unite: 'L', valeur: 2.67, amont: 0.50, incertitude: 5, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources mobiles', categorie_ghg: 'Scope 1 — Combustion mobile' },
    // Essence SP95 : ADEME total 2.80, combustion 2.28, amont 0.52
    { id: 'essence_sp95_l', nom: 'Essence SP95 (E10)', unite: 'L', valeur: 2.28, amont: 0.52, incertitude: 5, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources mobiles', categorie_ghg: 'Scope 1 — Combustion mobile' },
    { id: 'essence_sp98_l', nom: 'Essence SP98', unite: 'L', valeur: 2.24, amont: 0.54, incertitude: 5, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources mobiles', categorie_ghg: 'Scope 1 — Combustion mobile' },
    // E85 : ADEME total 1.11, combustion 0.70, amont 0.41
    { id: 'e85_l', nom: 'Superéthanol E85', unite: 'L', valeur: 0.70, amont: 0.41, incertitude: 15, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources mobiles', categorie_ghg: 'Scope 1 — Combustion mobile', co2b: 1.55 },
    { id: 'e10_l', nom: 'Essence E10 (SP95-E10)', unite: 'L', valeur: 2.28, amont: 0.52, incertitude: 5, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources mobiles', categorie_ghg: 'Scope 1 — Combustion mobile' },
    // GNV : ADEME total 3.27, combustion 2.77, amont 0.50
    { id: 'gnv_kg', nom: 'GNV (gaz naturel vehicule)', unite: 'kg', valeur: 2.77, amont: 0.50, incertitude: 10, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources mobiles', categorie_ghg: 'Scope 1 — Combustion mobile' },
    // GPL : ADEME total 1.86, combustion 1.63, amont 0.23
    { id: 'gpl_carburant_l', nom: 'GPL carburant', unite: 'L', valeur: 1.63, amont: 0.23, incertitude: 5, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources mobiles', categorie_ghg: 'Scope 1 — Combustion mobile' },
    // Biodiesel B100 : ADEME total 1.18, combustion 0.46, amont 0.72
    { id: 'biodiesel_b100_l', nom: 'Biodiesel B100', unite: 'L', valeur: 0.46, amont: 0.72, incertitude: 30, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources mobiles', categorie_ghg: 'Scope 1 — Combustion mobile', co2b: 2.49 },
    // BioGNV : ADEME total 0.55, combustion 0.20, amont 0.35
    { id: 'biognv_kg', nom: 'BioGNV (biométhane véhicule)', unite: 'kg', valeur: 0.20, amont: 0.35, incertitude: 30, perimetre: 'combustion', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources mobiles', categorie_ghg: 'Scope 1 — Combustion mobile', co2b: 2.72 },
    // --- Par km vehicule ---
    { id: 'voiture_diesel_km', nom: 'Voiture diesel moyenne', unite: 'km', valeur: 0.218, incertitude: 20, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources mobiles', categorie_ghg: 'Scope 1 — Combustion mobile' },
    { id: 'voiture_essence_km', nom: 'Voiture essence moyenne', unite: 'km', valeur: 0.218, incertitude: 20, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources mobiles', categorie_ghg: 'Scope 1 — Combustion mobile' },
    { id: 'voiture_hybride_km', nom: 'Voiture hybride moyenne', unite: 'km', valeur: 0.147, incertitude: 25, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources mobiles', categorie_ghg: 'Scope 1 — Combustion mobile' },
    { id: 'voiture_hybride_rech_km', nom: 'Voiture hybride rechargeable', unite: 'km', valeur: 0.120, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources mobiles', categorie_ghg: 'Scope 1 — Combustion mobile' },
    { id: 'voiture_elec_km', nom: 'Voiture electrique (France)', unite: 'km', valeur: 0.103, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources mobiles', categorie_ghg: 'Scope 1 — Combustion mobile' },
    { id: 'vul_diesel_km', nom: 'Vehicule utilitaire leger diesel', unite: 'km', valeur: 0.306, incertitude: 20, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources mobiles', categorie_ghg: 'Scope 1 — Combustion mobile' },
    { id: 'vul_elec_km', nom: 'Vehicule utilitaire leger electrique', unite: 'km', valeur: 0.130, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources mobiles', categorie_ghg: 'Scope 1 — Combustion mobile' },
    { id: 'scooter_thermique_km', nom: 'Scooter/moto thermique', unite: 'km', valeur: 0.164, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources mobiles', categorie_ghg: 'Scope 1 — Combustion mobile' },
    // --- Fallback monétaire ---
    { id: 'combustion_mobile_eur', nom: 'Carburant véhicules — fallback monétaire', unite: '€ HT', valeur: 0.580, incertitude: 80, perimetre: 'total', source: 'ADEME / SDES ratios monétaires 2023', categorie_bc: 'Émissions directes — Sources mobiles', categorie_ghg: 'Scope 1 — Combustion mobile' },
  ],

  // ============================================================
  // SCOPE 1 — Émissions fugitives (fluides frigorigenes)
  // ============================================================
  fugitives: [
    // --- HFC courants ---
    { id: 'r410a_kg', nom: 'R-410A (climatisation)', unite: 'kg', valeur: 2088, incertitude: 15, perimetre: 'direct', source: 'Base Carbone ADEME 2024 / IPCC AR6', categorie_bc: 'Émissions directes — Fugitives', categorie_ghg: 'Scope 1 — Émissions fugitives' },
    { id: 'r32_kg', nom: 'R-32 (climatisation nouvelle gen)', unite: 'kg', valeur: 675, incertitude: 15, perimetre: 'direct', source: 'Base Carbone ADEME 2024 / IPCC AR6', categorie_bc: 'Émissions directes — Fugitives', categorie_ghg: 'Scope 1 — Émissions fugitives' },
    { id: 'r134a_kg', nom: 'R-134a (refrigeration, auto)', unite: 'kg', valeur: 1430, incertitude: 15, perimetre: 'direct', source: 'Base Carbone ADEME 2024 / IPCC AR6', categorie_bc: 'Émissions directes — Fugitives', categorie_ghg: 'Scope 1 — Émissions fugitives' },
    { id: 'r404a_kg', nom: 'R-404A (froid commercial)', unite: 'kg', valeur: 3922, incertitude: 15, perimetre: 'direct', source: 'Base Carbone ADEME 2024 / IPCC AR6', categorie_bc: 'Émissions directes — Fugitives', categorie_ghg: 'Scope 1 — Émissions fugitives' },
    { id: 'r407c_kg', nom: 'R-407C (climatisation)', unite: 'kg', valeur: 1774, incertitude: 15, perimetre: 'direct', source: 'Base Carbone ADEME 2024 / IPCC AR6', categorie_bc: 'Émissions directes — Fugitives', categorie_ghg: 'Scope 1 — Émissions fugitives' },
    { id: 'r507a_kg', nom: 'R-507A (surgeration)', unite: 'kg', valeur: 3985, incertitude: 15, perimetre: 'direct', source: 'Base Carbone ADEME 2024 / IPCC AR6', categorie_bc: 'Émissions directes — Fugitives', categorie_ghg: 'Scope 1 — Émissions fugitives' },
    { id: 'r22_kg', nom: 'R-22 (HCFC, ancien)', unite: 'kg', valeur: 1810, incertitude: 15, perimetre: 'direct', source: 'Base Carbone ADEME 2024 / IPCC AR6', categorie_bc: 'Émissions directes — Fugitives', categorie_ghg: 'Scope 1 — Émissions fugitives' },
    { id: 'r407a_kg', nom: 'R-407A', unite: 'kg', valeur: 2107, incertitude: 15, perimetre: 'direct', source: 'IPCC AR6', categorie_bc: 'Émissions directes — Fugitives', categorie_ghg: 'Scope 1 — Émissions fugitives' },
    { id: 'r448a_kg', nom: 'R-448A (remplacement R-404A)', unite: 'kg', valeur: 1387, incertitude: 15, perimetre: 'direct', source: 'IPCC AR6', categorie_bc: 'Émissions directes — Fugitives', categorie_ghg: 'Scope 1 — Émissions fugitives' },
    { id: 'r449a_kg', nom: 'R-449A (remplacement R-404A)', unite: 'kg', valeur: 1397, incertitude: 15, perimetre: 'direct', source: 'IPCC AR6', categorie_bc: 'Émissions directes — Fugitives', categorie_ghg: 'Scope 1 — Émissions fugitives' },
    // --- Fluides a faible GWP ---
    { id: 'r290_kg', nom: 'R-290 (propane, naturel)', unite: 'kg', valeur: 3, incertitude: 15, perimetre: 'direct', source: 'IPCC AR6', categorie_bc: 'Émissions directes — Fugitives', categorie_ghg: 'Scope 1 — Émissions fugitives' },
    { id: 'r744_kg', nom: 'R-744 (CO2, naturel)', unite: 'kg', valeur: 1, incertitude: 0, perimetre: 'direct', source: 'IPCC AR6', categorie_bc: 'Émissions directes — Fugitives', categorie_ghg: 'Scope 1 — Émissions fugitives' },
    { id: 'r717_kg', nom: 'R-717 (ammoniac, naturel)', unite: 'kg', valeur: 0, incertitude: 0, perimetre: 'direct', source: 'IPCC AR6', categorie_bc: 'Émissions directes — Fugitives', categorie_ghg: 'Scope 1 — Émissions fugitives' },
    { id: 'hfo1234yf_kg', nom: 'HFO-1234yf (auto nouvelle gen)', unite: 'kg', valeur: 4, incertitude: 15, perimetre: 'direct', source: 'IPCC AR6', categorie_bc: 'Émissions directes — Fugitives', categorie_ghg: 'Scope 1 — Émissions fugitives' },
    { id: 'hfo1234ze_kg', nom: 'HFO-1234ze(E) (climatisation)', unite: 'kg', valeur: 7, incertitude: 15, perimetre: 'direct', source: 'IPCC AR6', categorie_bc: 'Émissions directes — Fugitives', categorie_ghg: 'Scope 1 — Émissions fugitives' },
    { id: 'sf6_kg', nom: 'SF6 (appareillage electrique)', unite: 'kg', valeur: 22800, incertitude: 10, perimetre: 'direct', source: 'IPCC AR6', categorie_bc: 'Émissions directes — Fugitives', categorie_ghg: 'Scope 1 — Émissions fugitives' },
    // --- Fallback monétaire ---
    { id: 'fugitives_eur', nom: 'Fluides frigorigènes — fallback monétaire', unite: '€ HT', valeur: 0.196, incertitude: 80, perimetre: 'total', source: 'ADEME / SDES ratios monétaires 2023 (réparation machines)', categorie_bc: 'Émissions directes — Fugitives', categorie_ghg: 'Scope 1 — Émissions fugitives' },
  ],

  // ============================================================
  // SCOPE 2 — Électricité
  // ============================================================
  electricite: [
    // --- Location-Based (mix réseau) ---
    { id: 'elec_france_kwh', nom: 'Électricité France (mix moyen)', unite: 'kWh', valeur: 0.0569, incertitude: 10, perimetre: 'total', source: 'Base Carbone ADEME 2024 / RTE', categorie_bc: 'Émissions indirectes — Électricité', categorie_ghg: 'Scope 2 — Électricité achetée', scope2method: 'location', mbFallbackId: 'elec_residuel_france_kwh' },
    { id: 'elec_europe_kwh', nom: 'Électricité Europe (mix moyen)', unite: 'kWh', valeur: 0.310, incertitude: 15, perimetre: 'total', source: 'Base Carbone ADEME 2024 / AIE', categorie_bc: 'Émissions indirectes — Électricité', categorie_ghg: 'Scope 2 — Électricité achetée', scope2method: 'location' },
    { id: 'elec_allemagne_kwh', nom: 'Électricité Allemagne', unite: 'kWh', valeur: 0.385, incertitude: 15, perimetre: 'total', source: 'Base Carbone ADEME 2024 / AIE', categorie_bc: 'Émissions indirectes — Électricité', categorie_ghg: 'Scope 2 — Électricité achetée', scope2method: 'location' },
    { id: 'elec_espagne_kwh', nom: 'Électricité Espagne', unite: 'kWh', valeur: 0.187, incertitude: 15, perimetre: 'total', source: 'Base Carbone ADEME 2024 / AIE', categorie_bc: 'Émissions indirectes — Électricité', categorie_ghg: 'Scope 2 — Électricité achetée', scope2method: 'location' },
    { id: 'elec_italie_kwh', nom: 'Électricité Italie', unite: 'kWh', valeur: 0.322, incertitude: 15, perimetre: 'total', source: 'Base Carbone ADEME 2024 / AIE', categorie_bc: 'Émissions indirectes — Électricité', categorie_ghg: 'Scope 2 — Électricité achetée', scope2method: 'location' },
    { id: 'elec_uk_kwh', nom: 'Électricité Royaume-Uni', unite: 'kWh', valeur: 0.236, incertitude: 15, perimetre: 'total', source: 'Base Carbone ADEME 2024 / AIE', categorie_bc: 'Émissions indirectes — Électricité', categorie_ghg: 'Scope 2 — Électricité achetée', scope2method: 'location' },
    { id: 'elec_belgique_kwh', nom: 'Électricité Belgique', unite: 'kWh', valeur: 0.155, incertitude: 15, perimetre: 'total', source: 'Base Carbone ADEME 2024 / AIE', categorie_bc: 'Émissions indirectes — Électricité', categorie_ghg: 'Scope 2 — Électricité achetée', scope2method: 'location' },
    { id: 'elec_usa_kwh', nom: 'Électricité Etats-Unis', unite: 'kWh', valeur: 0.390, incertitude: 15, perimetre: 'total', source: 'Base Carbone ADEME 2024 / AIE', categorie_bc: 'Émissions indirectes — Électricité', categorie_ghg: 'Scope 2 — Électricité achetée', scope2method: 'location' },
    { id: 'elec_chine_kwh', nom: 'Électricité Chine', unite: 'kWh', valeur: 0.585, incertitude: 15, perimetre: 'total', source: 'Base Carbone ADEME 2024 / AIE', categorie_bc: 'Émissions indirectes — Électricité', categorie_ghg: 'Scope 2 — Électricité achetée', scope2method: 'location' },
    // --- Market-Based (contrat fournisseur) ---
    { id: 'elec_renouv_kwh', nom: 'Électricité renouvelable (garantie origine)', unite: 'kWh', valeur: 0.012, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions indirectes — Électricité', categorie_ghg: 'Scope 2 — Électricité achetée', scope2method: 'market', lbFactorId: 'elec_france_kwh' },
    { id: 'elec_fournisseur_vert_kwh', nom: 'Offre verte fournisseur sans GO (mix résiduel)', unite: 'kWh', valeur: 0.13005, incertitude: 20, perimetre: 'total', source: 'ADEME / AIB — Mix résiduel France 2022, ACV, hors pertes en ligne', categorie_bc: 'Émissions indirectes — Électricité', categorie_ghg: 'Scope 2 — Électricité achetée', scope2method: 'market', lbFactorId: 'elec_france_kwh' },
    // --- Mix résiduel (imposé automatiquement en Market-Based, non sélectionnable) ---
    // Règle : seul le résiduel France est embarqué. Pour les autres pays (pas de
    // mbFallbackId), le mix moyen du réseau sert de proxy MB (hiérarchie GHG
    // Protocol Scope 2 Guidance).
    { id: 'elec_residuel_france_kwh', nom: 'Électricité France — mix résiduel', unite: 'kWh', valeur: 0.13005, incertitude: 20, perimetre: 'total', source: 'ADEME / AIB — Mix résiduel France 2022, ACV, hors pertes en ligne', categorie_bc: 'Émissions indirectes — Électricité', categorie_ghg: 'Scope 2 — Électricité achetée', scope2method: 'market', lbFactorId: 'elec_france_kwh', nonSelectable: true },
    // --- Fallback monétaire ---
    { id: 'electricite_eur', nom: 'Électricité — fallback monétaire', unite: '€ HT', valeur: 0.310, incertitude: 80, perimetre: 'total', source: 'ADEME / SDES ratios monétaires 2023 (énergie)', categorie_bc: 'Émissions indirectes — Électricité', categorie_ghg: 'Scope 2 — Électricité achetée', scope2method: 'location' },
  ],

  // ============================================================
  // SCOPE 2 — Reseaux chaleur / froid
  // ============================================================
  reseaux: [
    { id: 'chaleur_reseau_kwh', nom: 'Réseau de chaleur (moyenne France)', unite: 'kWh', valeur: 0.125, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions indirectes — Vapeur, chaleur, froid', categorie_ghg: 'Scope 2 — Réseaux chaleur/froid', scope2method: 'location' },
    { id: 'froid_reseau_kwh', nom: 'Réseau de froid', unite: 'kWh', valeur: 0.035, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions indirectes — Vapeur, chaleur, froid', categorie_ghg: 'Scope 2 — Réseaux chaleur/froid', scope2method: 'location' },
    { id: 'chaleur_reseau_bois_kwh', nom: 'Réseau de chaleur (dominante bois)', unite: 'kWh', valeur: 0.040, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions indirectes — Vapeur, chaleur, froid', categorie_ghg: 'Scope 2 — Réseaux chaleur/froid', scope2method: 'location' },
    { id: 'chaleur_reseau_gaz_kwh', nom: 'Réseau de chaleur (dominante gaz)', unite: 'kWh', valeur: 0.220, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions indirectes — Vapeur, chaleur, froid', categorie_ghg: 'Scope 2 — Réseaux chaleur/froid', scope2method: 'location' },
    { id: 'vapeur_kwh', nom: 'Vapeur (cogénération gaz)', unite: 'kWh', valeur: 0.272, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions indirectes — Vapeur, chaleur, froid', categorie_ghg: 'Scope 2 — Réseaux chaleur/froid', scope2method: 'location' },
    // --- Fallback monétaire ---
    { id: 'reseaux_eur', nom: 'Réseau chaleur/froid — fallback monétaire', unite: '€ HT', valeur: 0.310, incertitude: 80, perimetre: 'total', source: 'ADEME / SDES ratios monétaires 2023 (énergie)', categorie_bc: 'Émissions indirectes — Vapeur, chaleur, froid', categorie_ghg: 'Scope 2 — Réseaux chaleur/froid' },
  ],

  // ============================================================
  // SCOPE 3 — Cat. 1 : Achats de biens et services (ratios monetaires)
  // Valeurs ADEME 2023 en kgCO2e/k euro HT, converties en kgCO2e/euro HT (divise par 1000)
  // ============================================================
  achats: [
    // --- Services tertiaires courants pour PME ---
    { id: 'achats_services_info', nom: 'Programmation, conseil IT / Services information', unite: 'euro HT', valeur: 0.075, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_conseil_juridique', nom: 'Services juridiques, comptables, conseil de gestion', unite: 'euro HT', valeur: 0.067, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_architecture_ingenierie', nom: 'Architecture, ingenierie, controle technique', unite: 'euro HT', valeur: 0.102, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_telecom', nom: 'Services de telecommunications', unite: 'euro HT', valeur: 0.136, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_assurance', nom: 'Assurance, reassurance, retraites', unite: 'euro HT', valeur: 0.077, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_services_financiers', nom: 'Services financiers (hors assurances)', unite: 'euro HT', valeur: 0.070, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_auxiliaires_financiers', nom: 'Services auxiliaires financiers et assurances', unite: 'euro HT', valeur: 0.073, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_location_immo', nom: 'Services immobiliers', unite: 'euro HT', valeur: 0.021, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_emploi_interim', nom: 'Services lies a emploi (interim)', unite: 'euro HT', valeur: 0.041, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_publicite', nom: 'Publicite et etudes de marche', unite: 'euro HT', valeur: 0.113, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_formation', nom: 'Services de enseignement / formation', unite: 'euro HT', valeur: 0.066, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_recherche', nom: 'Recherche et developpement scientifique', unite: 'euro HT', valeur: 0.078, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_poste_courrier', nom: 'Services de poste et de courrier', unite: 'euro HT', valeur: 0.112, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_edition', nom: 'Edition (livres, journaux, logiciels)', unite: 'euro HT', valeur: 0.096, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_imprimerie', nom: 'Travaux impression et reprographie', unite: 'euro HT', valeur: 0.210, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_entreposage', nom: 'Entreposage et services auxiliaires transports', unite: 'euro HT', valeur: 0.147, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_autres_services_specialises', nom: 'Autres services specialises, scientifiques et techniques', unite: 'euro HT', valeur: 0.110, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_cinema_tv', nom: 'Cinema, TV, musique / Programmation', unite: 'euro HT', valeur: 0.156, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_arts_spectacles', nom: 'Arts, spectacles, musees', unite: 'euro HT', valeur: 0.104, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_sports_loisirs', nom: 'Services sportifs, recreatifs et de loisirs', unite: 'euro HT', valeur: 0.191, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_sante', nom: 'Services de sante humaine', unite: 'euro HT', valeur: 0.082, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_veterinaire', nom: 'Services veterinaires', unite: 'euro HT', valeur: 0.110, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_associations', nom: 'Services fournis par organisations associatives', unite: 'euro HT', valeur: 0.092, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_reparation_info', nom: 'Reparation ordinateurs et biens personnels', unite: 'euro HT', valeur: 0.158, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_reparation_machines', nom: 'Reparation et installation de machines', unite: 'euro HT', valeur: 0.196, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_autres_services_perso', nom: 'Autres services personnels (nettoyage, securite...)', unite: 'euro HT', valeur: 0.157, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_voyage', nom: 'Agences de voyage, voyagistes, reservations', unite: 'euro HT', valeur: 0.136, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_restauration', nom: 'Services hebergement et restauration', unite: 'euro HT', valeur: 0.250, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_commerce_detail', nom: 'Commerce de detail', unite: 'euro HT', valeur: 0.110, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_commerce_gros', nom: 'Commerce de gros', unite: 'euro HT', valeur: 0.146, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    // --- Achats de biens (produits physiques) ---
    { id: 'achats_alimentaire', nom: 'Produits alimentaires, boissons, tabac', unite: 'euro HT', valeur: 0.540, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_papier_carton', nom: 'Papier et carton', unite: 'euro HT', valeur: 0.357, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_produits_chimiques', nom: 'Produits chimiques (nettoyage, hygiene)', unite: 'euro HT', valeur: 0.603, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_pharmaceutique', nom: 'Produits pharmaceutiques', unite: 'euro HT', valeur: 0.194, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_caoutchouc_plastique', nom: 'Produits caoutchouc et plastique', unite: 'euro HT', valeur: 0.312, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_produits_info', nom: 'Produits informatiques, electroniques et optiques', unite: 'euro HT', valeur: 0.216, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_machines_equip', nom: 'Machines et équipements', unite: 'euro HT', valeur: 0.273, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_meubles', nom: 'Meubles', unite: 'euro HT', valeur: 0.231, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_textile', nom: 'Textile, habillement, cuir', unite: 'euro HT', valeur: 0.271, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_bois_liege', nom: 'Bois, liege, vannerie', unite: 'euro HT', valeur: 0.205, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_produits_metalliques', nom: 'Produits metalliques', unite: 'euro HT', valeur: 0.317, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_produits_manufactures', nom: 'Autres produits manufactures', unite: 'euro HT', valeur: 0.231, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_construction', nom: 'Constructions et travaux de construction', unite: 'euro HT', valeur: 0.245, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_transports_terrestres', nom: 'Transports terrestres et par conduites', unite: 'euro HT', valeur: 0.319, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_transports_aeriens', nom: 'Transports aeriens', unite: 'euro HT', valeur: 0.914, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_transports_eau', nom: 'Transport par eau', unite: 'euro HT', valeur: 1.247, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'achats_autres_mat_transport', nom: 'Autres materiels de transport', unite: 'euro HT', valeur: 0.239, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
  ],

  // ============================================================
  // SCOPE 3 — Cat. 2 : Biens équipement (immobilisations)
  // ============================================================
  immobilisations: [
    // --- Informatique (ADEME / Impact CO2) ---
    { id: 'immo_laptop', nom: 'Ordinateur portable', unite: 'unite', valeur: 193, incertitude: 50, perimetre: 'total', source: 'ADEME Impact CO2 / Base Empreinte 2024', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    { id: 'immo_desktop', nom: 'Ordinateur fixe (sans ecran)', unite: 'unite', valeur: 259, incertitude: 50, perimetre: 'total', source: 'ADEME Impact CO2 / Base Empreinte 2024', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    { id: 'immo_ecran_24', nom: 'Ecran 23-24 pouces', unite: 'unite', valeur: 370, incertitude: 50, perimetre: 'total', source: 'ADEME Impact CO2 / Base Empreinte 2024', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    { id: 'immo_smartphone', nom: 'Smartphone', unite: 'unite', valeur: 80, incertitude: 50, perimetre: 'total', source: 'ADEME Impact CO2 / Base Empreinte 2024', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    { id: 'immo_tablette', nom: 'Tablette', unite: 'unite', valeur: 87, incertitude: 50, perimetre: 'total', source: 'ADEME Impact CO2 / Base Empreinte 2024', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    { id: 'immo_imprimante', nom: 'Imprimante multifonction', unite: 'unite', valeur: 130, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    { id: 'immo_serveur', nom: 'Serveur physique', unite: 'unite', valeur: 1100, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    { id: 'immo_switch_reseau', nom: 'Switch / routeur reseau', unite: 'unite', valeur: 65, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    { id: 'immo_box_internet', nom: 'Box internet / modem', unite: 'unite', valeur: 35, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    // --- Reconditionne ---
    { id: 'immo_laptop_recond', nom: 'Ordinateur portable (reconditionne)', unite: 'unite', valeur: 39, incertitude: 50, perimetre: 'total', source: 'ADEME etude reconditionnement 2022', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    { id: 'immo_smartphone_recond', nom: 'Smartphone (reconditionne)', unite: 'unite', valeur: 16, incertitude: 50, perimetre: 'total', source: 'ADEME etude reconditionnement 2022', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    // --- Vehicules (fabrication) ---
    { id: 'immo_vl_diesel', nom: 'Vehicule leger diesel (berline)', unite: 'unite', valeur: 6500, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    { id: 'immo_vl_essence', nom: 'Vehicule leger essence', unite: 'unite', valeur: 6000, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    { id: 'immo_vl_electrique', nom: 'Vehicule leger electrique', unite: 'unite', valeur: 10000, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    { id: 'immo_vl_hybride', nom: 'Vehicule leger hybride', unite: 'unite', valeur: 7500, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    { id: 'immo_vul', nom: 'Vehicule utilitaire leger', unite: 'unite', valeur: 7000, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    { id: 'immo_velo_elec', nom: 'Velo a assistance electrique', unite: 'unite', valeur: 120, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    // --- Mobilier et batiment ---
    { id: 'immo_mobilier_euro', nom: 'Mobilier de bureau', unite: 'euro HT', valeur: 0.231, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monetaires 2023', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    { id: 'immo_batiment_bureau_m2', nom: 'Construction batiment bureau', unite: 'm2', valeur: 425, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
    // --- Fallback monétaire ---
    { id: 'immo_eur', nom: 'Immobilisations — fallback monétaire', unite: '€ HT', valeur: 0.273, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monétaires 2023 (machines et équipements)', categorie_bc: 'Immobilisations de biens', categorie_ghg: 'Cat. 2 — Biens d\'équipement' },
  ],

  // ============================================================
  // SCOPE 3 — Cat. 4 & 9 : Transport de marchandises (fret)
  // ============================================================
  fret: [
    // --- Routier ---
    { id: 'fret_routier_vul_tkm', nom: 'Fret routier — VUL (<3,5t)', unite: 'tkm', valeur: 0.597, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Transport de marchandises', categorie_ghg: 'Cat. 4/9 — Transport & distribution' },
    { id: 'fret_routier_pl12_tkm', nom: 'Fret routier — PL 12t', unite: 'tkm', valeur: 0.210, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Transport de marchandises', categorie_ghg: 'Cat. 4/9 — Transport & distribution' },
    { id: 'fret_routier_pl19_tkm', nom: 'Fret routier — PL 19t', unite: 'tkm', valeur: 0.170, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Transport de marchandises', categorie_ghg: 'Cat. 4/9 — Transport & distribution' },
    { id: 'fret_routier_pl40_tkm', nom: 'Fret routier — PL 40t (porteur)', unite: 'tkm', valeur: 0.110, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Transport de marchandises', categorie_ghg: 'Cat. 4/9 — Transport & distribution' },
    { id: 'fret_routier_pl44_tkm', nom: 'Fret routier — PL 44t (articulé)', unite: 'tkm', valeur: 0.083, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Transport de marchandises', categorie_ghg: 'Cat. 4/9 — Transport & distribution' },
    { id: 'fret_routier_moy_tkm', nom: 'Fret routier — Moyenne France', unite: 'tkm', valeur: 0.104, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Transport de marchandises', categorie_ghg: 'Cat. 4/9 — Transport & distribution' },
    // --- Ferroviaire ---
    { id: 'fret_ferroviaire_tkm', nom: 'Fret ferroviaire (France)', unite: 'tkm', valeur: 0.0052, incertitude: 40, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Transport de marchandises', categorie_ghg: 'Cat. 4/9 — Transport & distribution' },
    { id: 'fret_ferroviaire_europe_tkm', nom: 'Fret ferroviaire (Europe moyenne)', unite: 'tkm', valeur: 0.022, incertitude: 40, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Transport de marchandises', categorie_ghg: 'Cat. 4/9 — Transport & distribution' },
    // --- Fluvial ---
    { id: 'fret_fluvial_tkm', nom: 'Fret fluvial', unite: 'tkm', valeur: 0.038, incertitude: 40, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Transport de marchandises', categorie_ghg: 'Cat. 4/9 — Transport & distribution' },
    // --- Maritime ---
    { id: 'fret_maritime_cont_tkm', nom: 'Fret maritime conteneurisé', unite: 'tkm', valeur: 0.016, incertitude: 40, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Transport de marchandises', categorie_ghg: 'Cat. 4/9 — Transport & distribution' },
    { id: 'fret_maritime_vrac_sec_tkm', nom: 'Fret maritime vrac sec (vraquier)', unite: 'tkm', valeur: 0.005, incertitude: 40, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Transport de marchandises', categorie_ghg: 'Cat. 4/9 — Transport & distribution' },
    { id: 'fret_maritime_vrac_liq_tkm', nom: 'Fret maritime vrac liquide (petrolier)', unite: 'tkm', valeur: 0.007, incertitude: 40, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Transport de marchandises', categorie_ghg: 'Cat. 4/9 — Transport & distribution' },
    { id: 'fret_maritime_roro_tkm', nom: 'Fret maritime RoRo (ferry fret)', unite: 'tkm', valeur: 0.039, incertitude: 40, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Transport de marchandises', categorie_ghg: 'Cat. 4/9 — Transport & distribution' },
    // --- Aerien ---
    { id: 'fret_aerien_court_tkm', nom: 'Fret aerien (<3500 km)', unite: 'tkm', valeur: 1.93, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Transport de marchandises', categorie_ghg: 'Cat. 4/9 — Transport & distribution' },
    { id: 'fret_aerien_long_tkm', nom: 'Fret aerien (>3500 km)', unite: 'tkm', valeur: 0.96, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Transport de marchandises', categorie_ghg: 'Cat. 4/9 — Transport & distribution' },
    // --- Colis / coursier ---
    { id: 'fret_colis_express_unit', nom: 'Colis express national (moyenne)', unite: 'colis', valeur: 1.10, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Transport de marchandises', categorie_ghg: 'Cat. 4/9 — Transport & distribution' },
    { id: 'fret_coursier_velo_km', nom: 'Coursier velo', unite: 'km', valeur: 0, incertitude: 0, perimetre: 'direct', source: 'Aucune emission directe', categorie_bc: 'Transport de marchandises', categorie_ghg: 'Cat. 4/9 — Transport & distribution' },
    // --- Fallback monétaire ---
    { id: 'fret_eur', nom: 'Transport marchandises — fallback monétaire', unite: '€ HT', valeur: 0.319, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monétaires 2023 (transports terrestres)', categorie_bc: 'Transport de marchandises', categorie_ghg: 'Cat. 4/9 — Transport & distribution' },
  ],

  // ============================================================
  // SCOPE 3 — Cat. 5 : Déchets
  // ============================================================
  dechets: [
    // --- DIB (Déchets Industriels Banals) ---
    { id: 'déchets_dib_incin', nom: 'DIB — incineration', unite: 't', valeur: 690, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    { id: 'déchets_dib_enfouis', nom: 'DIB — enfouissement', unite: 't', valeur: 470, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    // --- Ordures menageres ---
    { id: 'déchets_om_incin', nom: 'Ordures menageres — incineration', unite: 't', valeur: 386, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    { id: 'déchets_om_enfouis', nom: 'Ordures menageres — enfouissement', unite: 't', valeur: 412, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    // --- Papier / carton ---
    { id: 'déchets_papier_recycl', nom: 'Papier/carton — recyclage', unite: 't', valeur: 53, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    { id: 'déchets_papier_incin', nom: 'Papier/carton — incineration', unite: 't', valeur: 692, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    { id: 'déchets_papier_enfouis', nom: 'Papier/carton — enfouissement', unite: 't', valeur: 890, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    // --- Plastique ---
    { id: 'déchets_plastique_recycl', nom: 'Plastique — recyclage', unite: 't', valeur: 230, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    { id: 'déchets_plastique_incin', nom: 'Plastique — incineration', unite: 't', valeur: 2280, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    { id: 'déchets_plastique_enfouis', nom: 'Plastique — enfouissement', unite: 't', valeur: 52, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    // --- Verre ---
    { id: 'déchets_verre_recycl', nom: 'Verre — recyclage', unite: 't', valeur: 21, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    { id: 'déchets_verre_enfouis', nom: 'Verre — enfouissement', unite: 't', valeur: 2, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    // --- Bois ---
    { id: 'déchets_bois_recycl', nom: 'Bois — recyclage / valorisation', unite: 't', valeur: 20, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    { id: 'déchets_bois_incin', nom: 'Bois — incineration', unite: 't', valeur: 43, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    // --- Metal ---
    { id: 'déchets_metal_recycl', nom: 'Metaux — recyclage', unite: 't', valeur: 35, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    // --- DEEE ---
    { id: 'déchets_deee_recycl', nom: 'DEEE — recyclage', unite: 't', valeur: 250, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    // --- Organique ---
    { id: 'déchets_organique_compost', nom: 'Déchets organiques — compostage', unite: 't', valeur: 45, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    { id: 'déchets_organique_methanisation', nom: 'Déchets organiques — methanisation', unite: 't', valeur: 20, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    { id: 'déchets_organique_enfouis', nom: 'Déchets organiques — enfouissement', unite: 't', valeur: 692, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    // --- Textile ---
    { id: 'déchets_textile_incin', nom: 'Textiles — incineration', unite: 't', valeur: 1382, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    // --- DAS ---
    { id: 'déchets_das_incin', nom: 'Déchets activites de soins — incineration', unite: 't', valeur: 943, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
    // --- Fallback monétaire ---
    { id: 'dechets_eur', nom: 'Gestion déchets — fallback monétaire', unite: '€ HT', valeur: 0.160, incertitude: 80, perimetre: 'total', source: 'ADEME / SDES ratios monétaires 2023', categorie_bc: 'Déchets directs', categorie_ghg: 'Cat. 5 — Déchets générés' },
  ],

  // ============================================================
  // SCOPE 3 — Cat. 6 : Déplacements professionnels
  // ============================================================
  deplacements_pro: [
    // --- Voiture ---
    { id: 'voiture_moy_km', nom: 'Voiture moyenne (thermique)', unite: 'km', valeur: 0.218, incertitude: 20, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    { id: 'voiture_elec_pro_km', nom: 'Voiture electrique', unite: 'km', valeur: 0.103, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    { id: 'voiture_hybride_pro_km', nom: 'Voiture hybride', unite: 'km', valeur: 0.147, incertitude: 25, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    { id: 'voiture_location_km', nom: 'Voiture de location (thermique)', unite: 'km', valeur: 0.218, incertitude: 20, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    // --- Train ---
    { id: 'train_tgv_km', nom: 'TGV', unite: 'passager.km', valeur: 0.00185, incertitude: 20, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    { id: 'train_ter_km', nom: 'TER / Intercites', unite: 'passager.km', valeur: 0.0248, incertitude: 20, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    { id: 'train_eurostar_km', nom: 'Eurostar / Thalys', unite: 'passager.km', valeur: 0.0032, incertitude: 20, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    // --- Avion ---
    { id: 'avion_court_km', nom: 'Avion court-courrier (<1000 km)', unite: 'passager.km', valeur: 0.258, incertitude: 20, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    { id: 'avion_moyen_km', nom: 'Avion moyen-courrier (1000-3500 km)', unite: 'passager.km', valeur: 0.187, incertitude: 20, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    { id: 'avion_long_km', nom: 'Avion long-courrier (>3500 km)', unite: 'passager.km', valeur: 0.152, incertitude: 20, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    // --- Autres modes ---
    { id: 'taxi_km', nom: 'Taxi / VTC', unite: 'km', valeur: 0.218, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    { id: 'bus_interurbain_km', nom: 'Autocar / bus interurbain', unite: 'passager.km', valeur: 0.035, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    { id: 'ferry_km', nom: 'Ferry (passager avec voiture)', unite: 'passager.km', valeur: 0.267, incertitude: 40, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    { id: 'ferry_pieton_km', nom: 'Ferry (passager pieton)', unite: 'passager.km', valeur: 0.115, incertitude: 40, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    { id: 'moto_km', nom: 'Moto / scooter', unite: 'km', valeur: 0.164, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    // --- Fallback monétaire ---
    { id: 'deplacements_pro_eur', nom: 'Déplacements pro — fallback monétaire', unite: '€ HT', valeur: 0.136, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monétaires 2023 (agences voyage)', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
  ],

  // ============================================================
  // SCOPE 3 — Cat. 7 : Déplacements domicile-travail
  // ============================================================
  deplacements_dt: [
    // --- Voiture ---
    { id: 'dt_voiture_solo_km', nom: 'Voiture solo (thermique moyenne)', unite: 'km', valeur: 0.218, incertitude: 20, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
    { id: 'dt_voiture_elec_km', nom: 'Voiture electrique', unite: 'km', valeur: 0.103, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
    { id: 'dt_voiture_hybride_km', nom: 'Voiture hybride', unite: 'km', valeur: 0.147, incertitude: 25, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
    { id: 'dt_covoiturage_2_km', nom: 'Covoiturage (2 personnes)', unite: 'km', valeur: 0.109, incertitude: 25, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
    { id: 'dt_covoiturage_3_km', nom: 'Covoiturage (3 personnes)', unite: 'km', valeur: 0.073, incertitude: 25, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
    { id: 'dt_covoiturage_4_km', nom: 'Covoiturage (4 personnes)', unite: 'km', valeur: 0.055, incertitude: 25, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
    // --- Transports en commun ---
    { id: 'dt_bus_km', nom: 'Bus urbain', unite: 'passager.km', valeur: 0.113, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
    { id: 'dt_bus_gnv_km', nom: 'Bus urbain GNV / electrique', unite: 'passager.km', valeur: 0.055, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
    { id: 'dt_tramway_km', nom: 'Tramway', unite: 'passager.km', valeur: 0.0038, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
    { id: 'dt_metro_km', nom: 'Metro', unite: 'passager.km', valeur: 0.0038, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
    { id: 'dt_rer_km', nom: 'RER / train banlieue', unite: 'passager.km', valeur: 0.0065, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
    { id: 'dt_ter_km', nom: 'TER', unite: 'passager.km', valeur: 0.0248, incertitude: 20, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
    // --- Deux-roues / micro-mobilite ---
    { id: 'dt_scooter_thermique_km', nom: 'Scooter thermique', unite: 'km', valeur: 0.164, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
    { id: 'dt_scooter_elec_km', nom: 'Scooter electrique', unite: 'km', valeur: 0.022, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
    { id: 'dt_trottinette_elec_km', nom: 'Trottinette electrique', unite: 'km', valeur: 0.010, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
    { id: 'dt_velo_elec_km', nom: 'Velo a assistance electrique', unite: 'km', valeur: 0.006, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
    { id: 'dt_velo_km', nom: 'Velo / marche', unite: 'km', valeur: 0, incertitude: 0, perimetre: 'direct', source: 'Aucune emission directe', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
    // --- Teletravail ---
    { id: 'dt_teletravail', nom: 'Teletravail', unite: 'jour', valeur: 0, incertitude: 0, perimetre: 'direct', source: 'Non comptabilise (emissions au domicile)', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
    // --- Fallback monétaire ---
    { id: 'deplacements_dt_eur', nom: 'Trajets domicile-travail — fallback monétaire', unite: '€ HT', valeur: 0.319, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monétaires 2023 (transports terrestres)', categorie_bc: 'Déplacements domicile-travail', categorie_ghg: 'Cat. 7 — Déplacements domicile-travail' },
  ],

  // ============================================================
  // NOUVEAU — Numerique (usages)
  // ============================================================
  numerique: [
    { id: 'num_email_sans_pj', nom: 'Email envoye (sans piece jointe)', unite: 'email', valeur: 0.004, incertitude: 50, perimetre: 'total', source: 'ADEME / Impact CO2 2024', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'num_email_avec_pj', nom: 'Email envoye (1 Mo piece jointe)', unite: 'email', valeur: 0.019, incertitude: 50, perimetre: 'total', source: 'ADEME 2024', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'num_visio_heure', nom: 'Visioconference (1 heure)', unite: 'heure', valeur: 0.055, incertitude: 50, perimetre: 'total', source: 'ADEME / Impact CO2 2024', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'num_streaming_heure', nom: 'Streaming video (1 heure)', unite: 'heure', valeur: 0.036, incertitude: 50, perimetre: 'total', source: 'ADEME / Impact CO2 2024', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'num_stockage_cloud_go_an', nom: 'Stockage cloud (1 Go, 1 an, France)', unite: 'Go.an', valeur: 0.029, incertitude: 50, perimetre: 'total', source: 'ADEME 2024', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'num_recherche_web', nom: 'Recherche web (1 requete)', unite: 'requete', valeur: 0.007, incertitude: 50, perimetre: 'total', source: 'ADEME 2024', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'num_ia_requete', nom: 'Requête IA générative (réponse 400 tokens)', unite: 'requete', valeur: 0.00114, incertitude: 50, perimetre: 'total', source: 'Mistral AI / Carbone 4 / ADEME — ACV Mistral Large 2, juillet 2025', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'num_donnees_mobiles_go', nom: 'Donnees mobiles (1 Go)', unite: 'Go', valeur: 0.032, incertitude: 50, perimetre: 'total', source: 'ADEME 2024', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'num_donnees_wifi_go', nom: 'Donnees WiFi (1 Go)', unite: 'Go', valeur: 0.008, incertitude: 50, perimetre: 'total', source: 'ADEME 2024', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    // --- Fallback monétaire ---
    { id: 'numerique_eur', nom: 'Services numériques — fallback monétaire', unite: '€ HT', valeur: 0.075, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monétaires 2023 (services IT)', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
  ],

  // ============================================================
  // NOUVEAU — Eau
  // ============================================================
  eau: [
    { id: 'eau_potable_m3', nom: 'Eau potable de reseau', unite: 'm3', valeur: 0.175, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024 / Astee', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'eau_usee_m3', nom: 'Traitement des eaux usees', unite: 'm3', valeur: 0.650, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024 / Astee', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    { id: 'eau_total_m3', nom: 'Eau consommee (potable + assainissement)', unite: 'm3', valeur: 0.825, incertitude: 40, perimetre: 'total', source: 'Base Carbone ADEME 2024 / Astee', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
    // --- Fallback monétaire ---
    { id: 'eau_eur', nom: 'Eau — fallback monétaire', unite: '€ HT', valeur: 0.090, incertitude: 80, perimetre: 'total', source: 'ADEME / SDES ratios monétaires 2023', categorie_bc: 'Achats de produits ou services', categorie_ghg: 'Cat. 1 — Biens et services achetés' },
  ],

  // ============================================================
  // NOUVEAU — Hébergement professionnel
  // ============================================================
  hebergement: [
    { id: 'hotel_france_nuit', nom: 'Nuit d\'hôtel (France)', unite: 'nuitée', valeur: 6.9, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    { id: 'hotel_europe_nuit', nom: 'Nuit d\'hôtel (Europe)', unite: 'nuitée', valeur: 10.5, incertitude: 50, perimetre: 'total', source: 'Defra 2024', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    { id: 'hotel_monde_nuit', nom: 'Nuit d\'hôtel (hors Europe)', unite: 'nuitée', valeur: 17.0, incertitude: 50, perimetre: 'total', source: 'Defra 2024', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    { id: 'residence_affaires_nuit', nom: 'Résidence d\'affaires / appart-hôtel', unite: 'nuitée', valeur: 5.5, incertitude: 50, perimetre: 'total', source: 'Estimation ADEME', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
    // --- Fallback monétaire ---
    { id: 'hebergement_eur', nom: 'Hébergement — fallback monétaire', unite: '€ HT', valeur: 0.250, incertitude: 80, perimetre: 'total', source: 'ADEME Ratios monétaires 2023 (hébergement-restauration)', categorie_bc: 'Déplacements professionnels', categorie_ghg: 'Cat. 6 — Déplacements professionnels' },
  ],

  // ============================================================
  // NOUVEAU — Energies alternatives
  // ============================================================
  energie_autre: [
    { id: 'biogaz_kwh', nom: 'Biogaz / biométhane', unite: 'kWh PCI', valeur: 0.045, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe', co2b: 0.198 },
    { id: 'hydrogene_gris_kg', nom: 'Hydrogene gris (vaporeformage)', unite: 'kg', valeur: 11.5, incertitude: 30, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
    { id: 'hydrogene_vert_kg', nom: 'Hydrogene vert (electrolyse ENR)', unite: 'kg', valeur: 2.0, incertitude: 50, perimetre: 'total', source: 'Base Carbone ADEME 2024', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
    { id: 'pac_elec_kwh', nom: 'Pompe a chaleur electrique (COP 3)', unite: 'kWh thermique', valeur: 0.019, incertitude: 30, perimetre: 'total', source: 'Calcul : elec France / COP 3', categorie_bc: 'Émissions indirectes — Électricité', categorie_ghg: 'Scope 2 — Électricité achetée' },
    // --- Fallback monétaire ---
    { id: 'energie_autre_eur', nom: 'Énergie alternative — fallback monétaire', unite: '€ HT', valeur: 0.310, incertitude: 80, perimetre: 'total', source: 'ADEME / SDES ratios monétaires 2023 (énergie)', categorie_bc: 'Émissions directes — Sources fixes', categorie_ghg: 'Scope 1 — Combustion fixe' },
  ],
}

// Récupérer tous les FE à plat
export function getAllFactors() {
  return Object.values(emissionFactors).flat()
}

// Récupérer les FE par catégorie
export function getFactorsByCategory(category) {
  return emissionFactors[category] || []
}

// Récupérer un FE par ID
export function getFactorById(id) {
  return getAllFactors().find(f => f.id === id)
}

// Récupérer un FE par ID en cherchant aussi dans les facteurs custom
export function getFactorByIdWithCustom(id, facteursCustom = []) {
  return getAllFactors().find(f => f.id === id)
    || facteursCustom.find(f => f.id === id)
    || null
}

export default emissionFactors
