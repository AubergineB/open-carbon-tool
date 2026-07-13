// Définition des postes d'émission avec mapping BC® / GHG Protocol
// et aide contextuelle pour le formulaire de collecte

const postesEmission = [
  // === SCOPE 1 ===
  {
    id: 'combustion_fixe',
    scope: 1,
    nom: 'Chauffage des locaux',
    nom_bc: 'Émissions directes — Sources fixes de combustion',
    nom_ghg: 'Scope 1 — Combustion fixe',
    aide: 'Consommation de gaz naturel, fioul ou autre combustible pour chauffer vos locaux. Regardez vos factures de gaz ou de fioul sur l\'année.',
    donnees_attendues: 'Factures de gaz (kWh ou m³), factures de fioul (litres)',
    categorieFE: 'combustion_fixe',
    icon: 'Flame',
    guide: {
      ou_trouver: [
        'Factures GRDF / fournisseur gaz : espace client en ligne',
        'Bons de livraison fioul chez votre livreur',
        'Gestionnaire d\'immeuble si le chauffage est dans les charges',
      ],
      quoi_chercher: [
        'kWh PCI (pas PCS) sur la facture de gaz',
        'Litres livrés sur le bon de livraison fioul',
      ],
      ordres_grandeur: [
        'Bureau 50 salariés : 50 000 – 150 000 kWh gaz/an',
      ],
      erreurs_courantes: [
        'Confondre kWh PCI et kWh PCS (+10 % d\'écart)',
        'Oublier le chauffage inclus dans les charges locatives',
      ],
      pourquoi: 'Souvent le 1er poste Scope 1 d\'une PME tertiaire. Le gaz représente aussi des émissions amont (Scope 3.3) liées à son extraction et transport.',
    },
  },
  {
    id: 'combustion_mobile',
    scope: 1,
    nom: 'Véhicules de l\'entreprise',
    nom_bc: 'Émissions directes — Sources mobiles',
    nom_ghg: 'Scope 1 — Combustion mobile',
    aide: 'Carburant consommé par les véhicules détenus ou loués longue durée par l\'entreprise. Vérifiez vos cartes carburant ou factures station.',
    donnees_attendues: 'Litres de carburant (diesel, essence), ou km parcourus avec consommation moyenne',
    categorieFE: 'combustion_mobile',
    icon: 'Truck',
    guide: {
      ou_trouver: [
        'Cartes carburant (Total Energies, Shell, BP…) : relevé annuel',
        'Relevés kilométriques des véhicules de flotte',
        'Factures station-service si paiement direct',
      ],
      quoi_chercher: [
        'Litres par type de carburant (diesel, essence, B100…)',
        'Kilomètres parcourus si pas de relevé en litres (conso moyenne à appliquer)',
      ],
      ordres_grandeur: [
        'PME avec 10 véhicules utilitaires : 15 000 – 50 000 L diesel/an',
      ],
      erreurs_courantes: [
        'Oublier les véhicules en LLD (Location Longue Durée), aussi comptabilisés en Scope 1',
        'Mélanger usage personnel et professionnel sans pondération',
      ],
      pourquoi: 'Poste dominant pour les PME de transport et logistique. Inclut les émissions de combustion directe (Scope 1) + amont carburant (Scope 3.3).',
    },
  },
  {
    id: 'fugitives',
    scope: 1,
    nom: 'Climatisation et réfrigération',
    nom_bc: 'Émissions directes — Fugitives',
    nom_ghg: 'Scope 1 — Émissions fugitives',
    aide: 'Fuites de gaz réfrigérant des climatisations et systèmes de froid. Vérifiez les fiches d\'intervention de maintenance.',
    donnees_attendues: 'Quantité de gaz rechargée (kg) et type de gaz (R-410A, R-32, etc.)',
    categorieFE: 'fugitives',
    icon: 'Wind',
    guide: {
      ou_trouver: [
        'Carnet de maintenance de la climatisation',
        'Attestation d\'intervention du frigoriste agréé',
        'Factures d\'achat ou de recharge de fluide frigorigène',
      ],
      quoi_chercher: [
        'Kilogrammes de gaz rechargés dans l\'année',
        'Type exact de réfrigérant (R-410A, R-32, R-134a…)',
      ],
      ordres_grandeur: [
        'Bureau standard : 0 – 2 kg rechargés/an',
      ],
      erreurs_courantes: [
        'Confondre recharge annuelle et charge initiale à l\'installation',
        'Oublier les chambres froides et le matériel frigorifique',
        'Chercher une méthode plus sophistiquée : le bilan matière ou le screening par équipement n\'apportent rien à l\'échelle d\'une PME',
      ],
      pourquoi: 'Faible en volume mais GWP très élevé : R-410A = 2088 fois le CO₂. 1 kg perdu = plus de 2 tCO₂e. La méthode par les achats de fluide (kg rechargés par le frigoriste) est LA méthode recommandée pour une PME : simple, traçable via les attestations d\'intervention, et suffisamment précise.',
      liens: [
        { titre: 'EPA — Fugitive Emissions Guidance : les autres méthodes de calcul (screening, bilan matière)', url: 'https://www.epa.gov/sites/default/files/2020-12/documents/fugitiveemissions.pdf' },
      ],
    },
  },

  // === SCOPE 2 ===
  {
    id: 'electricite',
    scope: 2,
    nom: 'Électricité',
    nom_bc: 'Émissions indirectes — Électricité',
    nom_ghg: 'Scope 2 — Électricité achetée',
    aide: 'Consommation totale d\'électricité de l\'entreprise. Vos factures EDF, Engie ou autre fournisseur indiquent les kWh.',
    donnees_attendues: 'Factures d\'électricité annuelles (kWh)',
    categorieFE: 'electricite',
    icon: 'Zap',
    guide: {
      ou_trouver: [
        'Espace client EDF / Engie / fournisseur alternatif',
        'Gestionnaire d\'immeuble si l\'électricité est dans les charges',
      ],
      quoi_chercher: [
        'Ligne « Consommation » en kWh — pas le montant en euros',
        'Période facturée : doit couvrir 12 mois complets',
      ],
      ordres_grandeur: [
        'Bureau 50 salariés : 50 000 – 150 000 kWh/an',
      ],
      erreurs_courantes: [
        'Confondre kWh et euros sur la facture',
        'Oublier les compteurs secondaires (parking, enseigne, local technique)',
      ],
      pourquoi: 'En France, l\'électricité est peu carbonée grâce au nucléaire (~0.06 kgCO₂e/kWh), mais ce poste est obligatoire en Scope 2.',
    },
  },
  {
    id: 'reseaux',
    scope: 2,
    nom: 'Réseaux de chaleur / froid',
    nom_bc: 'Émissions indirectes — Vapeur, chaleur, froid',
    nom_ghg: 'Scope 2 — Réseaux chaleur/froid',
    aide: 'Si vos locaux sont raccordés à un réseau de chaleur ou de froid urbain. Vérifiez auprès de votre gestionnaire d\'immeuble.',
    donnees_attendues: 'Factures réseau de chaleur/froid (kWh)',
    categorieFE: 'reseaux',
    icon: 'Thermometer',
    guide: {
      ou_trouver: [
        'Gestionnaire d\'immeuble ou syndic de copropriété',
        'Facture directe réseau de chaleur / froid (ex : CPCU, Idex, Dalkia…)',
      ],
      quoi_chercher: [
        'kWh facturés sur l\'année',
        'Nom du réseau — le facteur d\'émission varie selon le mix du réseau',
      ],
      ordres_grandeur: [
        'Bureau raccordé : 30 000 – 100 000 kWh/an',
      ],
      erreurs_courantes: [
        'Confondre la facture de réseau de chaleur avec la facture d\'électricité',
        'Ignorer un raccordement existant (vérifier auprès du bailleur)',
      ],
      pourquoi: 'Le facteur d\'émission varie de 0.05 à 0.25 kgCO₂e/kWh selon le mix du réseau (biomasse, géothermie, cogénération…).',
    },
  },

  // === SCOPE 3 ===
  {
    id: 'achats',
    scope: 3,
    nom: 'Achats de biens et services',
    nom_bc: 'Achats de produits ou services',
    nom_ghg: 'Cat. 1 — Biens et services achetés',
    aide: 'Tous les achats de l\'entreprise : fournitures, services informatiques, conseil, nettoyage, assurance, etc. On utilise les montants en € HT par catégorie.',
    donnees_attendues: 'Montants d\'achats annuels par catégorie (€ HT) ou import FEC',
    categorieFE: 'achats',
    icon: 'ShoppingCart',
    guide: {
      ou_trouver: [
        'FEC (Fichier des Écritures Comptables) — exportable depuis le logiciel comptable',
        'Comptabilité analytique ou grand livre fournisseurs',
      ],
      quoi_chercher: [
        'Montants HT par catégorie de dépense (pas TTC)',
        'Catégories de dépense : informatique, conseil, nettoyage, assurance…',
        'Exclure les lignes déjà comptées ailleurs avec une méthode plus précise : carburants, électricité, fret sous-traité',
      ],
      ordres_grandeur: [
        'PME 30 salariés tertiaire : 200 000 – 800 000 € HT d\'achats/an',
      ],
      erreurs_courantes: [
        'Utiliser les montants TTC au lieu de HT',
        'Double compter des achats déjà couverts par un poste dédié : carburants (véhicules), électricité, transport sous-traité (fret)',
        'Inclure les immobilisations (bâtiments, machines, véhicules, gros IT) : elles relèvent du poste Biens d\'équipement',
      ],
      pourquoi: 'Souvent 30 – 60 % du bilan carbone total d\'une PME tertiaire. C\'est le poste Scope 3 le plus lourd et le plus sous-estimé. Le périmètre se définit par soustraction : tout ce qui n\'est pas déjà compté par un poste plus précis, hors immobilisations.',
    },
  },
  {
    id: 'immobilisations',
    scope: 3,
    nom: 'Biens d\'équipement',
    nom_bc: 'Immobilisations de biens',
    nom_ghg: 'Cat. 2 — Biens d\'équipement',
    aide: 'Investissements de l\'année : ordinateurs, véhicules, mobilier, machines. On compte le matériel acheté ou renouvelé.',
    donnees_attendues: 'Nombre et type d\'équipements achetés dans l\'année, ou montant € HT',
    categorieFE: 'immobilisations',
    icon: 'Monitor',
    guide: {
      ou_trouver: [
        'Service IT : inventaire du matériel acheté dans l\'année',
        'Comptabilité : tableau des immobilisations (classe 2)',
      ],
      quoi_chercher: [
        'Nombre d\'unités achetées dans l\'année (pas le stock total)',
        'Type précis : laptop, écran, smartphone, serveur, mobilier…',
      ],
      ordres_grandeur: [
        'PME 30 salariés : 5 – 15 laptops achetés/an',
      ],
      erreurs_courantes: [
        'Confondre le parc informatique total avec les achats de l\'année',
        'Oublier le mobilier de bureau et les équipements de cuisine/accueil',
      ],
      pourquoi: 'Souvent sous-estimé. Un laptop représente environ 300 kgCO₂e — un véhicule thermique neuf dépasse 10 tCO₂e.',
    },
  },
  {
    id: 'fret_amont',
    scope: 3,
    nom: 'Transport de marchandises (amont)',
    nom_bc: 'Transport de marchandises amont',
    nom_ghg: 'Cat. 4 — Transport & distribution amont',
    aide: 'Transport des marchandises que vous recevez : livraisons fournisseurs, approvisionnement. Indiquez les tonnes transportées, la distance et le mode.',
    donnees_attendues: 'Tonnes-kilomètres (tkm) par mode de transport, ou tonnes + distance',
    categorieFE: 'fret',
    icon: 'PackageOpen',
    guide: {
      ou_trouver: [
        'Service logistique ou achats : lettres de voiture / CMR',
        'Transporteurs et prestataires logistiques : relevé annuel',
      ],
      quoi_chercher: [
        'Tonnes transportées × distance en km = tkm',
        'Mode de transport : routier, ferroviaire, maritime, aérien',
      ],
      ordres_grandeur: [
        'PME commerce : 50 000 – 500 000 tkm/an',
      ],
      erreurs_courantes: [
        'Confondre tonnes (masse) et tkm (tonnes × kilomètres)',
        'Oublier les petits colis express (Chronopost, DHL…) — souvent en avion',
      ],
      pourquoi: 'Poste clé pour les PME industrielles et commerciales. Le fret aérien émet 50× plus que le fret maritime par tkm.',
    },
  },
  {
    id: 'dechets',
    scope: 3,
    nom: 'Déchets',
    nom_bc: 'Déchets directs',
    nom_ghg: 'Cat. 5 — Déchets générés',
    aide: 'Déchets produits par l\'entreprise : poubelles, cartons, déchets de production. Demandez les tonnages à votre prestataire déchets.',
    donnees_attendues: 'Tonnages annuels par type de déchet et filière de traitement',
    categorieFE: 'dechets',
    icon: 'Trash2',
    guide: {
      ou_trouver: [
        'Prestataire déchets : bordereau de suivi annuel (BSD)',
        'Bailleur ou syndic si la collecte est mutualisée dans l\'immeuble',
      ],
      quoi_chercher: [
        'Tonnes par type de déchet : DIB, papier/carton, DEEE, verre…',
        'Filière de traitement : incinération, recyclage, mise en décharge',
      ],
      ordres_grandeur: [
        'Bureau 30 salariés : 2 – 8 tonnes de déchets/an',
      ],
      erreurs_courantes: [
        'Confondre le volume en m³ avec la masse en tonnes',
        'Oublier les DEEE (Déchets d\'Équipements Électriques et Électroniques)',
      ],
      pourquoi: 'Faible en tCO₂e mais symboliquement important pour la sensibilisation des équipes et l\'économie circulaire.',
    },
  },
  {
    id: 'deplacements_pro',
    scope: 3,
    nom: 'Déplacements professionnels',
    nom_bc: 'Déplacements professionnels',
    nom_ghg: 'Cat. 6 — Déplacements professionnels',
    aide: 'Voyages d\'affaires des salariés : avion, train, location de voiture, taxi. Consultez les notes de frais et les agences de voyage.',
    donnees_attendues: 'Kilomètres par mode de transport (avion, train, voiture)',
    categorieFE: 'deplacements_pro',
    icon: 'Briefcase',
    guide: {
      ou_trouver: [
        'Notes de frais des salariés (via outil RH ou tableur)',
        'Agence de voyage d\'entreprise : rapport annuel par mode',
        'Réservations SNCF Business et compagnies aériennes',
      ],
      quoi_chercher: [
        'Kilomètres par mode : avion court/moyen/long courrier, train, voiture',
        'Catégorie de vol selon la distance : court-courrier (< 1 000 km), long-courrier',
      ],
      ordres_grandeur: [
        'PME 30 salariés : 20 000 – 100 000 km train/an, 0 – 30 000 km avion',
      ],
      erreurs_courantes: [
        'Confondre aller-retour et trajet simple',
        'Oublier les taxis, VTC et locations de voiture',
      ],
      pourquoi: 'L\'avion domine ce poste : un aller-retour Paris–New York représente environ 1.7 tCO₂e. Le train est 50× moins émetteur.',
    },
  },
  {
    id: 'deplacements_dt',
    scope: 3,
    nom: 'Trajets domicile-travail',
    nom_bc: 'Déplacements domicile-travail',
    nom_ghg: 'Cat. 7 — Déplacements domicile-travail',
    aide: 'Trajets quotidiens des salariés entre leur domicile et le lieu de travail. Une enquête interne rapide (distance, mode, nb jours/semaine) suffit.',
    donnees_attendues: 'Par salarié : distance aller (km), mode de transport, nb jours/semaine sur site',
    categorieFE: 'deplacements_dt',
    icon: 'Home',
    guide: {
      ou_trouver: [
        'Enquête interne par formulaire simple (Google Forms, Framaforms…)',
        'RH ou CSE pour les données de mobilité existantes',
      ],
      quoi_chercher: [
        'Distance aller domicile → bureau (km, pas aller-retour)',
        'Mode de transport principal et nombre de jours/semaine en présentiel',
      ],
      ordres_grandeur: [
        'PME 30 salariés : 150 000 – 400 000 km voiture cumulés/an',
      ],
      erreurs_courantes: [
        'Confondre aller-retour et trajet aller',
        'Ignorer le télétravail réel (jours à domicile sans émissions DT)',
      ],
      pourquoi: 'Représente souvent 5 – 15 % du bilan. Le levier principal est le télétravail et la Forfait Mobilité Durable (FMD).',
    },
  },
  {
    id: 'fret_aval',
    scope: 3,
    nom: 'Transport de marchandises (aval)',
    nom_bc: 'Transport de marchandises aval',
    nom_ghg: 'Cat. 9 — Transport & distribution aval',
    aide: 'Transport des produits que vous expédiez vers vos clients. Même approche que le fret amont.',
    donnees_attendues: 'Tonnes-kilomètres (tkm) par mode de transport, ou tonnes + distance',
    categorieFE: 'fret',
    icon: 'Package',
    guide: {
      ou_trouver: [
        'Service expédition : bons de livraison et bordereaux transporteurs',
        'Transporteurs et prestataires logistiques aval',
        'Outil de suivi des livraisons clients',
      ],
      quoi_chercher: [
        'Tonnes × km par mode (routier, ferroviaire, maritime)',
        'Distinguer livraisons locales, nationales et internationales',
      ],
      ordres_grandeur: [
        'Variable selon l\'activité — non pertinent pour les prestataires de services purs',
      ],
      erreurs_courantes: [
        'Confondre tonnes et tkm (même erreur que fret amont)',
        'Oublier le dernier kilomètre en véhicule léger',
      ],
      pourquoi: 'Pertinent uniquement si vous livrez des produits physiques. À exclure si vous êtes un prestataire de services immatériels.',
    },
  },
  {
    id: 'usage_produits',
    scope: 3,
    nom: 'Usage des produits et services vendus',
    nom_bc: 'Utilisation des produits et services vendus',
    nom_ghg: 'Cat. 11 — Utilisation des produits et services vendus',
    aide: 'Émissions générées par vos clients lorsqu\'ils utilisent les produits ou services que vous leur vendez. Ce poste nécessite des facteurs d\'émission personnalisés.',
    donnees_attendues: 'Quantités vendues × facteur d\'émission personnalisé (à construire avec un consultant)',
    categorieFE: 'usage_produits',
    icon: 'Storefront',
    guide: {
      ou_trouver: [
        'Données commerciales : volumes vendus par type de produit',
        'Fiches techniques produits : composition, consommation énergétique, durée de vie',
        'Syndicat ou fédération professionnelle : demander le standard de calcul sectoriel de votre industrie',
        'Produit ou service non standard : prévoir une ACV personnalisée avec un consultant',
      ],
      quoi_chercher: [
        'Volume ou nombre d\'unités vendues dans l\'année, par gamme de produit',
        'Pour les combustibles : litres ou tonnes vendus par type (essence, diesel, gaz…)',
        'Pour les équipements : consommation énergétique moyenne × durée de vie estimée',
        'Pour les produits chimiques : GWP des molécules libérées à l\'usage (GIEC AR6)',
      ],
      ordres_grandeur: [
        'Distributeur carburant : 50 à 200× les émissions de scopes 1+2',
        'Constructeur automobile : 75-90% du bilan total',
        'PME tertiaire pure (conseil, IT) : souvent non applicable (= 0)',
      ],
      erreurs_courantes: [
        'Ne pas calculer ce poste faute de FE ou de méthodologie sectorielle : c\'est l\'erreur la plus fréquente — et souvent la plus grosse part du bilan qui disparaît',
        'Confondre Cat. 11 (usage) avec Cat. 1 (achats) ou Cat. 10 (transformation)',
        'Double compter la combustion si le fournisseur l\'a déjà intégrée en Cat. 11',
      ],
      pourquoi: 'Souvent le poste d\'émission le plus émissif, tous secteurs confondus — et le plus souvent omis. La démarche : 1) vérifier si votre fédération ou syndicat professionnel publie un standard de calcul sectoriel ; 2) sinon, construire des facteurs d\'émission personnalisés par une ACV de vos produits ou services, avec un accompagnement conseil. Omettre ce poste expose à une sous-déclaration majeure.',
    },
  },
  {
    id: 'numerique',
    scope: 3,
    nom: 'Empreinte numérique',
    nom_bc: 'Achats de produits ou services',
    nom_ghg: 'Cat. 1 — Biens et services achetés',
    aide: 'Impact des usages numériques : emails, visioconférences, stockage cloud, streaming. Souvent faible en volume mais utile pour la sensibilisation.',
    donnees_attendues: 'Nombre d\'emails/jour, heures de visio/mois, volume stockage cloud (Go)',
    categorieFE: 'numerique',
    icon: 'Laptop',
    guide: {
      ou_trouver: [
        'Service IT : factures cloud (AWS, Azure, GCP, OVH…)',
        'Outils collaboratifs : Google Workspace, Microsoft 365 — statistiques d\'usage',
        'Abonnements IA : nombre de comptes et statistiques de requêtes (ChatGPT, Le Chat, Copilot…)',
      ],
      quoi_chercher: [
        'Nombre d\'emails envoyés/jour par l\'ensemble des salariés',
        'Heures de visioconférence/mois et volume de stockage cloud (Go)',
        'Nombre de requêtes d\'IA générative par mois (assistants, chatbots, génération de code)',
      ],
      ordres_grandeur: [
        'PME 30 salariés : 0.5 – 3 tCO₂e/an au total pour les usages numériques',
        'Requête IA générative : 1,14 gCO₂e par réponse de 400 tokens (ACV Mistral Large 2, 2025)',
      ],
      erreurs_courantes: [
        'Surestimer l\'impact : souvent moins de 2 % du bilan carbone d\'une PME',
        'Oublier l\'IA générative : usage en forte croissance, à suivre dès maintenant',
      ],
      pourquoi: 'Faible en tCO₂e mais excellent levier de sensibilisation interne. Les équipements (laptops, serveurs) ont un impact bien supérieur aux usages. L\'IA générative reste modeste par requête mais croît très vite : c\'est le premier usage numérique à tracer.',
    },
  },
  {
    id: 'eau',
    scope: 3,
    nom: 'Consommation d\'eau',
    nom_bc: 'Achats de produits ou services',
    nom_ghg: 'Cat. 1 — Biens et services achetés',
    aide: 'Eau potable consommée dans vos locaux et traitement des eaux usées. Consultez vos factures d\'eau ou votre gestionnaire d\'immeuble.',
    donnees_attendues: 'Factures d\'eau annuelles (m³)',
    categorieFE: 'eau',
    icon: 'Droplets',
    guide: {
      ou_trouver: [
        'Factures d\'eau : Veolia, Suez ou régie municipale',
        'Gestionnaire d\'immeuble si l\'eau est dans les charges locatives',
      ],
      quoi_chercher: [
        'm³ consommés sur l\'année (relevé compteur ou facture)',
      ],
      ordres_grandeur: [
        'Bureau 30 salariés : 150 – 500 m³/an',
      ],
      erreurs_courantes: [
        'Confondre m³ et litres (1 m³ = 1 000 litres)',
        'Oublier l\'eau incluse dans les charges si non facturée directement',
      ],
      pourquoi: 'Impact carbone très faible (≈ 0.3 kgCO₂e/m³), mais c\'est un quick win de collecte et un indicateur RSE important.',
    },
  },
  {
    id: 'hebergement',
    scope: 3,
    nom: 'Hébergement professionnel',
    nom_bc: 'Déplacements professionnels',
    nom_ghg: 'Cat. 6 — Déplacements professionnels',
    aide: 'Nuitées d\'hôtel lors des déplacements professionnels. Consultez les notes de frais et les réservations.',
    donnees_attendues: 'Nombre de nuitées par zone géographique (France, Europe, monde)',
    categorieFE: 'hebergement',
    icon: 'Hotel',
    guide: {
      ou_trouver: [
        'Notes de frais des salariés (rubrique hébergement)',
        'Agence de voyage d\'entreprise ou plateformes (Booking Business, Accor…)',
      ],
      quoi_chercher: [
        'Nombre de nuitées par zone géographique : France, Europe, reste du monde',
      ],
      ordres_grandeur: [
        'PME 30 salariés : 20 – 200 nuitées/an selon l\'activité',
      ],
      erreurs_courantes: [
        'Oublier les nuitées facturées directement à l\'entreprise (hors notes de frais)',
      ],
      pourquoi: 'Facteur d\'émission moyen : 6 kgCO₂e/nuit en France, 20 kgCO₂e/nuit à l\'international. À combiner avec les déplacements pro.',
    },
  },
  {
    id: 'energie_autre',
    scope: 1,
    nom: 'Énergies alternatives',
    nom_bc: 'Émissions directes — Sources fixes de combustion',
    nom_ghg: 'Scope 1 — Combustion fixe',
    aide: 'Biogaz, hydrogène, pompe à chaleur et autres sources d\'énergie alternatives. Consultez vos contrats de fourniture.',
    donnees_attendues: 'Consommation en kWh ou kg selon le vecteur énergétique',
    categorieFE: 'energie_autre',
    icon: 'ElectricBolt',
    guide: {
      ou_trouver: [
        'Contrat fournisseur biogaz ou hydrogène',
        'Factures spécifiques au vecteur énergétique alternatif',
      ],
      quoi_chercher: [
        'kWh ou kg selon le vecteur (biogaz en kWh, hydrogène en kg)',
      ],
      ordres_grandeur: [
        'Très variable — souvent négligeable en PME <50 salariés',
      ],
      erreurs_courantes: [
        'Double compter de l\'énergie déjà comptabilisée dans un autre poste (gaz, électricité)',
      ],
      pourquoi: 'Rare en PME mais en croissance avec les pompes à chaleur et le biogaz. À renseigner uniquement si vous avez des sources distinctes non couvertes ailleurs.',
    },
  },
]

export function getPostesByScope(scope) {
  return postesEmission.filter(p => p.scope === scope)
}

export default postesEmission
