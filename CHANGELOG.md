# Changelog

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [Unreleased]

## [0.3.1] — 2026-07-15

### Rapport PDF

- Rendu entièrement repris selon la charte graphique : page de garde sombre,
  synthèse avec cartes par scope, barre de répartition et top 5 des postes,
  nouvelle page de répartition par catégorie, double restitution Scope 2 et
  CO₂ biogénique dans les résultats détaillés.
- Le tableau détaillé affiche le total par ligne (combustion + amont), cohérent
  avec le total agrégé ; les colonnes s'additionnent désormais.
- Caractères réparés : l'indice de tCO₂e et les espaces insécables des nombres
  français sortaient en glyphes cassés avec les polices PDF standard.

### Corrections

- Les facteurs d'émission personnalisés sont propagés à la double restitution
  Scope 2 (Location-Based / Market-Based).
- Confirmations et fermeture de fenêtre fiabilisées via les dialogues natifs.
- Mentions légales alignées sur la licence MIT.

### Distribution

- macOS : le `.dmg` lui-même est notarisé et agrafé, plus seulement l'app.
- Dépendances vulnérables mises à jour (xlsx, dompurify).

## [0.3.0] — 2026-07-13

### Méthodologie

- Scope 2 en double restitution : chaque ligne d'électricité apparaît désormais
  dans les deux colonnes Location-Based et Market-Based, le mix résiduel étant
  appliqué automatiquement en l'absence de contrat.
- Correction du facteur « mix résiduel France », qui portait par erreur la
  valeur du mix moyen location-based.
- Fiches guides des postes réfrigération, achats, usage des produits vendus et
  numérique mises à niveau ; nouveau facteur « requête IA générative » (ACV
  Mistral Large 2).
- Phrases de matérialité sectorielle réécrites poste par poste.

### Fonctionnalités

- Collecte assistée par LLM, sans réseau ni clé API : export d'un gabarit JSON
  auto-documenté, remplissage hors de l'application, réimport dans une file de
  revue, validation humaine ligne par ligne, recalcul avec les facteurs connus.
- Archivage réversible des facteurs, personnalisés comme catalogue : un facteur
  retiré des listes de saisie ne détruit plus l'historique, les lignes déjà
  calculées restant lisibles grâce au snapshot conservé dans le fichier.
- Vue FAQ dédiée, séparée de la Documentation.
- Espace de travail : convertisseurs d'énergie et de déchets, en plus de
  masse/volume, PCS/PCI et t.km.
- Documentation embarquée : FAQ de comptabilité carbone et ressources externes.
- Fermeture propre de la fenêtre macOS après sauvegarde, raccourcis de zoom
  natifs, formatage des nombres uniformisé en français.

### Distribution

- macOS : les bundles sont signés Developer ID et notarisés. L'application
  s'ouvre au double-clic, sans avertissement Gatekeeper ni manipulation.
- Windows : le MSI n'est plus publié. Il exigeait les droits administrateur, dont
  un salarié de PME ne dispose généralement pas. L'installeur `.exe` s'installe
  dans le profil utilisateur, sans admin.
- Instructions d'installation corrigées : depuis macOS 15, le Ctrl-clic ne
  contourne plus Gatekeeper.

### Corrections

- Export PDF réparé (imports ESM de jspdf-autotable v5).

## [0.2.0] — 2026-07-11

- Identité produit Open Carbon Tool : nouveau logo, icônes d'application,
  favicon (le logo Mobility Transition Lab reste en signature).
- Hygiène open source : licence MIT, README avec captures d'écran,
  CONTRIBUTING, templates d'issues et de pull request.
- Première release publique avec installeurs macOS, Windows et Linux.
- Correction : écriture disque fiabilisée côté Tauri.

## [0.1.0]

- Migration vers Open Carbon Tool, application desktop Tauri v2 local-first.
- 17 postes d'émission et environ 230 facteurs d'émission (ADEME Base
  Empreinte).
- Double restitution Bilan Carbone® V9 et GHG Protocol Corporate Standard.
- Exports PDF et Excel.
- Suivi multi-sites et multi-années.
