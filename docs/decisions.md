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

## 2026-07-13 — Scope 2 : double restitution et mix résiduel imposé

Conformité GHG Protocol Scope 2 Guidance : chaque ligne d'électricité apparaît
dans les deux colonnes (LB = mix moyen du réseau ; MB = facteur contractuel si
contrat, sinon mix résiduel imposé automatiquement). Le FE mix résiduel France
retenu est le mix résiduel français 2022 en ACV, hors pertes en ligne :
0,13005 kgCO₂e/kWh (130,05 gCO₂e/kWh), source ADEME / AIB — Residual Mix
Results France 2022 ; validation Henri effectuée (checklist lot 12 fermée).
L'ancien FE « Offre verte sans GO »
(0.0569, étiqueté à tort FE résiduel) est corrigé. À défaut de mix résiduel
publié (autres pays, réseaux de chaleur, monétaire, FE custom), le mix moyen
sert de proxy MB — règle documentée dans le moteur.

## 2026-07-13 — Facteur IA générative (ACV Mistral)

Ajout d'un FE « Requête IA générative » : 1,14 gCO₂e par réponse de 400 tokens,
issu de l'ACV de Mistral Large 2 (Mistral AI / Carbone 4 / ADEME, juillet 2025,
ISO 14040/44). Source hors liste standard validée explicitement par Henri —
c'est aujourd'hui la seule ACV complète publiée d'un LLM.

## 2026-07-13 — Réfrigération : méthode par les achats seule recommandée

Pour une PME, la quantité de fluide rechargée (attestations du frigoriste) est
LA méthode de calcul des émissions fugitives. Les méthodes plus sophistiquées
(screening par équipement, bilan matière — cf. guide EPA lié dans la fiche)
sont jugées contre-productives à cette échelle. Le guide du poste le dit
explicitement.

## 2026-07-13 — Densités déchets : sources documentées (lot 15 fermé)

Le convertisseur volume→masse déchets (lot 15) embarque 9 masses volumiques
usuelles avec champ `source` par entrée dans `densitesDechets`
(`conversionConstants.js`). Validation Henri déléguée à sources documentées
(ADEME fiche déchets GES, Citeo, Elipso, guides BTP/collectivités) —
checklist lot 15 fermée le 2026-07-13. L'UI les présente comme ordres de
grandeur et renvoie aux pesées des bordereaux prestataire.

## 2026-07-11 — Assignation

Les assignations sont des chaînes libres. Il n'existe plus de répertoire de membres
ni d'envoi d'email ; l'interface propose une auto-complétion à partir des noms déjà
utilisés.


## 2026-07-14 — Dépendance xlsx : tarball officiel SheetJS

SheetJS ne publie plus sur npm : la version npm `xlsx@0.18.5` reste figée avec
deux vulnérabilités connues (prototype pollution, ReDoS) sans correctif.
La dépendance pointe désormais vers le tarball officiel
`https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz` (API identique,
vulnérabilités corrigées). Les mises à jour futures se font en changeant
l'URL de version dans package.json, pas via `npm update`.
