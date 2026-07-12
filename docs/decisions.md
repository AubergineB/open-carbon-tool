# Décisions techniques

## 2026-07-11 — Local-first

Le dossier de travail remplace l'entreprise distante comme frontière de données.
Les bilans, les lignes, les statuts, les assignations et les facteurs personnalisés
sont stockés localement.

## 2026-07-11 — Écritures atomiques

Chaque fichier est écrit dans un `.tmp` situé dans le même dossier, puis renommé.
Les écritures sont sérialisées par chemin pour éviter qu'un auto-save concurrent
ne remplace un fichier par un état incomplet.

## 2026-07-12 — Espace de travail : calculatrice autonome

Les convertisseurs (masse/volume carburants, PCS/PCI, estimation t.km) affichent
un résultat à copier mais n'écrivent jamais dans les lignes de collecte.
Zéro couplage avec l'état central ; une injection directe reste possible en v2.

## 2026-07-12 — Estimation t.km par inversion des FE ADEME

t.km estimés = (montant € × FE monétaire fret ADEME/SDES) ÷ FE physique t.km du
mode choisi. N'introduit aucune nouvelle source (l'alternative — prix de
référence €/t.km type CNR — aurait exigé de valider une source hors liste).
Résultat flaggé P0, ordre de grandeur ; avertissement explicite pour
l'aérien/maritime, le ratio monétaire couvrant les transports terrestres.

## 2026-07-12 — Constantes de conversion sourcées, validation bloquante

Les masses volumiques et ratios PCS/PCI de l'espace de travail sont figés dans
`conversionConstants.js` avec source par entrée. Les valeurs proposées dans le
lot 08 sont des valeurs usuelles ADEME/DGEC : leur vérification ligne à ligne
contre la documentation Base Empreinte v23.6 est une checklist manuelle
bloquante avant merge. Propane et butane sont recoupés avec les paires de FE
kg/L déjà présentes dans l'app.

## 2026-07-12 — Documentation pédagogique embarquée dans l'app

La vue Documentation vit dans l'app (cohérent local-first, hors-ligne), pas sur
le site web. Le contenu est rédigé et validé dans le lot 11 et collé tel quel
par l'agent d'implémentation ; le site (lot 05) pourra le réutiliser.

## 2026-07-11 — Assignation

Les assignations sont des chaînes libres. Il n'existe plus de répertoire de membres
ni d'envoi d'email ; l'interface propose une auto-complétion à partir des noms déjà
utilisés.

