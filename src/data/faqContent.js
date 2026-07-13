// Contenu de la FAQ — contenu méthodologique validé.

export const faqIntro = {
  type: 'p',
  texte: 'Les questions qui reviennent le plus souvent au moment de saisir les données ou de lire les résultats.',
}

export const faqItems = [
  {
    id: 'scope-2-lb-mb',
    question: 'Quelle différence entre Scope 2 location-based et market-based ?',
    blocs: [
      { type: 'p', texte: 'Le location-based mesure vos émissions avec le mix moyen du réseau électrique de votre pays : il reflète la réalité physique du kWh consommé. Le market-based reflète vos choix contractuels : si vous avez souscrit des garanties d\'origine ou une offre verte, c\'est le facteur du contrat qui s\'applique ; sinon, c\'est le mix résiduel du pays. Le GHG Protocol (Scope 2 Guidance) demande de publier les deux chiffres côte à côte — c\'est ce que fait l\'outil.' },
    ],
  },
  {
    id: 'market-based-plus-eleve',
    question: 'Pourquoi mon market-based est-il plus grand que mon location-based ?',
    blocs: [
      { type: 'p', texte: 'Parce que sans contrat d\'électricité verte, vos kWh prennent le facteur du mix résiduel : ce qui reste du mix national une fois retirée la production dont les garanties d\'origine ont été vendues à d\'autres. En France, le mix résiduel 2022 en analyse de cycle de vie vaut environ 130 gCO₂e/kWh (ADEME/AIB), contre 57 gCO₂e/kWh pour le mix moyen : plus du double. C\'est le mécanisme voulu par la méthode — il rend visible la valeur des contrats d\'approvisionnement bas-carbone.' },
    ],
  },
  {
    id: 'co2-biogenique',
    question: 'C\'est quoi le CO₂ biogénique du Scope 1 ?',
    blocs: [
      { type: 'p', texte: 'C\'est le CO₂ émis par la combustion de biomasse : bois-énergie, part biogénique des biocarburants, biogaz. Ce carbone a été absorbé par la plante lors de sa croissance, sur un cycle court : il n\'est pas ajouté au total GES, mais il doit être reporté séparément — c\'est une exigence du GHG Protocol. L\'outil l\'agrège dans une ligne dédiée, hors total.' },
    ],
  },
  {
    id: 'biocarburants',
    question: 'Pourquoi les biocarburants sont-ils comptabilisés à (presque) zéro ?',
    blocs: [
      { type: 'p', texte: 'Seul le CO₂ de combustion est compté à zéro dans le total, parce qu\'il est biogénique (voir question précédente). Tout le reste est bien compté : les émissions amont de la filière (culture, transformation, transport — rattachées au Scope 3.3) et les autres gaz de combustion (CH₄, N₂O). Un litre de B100 ou d\'E85 n\'est donc jamais gratuit en carbone : son total est simplement dominé par l\'amont plutôt que par la combustion.' },
    ],
  },
  {
    id: 'combustion-amont',
    question: 'Pourquoi séparer la combustion et l\'amont d\'un même combustible ?',
    blocs: [
      { type: 'p', texte: 'Brûler un litre de gazole émet au pot d\'échappement (Scope 1), mais l\'extraire, le raffiner et le transporter a déjà émis en amont (Scope 3.3). L\'outil stocke les deux composantes séparément pour respecter les catégories du Bilan Carbone et du GHG Protocol, et les additionne dans le total affiché. Retenez : le chiffre à communiquer est toujours le total combustion + amont.' },
    ],
  },
  {
    id: 'double-comptage',
    question: 'Comment éviter le double comptage entre les achats et le reste ?',
    blocs: [
      { type: 'p', texte: 'Le poste Achats de biens et services se définit par soustraction : tout ce qui n\'est pas déjà compté ailleurs avec une méthode plus précise. Avant de saisir vos montants comptables, retirez-en les carburants (déjà dans Véhicules), l\'énergie (Électricité, Chauffage), le transport sous-traité (Fret) et les immobilisations (Biens d\'équipement). Une dépense = un seul poste.' },
    ],
  },
  {
    id: 'facteur-absent',
    question: 'Je n\'ai pas de facteur d\'émission pour un flux — que faire ?',
    blocs: [
      { type: 'p', texte: 'Ne l\'ignorez pas et n\'inventez pas de valeur. Couvrez d\'abord le flux avec un ratio monétaire (précision P0, ±80 %) pour qu\'il apparaisse dans le bilan, et notez-le comme point à fiabiliser. Pour l\'usage des produits vendus, interrogez votre fédération professionnelle sur le standard sectoriel, ou faites construire un facteur personnalisé par ACV. Un poste couvert grossièrement vaut toujours mieux qu\'un poste omis silencieusement.' },
    ],
  },
]

export const faqOutro = {
  type: 'encadre',
  ton: 'info',
  titre: 'Une question absente ?',
  texte: 'Le guide pratique de chaque poste (dans les vues de collecte) répond aux questions propres au poste : où trouver la donnée, quoi relever, les pièges courants.',
}

export default faqItems
