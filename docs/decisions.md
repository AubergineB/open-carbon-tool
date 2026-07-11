# Décisions techniques

## 2026-07-11 — Local-first

Le dossier de travail remplace l'entreprise distante comme frontière de données.
Les bilans, les lignes, les statuts, les assignations et les facteurs personnalisés
sont stockés localement.

## 2026-07-11 — Écritures atomiques

Chaque fichier est écrit dans un `.tmp` situé dans le même dossier, puis renommé.
Les écritures sont sérialisées par chemin pour éviter qu'un auto-save concurrent
ne remplace un fichier par un état incomplet.

## 2026-07-11 — Assignation

Les assignations sont des chaînes libres. Il n'existe plus de répertoire de membres
ni d'envoi d'email ; l'interface propose une auto-complétion à partir des noms déjà
utilisés.

