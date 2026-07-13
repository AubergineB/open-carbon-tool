// Contenu de la vue Documentation — espace pédagogique.
// Contenu méthodologique validé par Mobility Transition Lab : ne pas
// reformuler ni compléter sans validation (voir docs/plan/11-documentation.md).

export const documentationSections = [
  {
    id: 'enjeux',
    titre: 'Les enjeux climatiques en deux minutes',
    icon: 'public',
    blocs: [
      { type: 'p', texte: 'Les activités humaines — combustion d’énergies fossiles, industrie, agriculture, déforestation — émettent des gaz à effet de serre (GES) qui s’accumulent dans l’atmosphère et réchauffent le climat. Le GIEC estime le réchauffement déjà atteint à environ +1,1 °C sur la décennie 2011-2020 par rapport à l’ère préindustrielle, et les années récentes dépassent ponctuellement +1,5 °C.' },
      { type: 'p', texte: 'L’Accord de Paris (2015) engage les États à contenir le réchauffement bien en dessous de +2 °C et à poursuivre les efforts vers +1,5 °C. Concrètement, cela signifie atteindre la neutralité carbone vers 2050 — objectif inscrit dans le droit européen et dans la Stratégie nationale bas-carbone française. L’empreinte moyenne d’une personne en France est de l’ordre de 9 tCO₂e par an ; une trajectoire compatible avec l’Accord de Paris la ramène autour de 2 tCO₂e.' },
      { type: 'p', texte: 'Les entreprises sont au cœur de cette transformation : leurs décisions d’achat, de production, de logistique et d’investissement déterminent une grande partie des émissions. Mesurer ses émissions n’est pas une fin en soi — c’est le point de départ pour les réduire.' },
    ],
  },
  {
    id: 'definition',
    titre: 'Qu’est-ce qu’un bilan carbone ?',
    icon: 'co2',
    blocs: [
      { type: 'p', texte: 'Un bilan carbone (ou bilan de gaz à effet de serre) est l’inventaire des émissions de GES générées par l’activité d’une organisation sur une période donnée, généralement un an. Le résultat s’exprime en tonnes équivalent CO₂ (tCO₂e) : les différents gaz (CO₂, méthane, protoxyde d’azote, fluides frigorigènes…) sont convertis en équivalent CO₂ selon leur pouvoir de réchauffement.' },
      { type: 'p', texte: 'Les émissions sont classées en trois périmètres, appelés scopes :' },
      { type: 'liste', items: [
        'Scope 1 — émissions directes : combustion sur site (gaz, fioul), carburant des véhicules de l’entreprise, fuites de fluides frigorigènes.',
        'Scope 2 — émissions indirectes liées à l’énergie achetée : électricité, réseaux de chaleur et de froid.',
        'Scope 3 — toutes les autres émissions indirectes de la chaîne de valeur : achats de biens et services, fret, déplacements, déchets, immobilisations, usage des produits vendus…',
      ] },
      { type: 'encadre', ton: 'info', titre: 'Ordre de grandeur', texte: 'Pour la plupart des entreprises, le Scope 3 représente 70 à 90 % du total. Un bilan limité aux Scopes 1 et 2 passe à côté de l’essentiel.' },
      { type: 'p', texte: 'Mesurer, c’est comprendre : le bilan révèle où se concentrent les émissions, et donc où agir en priorité. Il fournit aussi un langage commun — le tCO₂e — pour comparer des actions, suivre une trajectoire et rendre des comptes.' },
    ],
  },
  {
    id: 'pourquoi',
    titre: 'Pourquoi faire un bilan carbone ?',
    icon: 'gavel',
    blocs: [
      { type: 'sousTitre', texte: 'Parce que c’est utile' },
      { type: 'liste', items: [
        'Piloter : identifier les postes dominants et prioriser les actions de réduction.',
        'Anticiper : la dépendance aux énergies fossiles est un risque économique (prix, taxe carbone, réglementation).',
        'Répondre aux clients : les grands donneurs d’ordres demandent de plus en plus les émissions de leurs fournisseurs (leur propre Scope 3).',
        'Accéder à des financements : appels d’offres publics, banques et investisseurs intègrent des critères climat.',
        'Mobiliser en interne : un bilan chiffré rend le sujet concret pour les équipes.',
      ] },
      { type: 'sousTitre', texte: 'Parce que c’est parfois obligatoire' },
      { type: 'p', texte: 'En France, le bilan d’émissions de gaz à effet de serre (BEGES) est obligatoire pour les entreprises de plus de 500 salariés (250 en outre-mer), les collectivités de plus de 50 000 habitants et les personnes morales de droit public de plus de 250 agents. Il se met à jour tous les 4 ans pour les entreprises (3 ans pour les acteurs publics) et doit couvrir les émissions indirectes significatives (Scope 3) depuis la réforme de 2022. Une amende administrative est prévue en cas de non-réalisation.' },
      { type: 'p', texte: 'Au niveau européen, la directive CSRD impose aux grandes entreprises un reporting de durabilité incluant les émissions de GES. Le paquet législatif « Omnibus » de 2025 a relevé les seuils et décalé le calendrier : vérifiez les obligations en vigueur pour votre situation. Les PME hors obligation peuvent s’appuyer sur le standard volontaire VSME — et sont de toute façon concernées indirectement, via les demandes de leurs clients soumis à la CSRD.' },
      { type: 'encadre', ton: 'alerte', titre: 'Positionnement de cet outil', texte: 'Open Carbon Tool est un outil de diagnostic : il ne constitue ni un bilan certifié ni un BEGES réglementaire. Pour un dépôt réglementaire ou une communication engageante, faites valider la démarche par un professionnel.' },
    ],
  },
  {
    id: 'etapes',
    titre: 'Réaliser son bilan : les six étapes',
    icon: 'checklist',
    blocs: [
      { type: 'liste', items: [
        '1. Cadrer — définir le périmètre organisationnel (quelles entités, quels sites), l’année de référence et les postes d’émission pertinents pour votre activité.',
        '2. Collecter — rassembler les données d’activité : factures d’énergie, cartes carburant, comptabilité achats, données de fret, enquête déplacements. C’est l’étape la plus longue ; les guides pratiques de la collecte vous y aident poste par poste.',
        '3. Calculer — multiplier chaque donnée d’activité par son facteur d’émission. L’outil le fait en temps réel, avec des facteurs sourcés (Base Empreinte ADEME).',
        '4. Analyser — hiérarchiser les postes, vérifier la plausibilité des résultats, identifier les incertitudes fortes.',
        '5. Restituer — présenter les résultats en interne et aux parties prenantes, avec les hypothèses et les limites.',
        '6. Agir — construire un plan de réduction chiffré, puis refaire le bilan régulièrement pour suivre la trajectoire.',
      ] },
      { type: 'encadre', ton: 'info', titre: 'Un conseil', texte: 'Ne cherchez pas la perfection au premier bilan. Un bilan complet à 20 % près, livré en quelques semaines, vaut mieux qu’un bilan à 5 % près jamais terminé. La précision se gagne au fil des exercices, en commençant par les postes dominants.' },
    ],
  },
  {
    id: 'outils',
    titre: 'Choisir son outil',
    icon: 'construction',
    blocs: [
      { type: 'p', texte: 'Trois grandes familles d’outils coexistent, avec chacune ses forces :' },
      { type: 'sousTitre', texte: 'Le tableur' },
      { type: 'p', texte: 'Gratuit, flexible, universel. L’ADEME et l’Association pour la transition Bas Carbone diffusent des trames. Bien adapté pour un premier exercice ou un périmètre simple, mais fragile : formules cassées, facteurs à tenir à jour à la main, traçabilité limitée, difficile à transmettre.' },
      { type: 'sousTitre', texte: 'Les plateformes SaaS carbone' },
      { type: 'p', texte: 'Des solutions en ligne par abonnement, souvent riches : connecteurs comptables, tableaux de bord, accompagnement intégré. Pertinentes pour les organisations qui industrialisent leur reporting. En contrepartie : coût récurrent, données hébergées chez un tiers, dépendance au fournisseur.' },
      { type: 'sousTitre', texte: 'Open Carbon Tool' },
      { type: 'p', texte: 'Un outil local-first et open source : vos données restent dans des fichiers sur votre machine, les facteurs d’émission sont sourcés et versionnés, le calcul est transparent. Pensé pour les PME qui veulent un diagnostic sérieux sans abonnement ni transfert de données. Ses limites sont assumées : pas de connecteurs automatiques, pas de certification réglementaire, une base de facteurs volontairement resserrée (~230 facteurs) — pour les cas complexes, un professionnel outillé reste la bonne réponse.' },
      { type: 'encadre', ton: 'info', titre: 'Le bon critère', texte: 'L’outil compte moins que la démarche : périmètre honnête, données tracées, hypothèses écrites, résultats relus. Un excellent outil mal renseigné produit un mauvais bilan.' },
    ],
  },
  {
    id: 'accompagnement',
    titre: 'Se faire accompagner',
    icon: 'group',
    blocs: [
      { type: 'p', texte: 'Un premier bilan gagne presque toujours à être accompagné, au moins ponctuellement. Plusieurs options, cumulables :' },
      { type: 'liste', items: [
        'Cabinet de conseil ou bureau d’études : prise en charge complète, expertise méthodologique, regard extérieur. Choisir un prestataire formé aux méthodes reconnues (Bilan Carbone, GHG Protocol) et exiger la transparence sur les facteurs et hypothèses utilisés.',
        'Consultant indépendant : plus léger et souvent plus adapté au budget d’une PME, avec un accompagnement sur mesure — cadrage, relecture, plan d’action.',
        'Former une personne en interne : les formations aux méthodes (notamment celles de l’Association pour la transition Bas Carbone) permettent d’internaliser la compétence. C’est l’option la plus durable si le bilan doit devenir un exercice récurrent.',
        'Dispositifs publics : l’ADEME, les CCI et certaines régions proposent des diagnostics aidés ou cofinancés pour les PME. Se renseigner avant d’engager des frais.',
      ] },
      { type: 'p', texte: 'Le bon réflexe : garder la propriété de vos données et de votre méthode. Un accompagnement réussi vous rend autonome, il ne crée pas une dépendance.' },
    ],
  },
  {
    id: 'methodologies',
    titre: 'Les méthodologies',
    icon: 'menu_book',
    blocs: [
      { type: 'p', texte: 'Trois référentiels structurent la comptabilité carbone des organisations. Ils sont largement compatibles entre eux :' },
      { type: 'liste', items: [
        'Bilan Carbone® (Association pour la transition Bas Carbone, version 9) : la méthode française de référence. Approche par postes d’émission, orientée plan d’action, avec des exigences de qualité de données.',
        'GHG Protocol Corporate Standard : le standard international. Définit les Scopes 1, 2 et 3 (et les 15 catégories du Scope 3), la distinction location-based / market-based pour l’électricité, et les règles de consolidation.',
        'ISO 14064-1 : la norme internationale de quantification et de déclaration des émissions, utilisée notamment pour la vérification par tierce partie.',
      ] },
      { type: 'p', texte: 'Le BEGES réglementaire français est un format de restitution qui s’appuie sur ces principes. Open Carbon Tool applique une double restitution Bilan Carbone® V9 / GHG Protocol : chaque ligne saisie porte les deux catégorisations, ce qui permet de présenter les résultats dans l’un ou l’autre format.' },
    ],
  },
  {
    id: 'regles',
    titre: 'Les règles de calcul',
    icon: 'calculate',
    blocs: [
      { type: 'p', texte: 'Le principe de base tient en une ligne : émissions = donnée d’activité × facteur d’émission. Une donnée d’activité (litres de gazole, kWh, euros d’achats, tonnes.km de fret) est convertie en kgCO₂e par un facteur d’émission issu d’une base publique sourcée.' },
      { type: 'sousTitre', texte: 'La qualité des données : P3 à P0' },
      { type: 'liste', items: [
        'P3 — mesure directe (compteur, relevé réel) : la meilleure qualité.',
        'P2 — facteur spécifique appliqué à une donnée physique réelle (litres facturés × FE du carburant).',
        'P1 — facteur générique ou donnée estimée (km estimés × FE moyen).',
        'P0 — proxy monétaire (euros dépensés × ratio kgCO₂e/€) : utile pour ne rien oublier, mais très incertain (±80 %).',
      ] },
      { type: 'p', texte: 'La bonne pratique : couvrir tout le périmètre d’abord, même en P0, puis améliorer la précision des postes dominants exercice après exercice.' },
      { type: 'sousTitre', texte: 'Quelques règles importantes' },
      { type: 'liste', items: [
        'Unités explicites : un facteur s’applique à une unité précise (kWh PCI et non PCS, litres et non euros). Les confusions d’unités sont la première source d’erreur.',
        'Amont des combustibles : brûler un litre de gazole émet directement (Scope 1), mais l’extraire, le raffiner et le transporter émet aussi (Scope 3.3). L’outil sépare ces deux composantes et les additionne dans le total.',
        'Électricité : deux lectures coexistent — location-based (intensité moyenne du réseau) et market-based (contrats d’électricité verte). Le GHG Protocol demande de reporter les deux.',
        'CO₂ biogénique : le CO₂ issu de la biomasse (bois, biocarburants) se comptabilise à part, hors total GES, conformément aux référentiels.',
        'Incertitude : chaque facteur porte une incertitude (de ±5 % sur un carburant à ±80 % sur un ratio monétaire). Un total en tCO₂e est un ordre de grandeur, pas une mesure au gramme.',
      ] },
    ],
  },
  {
    id: 'faq',
    titre: 'FAQ — comptabilité carbone',
    icon: 'quiz',
    blocs: [
      { type: 'p', texte: 'Les questions qui reviennent le plus souvent au moment de saisir les données ou de lire les résultats.' },
      { type: 'sousTitre', texte: 'Quelle différence entre Scope 2 location-based et market-based ?' },
      { type: 'p', texte: 'Le location-based mesure vos émissions avec le mix moyen du réseau électrique de votre pays : il reflète la réalité physique du kWh consommé. Le market-based reflète vos choix contractuels : si vous avez souscrit des garanties d\'origine ou une offre verte, c\'est le facteur du contrat qui s\'applique ; sinon, c\'est le mix résiduel du pays. Le GHG Protocol (Scope 2 Guidance) demande de publier les deux chiffres côte à côte — c\'est ce que fait l\'outil.' },
      { type: 'sousTitre', texte: 'Pourquoi mon market-based est-il plus grand que mon location-based ?' },
      { type: 'p', texte: 'Parce que sans contrat d\'électricité verte, vos kWh prennent le facteur du mix résiduel : ce qui reste du mix national une fois retirée la production dont les garanties d\'origine ont été vendues à d\'autres. En France, le mix résiduel 2022 en analyse de cycle de vie vaut environ 130 gCO₂e/kWh (ADEME/AIB), contre 57 gCO₂e/kWh pour le mix moyen : plus du double. C\'est le mécanisme voulu par la méthode — il rend visible la valeur des contrats d\'approvisionnement bas-carbone.' },
      { type: 'sousTitre', texte: 'C\'est quoi le CO₂ biogénique du Scope 1 ?' },
      { type: 'p', texte: 'C\'est le CO₂ émis par la combustion de biomasse : bois-énergie, part biogénique des biocarburants, biogaz. Ce carbone a été absorbé par la plante lors de sa croissance, sur un cycle court : il n\'est pas ajouté au total GES, mais il doit être reporté séparément — c\'est une exigence du GHG Protocol. L\'outil l\'agrège dans une ligne dédiée, hors total.' },
      { type: 'sousTitre', texte: 'Pourquoi les biocarburants sont-ils comptabilisés à (presque) zéro ?' },
      { type: 'p', texte: 'Seul le CO₂ de combustion est compté à zéro dans le total, parce qu\'il est biogénique (voir question précédente). Tout le reste est bien compté : les émissions amont de la filière (culture, transformation, transport — rattachées au Scope 3.3) et les autres gaz de combustion (CH₄, N₂O). Un litre de B100 ou d\'E85 n\'est donc jamais gratuit en carbone : son total est simplement dominé par l\'amont plutôt que par la combustion.' },
      { type: 'sousTitre', texte: 'Pourquoi séparer la combustion et l\'amont d\'un même combustible ?' },
      { type: 'p', texte: 'Brûler un litre de gazole émet au pot d\'échappement (Scope 1), mais l\'extraire, le raffiner et le transporter a déjà émis en amont (Scope 3.3). L\'outil stocke les deux composantes séparément pour respecter les catégories du Bilan Carbone et du GHG Protocol, et les additionne dans le total affiché. Retenez : le chiffre à communiquer est toujours le total combustion + amont.' },
      { type: 'sousTitre', texte: 'Comment éviter le double comptage entre les achats et le reste ?' },
      { type: 'p', texte: 'Le poste Achats de biens et services se définit par soustraction : tout ce qui n\'est pas déjà compté ailleurs avec une méthode plus précise. Avant de saisir vos montants comptables, retirez-en les carburants (déjà dans Véhicules), l\'énergie (Électricité, Chauffage), le transport sous-traité (Fret) et les immobilisations (Biens d\'équipement). Une dépense = un seul poste.' },
      { type: 'sousTitre', texte: 'Je n\'ai pas de facteur d\'émission pour un flux — que faire ?' },
      { type: 'p', texte: 'Ne l\'ignorez pas et n\'inventez pas de valeur. Couvrez d\'abord le flux avec un ratio monétaire (précision P0, ±80 %) pour qu\'il apparaisse dans le bilan, et notez-le comme point à fiabiliser. Pour l\'usage des produits vendus, interrogez votre fédération professionnelle sur le standard sectoriel, ou faites construire un facteur personnalisé par ACV. Un poste couvert grossièrement vaut toujours mieux qu\'un poste omis silencieusement.' },
      { type: 'encadre', ton: 'info', titre: 'Une question absente ?', texte: 'Le guide pratique de chaque poste (dans les vues de collecte) répond aux questions propres au poste : où trouver la donnée, quoi relever, les pièges courants.' },
    ],
  },
  {
    id: 'limites',
    titre: 'Limites et critiques du bilan carbone',
    icon: 'psychology_alt',
    blocs: [
      { type: 'p', texte: 'Le bilan carbone est un outil puissant, à condition de connaître ses limites. Les principales critiques, fondées, méritent d’être connues :' },
      { type: 'liste', items: [
        'Des moyennes, pas votre réalité : la plupart des facteurs d’émission sont des moyennes sectorielles ou nationales. Votre fournisseur peut être bien meilleur — ou bien pire — que la moyenne.',
        'Un Scope 3 très incertain : le poste le plus gros est aussi le moins précis, surtout quand il repose sur des ratios monétaires. Paradoxe assumé : là où il faudrait le plus de finesse, on en a le moins.',
        'Comparabilité limitée : deux entreprises du même secteur peuvent afficher des totaux très différents à cause de choix de périmètre et de méthode. Comparer des bilans sans lire les hypothèses n’a pas de sens.',
        'Mesurer n’est pas réduire : une organisation peut refaire son bilan chaque année sans jamais agir. Le bilan qui ne débouche pas sur un plan de réduction chiffré est un exercice de conformité, pas une démarche climat.',
        'Risque de greenwashing : afficher une « neutralité carbone » obtenue par compensation, ou communiquer sur un bilan partiel (Scopes 1 et 2 seuls), induit le public en erreur. La réglementation européenne encadre d’ailleurs de plus en plus ces allégations.',
        'Le carbone n’est pas tout : biodiversité, eau, ressources, pollutions — le CO₂e ne capture qu’une partie des impacts environnementaux.',
      ] },
      { type: 'encadre', ton: 'info', titre: 'Pourquoi le faire quand même', texte: 'Aucune de ces limites n’invalide l’exercice : un ordre de grandeur honnête suffit à hiérarchiser les actions, et c’est précisément ce qu’on attend d’un bilan. L’erreur serait d’en attendre une précision comptable — ou de ne rien mesurer du tout.' },
    ],
  },
  {
    id: 'strategie',
    titre: 'Du bilan à la stratégie climat',
    icon: 'route',
    blocs: [
      { type: 'p', texte: 'Le bilan est un diagnostic. La stratégie climat, c’est ce qu’on en fait :' },
      { type: 'liste', items: [
        'Une trajectoire : fixer des objectifs de réduction datés et chiffrés, cohérents avec l’Accord de Paris. Des cadres existent pour cela — Science Based Targets (SBTi) au niveau international, la méthode ACT portée par l’ADEME en France.',
        'Un plan de transition : traduire la trajectoire en actions concrètes — sobriété, efficacité énergétique, achats, mobilité, écoconception — avec des responsables, des budgets et des échéances.',
        'Une gouvernance : suivre les indicateurs dans le temps, refaire le bilan à périmètre constant, intégrer le climat dans les décisions d’investissement.',
        'De la transparence : publier les hypothèses avec les résultats, distinguer réductions réelles et compensations, parler de « contribution » à la neutralité mondiale plutôt que de neutralité de l’entreprise.',
      ] },
      { type: 'p', texte: 'L’ordre des priorités est constant : éviter, puis réduire, et seulement ensuite contribuer (financement de projets de séquestration ou de réduction hors de sa chaîne de valeur). La compensation ne remplace jamais la réduction.' },
      { type: 'p', texte: 'Enfin, la démarche climat rejoint le reste de la stratégie d’entreprise : maîtrise des coûts énergétiques, résilience de la chaîne d’approvisionnement, attractivité employeur, accès aux marchés. Un bilan carbone bien utilisé n’est pas une contrainte de reporting — c’est un outil de pilotage.' },
      { type: 'encadre', ton: 'info', titre: 'Et maintenant ?', texte: 'Commencez par la collecte, poste par poste, en vous appuyant sur les guides pratiques. Visez un premier bilan complet plutôt que parfait, identifiez vos deux ou trois postes dominants, et construisez votre premier plan d’action dessus.' },
    ],
  },
  {
    id: 'ressources',
    titre: 'Ressources et guides de référence',
    icon: 'link',
    blocs: [
      { type: 'p', texte: 'Les documents qui font foi. En cas de doute méthodologique, c\'est ici qu\'il faut revenir — pas sur un billet de blog.' },
      { type: 'sousTitre', texte: 'GHG Protocol' },
      { type: 'liens', items: [
        { titre: 'Corporate Accounting and Reporting Standard', description: 'Le standard fondateur : périmètres, scopes 1 et 2, règles de consolidation.', url: 'https://ghgprotocol.org/corporate-standard' },
        { titre: 'Scope 2 Guidance', description: 'La référence location-based / market-based, garanties d\'origine et mix résiduel.', url: 'https://ghgprotocol.org/scope-2-guidance' },
        { titre: 'Corporate Value Chain (Scope 3) Standard', description: 'Les 15 catégories du Scope 3 et leurs frontières.', url: 'https://ghgprotocol.org/standards/scope-3-standard' },
        { titre: 'Scope 3 Technical Calculation Guidance', description: 'Les méthodes de calcul détaillées, catégorie par catégorie.', url: 'https://ghgprotocol.org/scope-3-technical-calculation-guidance' },
      ] },
      { type: 'sousTitre', texte: 'Méthode et facteurs français' },
      { type: 'liens', items: [
        { titre: 'Association Bilan Carbone — méthode BC V9', description: 'La méthode française : guides méthodologiques et formations officielles.', url: 'https://www.associationbilancarbone.fr' },
        { titre: 'Base Empreinte ADEME', description: 'La base de facteurs d\'émission de référence pour la France (versions datées).', url: 'https://base-empreinte.ademe.fr' },
        { titre: 'Impact CO₂ (ADEME)', description: 'Ordres de grandeur pédagogiques pour la sensibilisation (numérique, transport, alimentation).', url: 'https://impactco2.fr' },
      ] },
      { type: 'sousTitre', texte: 'Guides spécialisés' },
      { type: 'liens', items: [
        { titre: 'EPA — Fugitive Emissions Guidance', description: 'Les méthodes de calcul des fluides frigorigènes (screening, achats, bilan matière). Pour une PME, la méthode par les achats suffit.', url: 'https://www.epa.gov/sites/default/files/2020-12/documents/fugitiveemissions.pdf' },
        { titre: 'GLEC Framework (Smart Freight Centre)', description: 'La référence mondiale pour les émissions du transport de marchandises (ISO 14083).', url: 'https://www.smartfreightcentre.org' },
        { titre: 'Mistral AI — ACV d\'un grand modèle de langage', description: 'Première analyse de cycle de vie complète d\'un LLM (avec Carbone 4 et l\'ADEME) : la source du facteur IA de l\'outil.', url: 'https://mistral.ai/fr/news/our-contribution-to-a-global-environmental-standard-for-ai/' },
      ] },
      { type: 'encadre', ton: 'alerte', titre: 'Réflexe de sourcage', texte: 'Chaque facteur d\'émission utilisé dans un livrable doit citer sa source exacte, sa version et sa date. Un chiffre non traçable est un chiffre à refaire.' },
    ],
  },
]

export default documentationSections
