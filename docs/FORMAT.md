# Format `.ocbilan.json`

Le format de fichier est volontairement lisible et autonome. Un fichier représente
un bilan complet ; il peut être sauvegardé, versionné dans Git ou transmis par
l'utilisateur.

```json
{
  "schemaVersion": 1,
  "app": "open-carbon-tool",
  "factorsVersion": "ademe-base-empreinte-23.6",
  "id": "uuid",
  "createdAt": "2026-07-11T12:00:00.000Z",
  "updatedAt": "2026-07-11T12:00:00.000Z",
  "projet": {
    "nom": "Entreprise",
    "annee": "2025",
    "effectif": 12,
    "ca": 250,
    "surface": 450,
    "sites": []
  },
  "lignes": [
    {
      "_key": "uuid",
      "posteId": "combustion_fixe",
      "scope": 1,
      "facteurId": "gaz_nat_kwh",
      "valeur": 85000,
      "precision": "P2",
      "site": null,
      "resultat": {}
    }
  ],
  "sectionsStatus": {
    "combustion_fixe": "confirmed"
  },
  "sectionsAssignees": {
    "achats": "Marie (comptabilité)"
  }
}
```

## Garanties de lecture

- `app` permet de refuser les fichiers d'une autre application ;
- une version de schéma supérieure à la version supportée est refusée, afin de ne
  pas écraser silencieusement des champs inconnus ;
- `effectif`, `ca` et `surface` sont normalisés en nombres à la lecture ;
- chaque écriture passe par un fichier temporaire dans le même dossier, puis un
  renommage atomique ;
- les fichiers temporaires orphelins sont nettoyés au démarrage ;
- un fichier illisible reste visible dans la bibliothèque et peut être révélé dans
  le Finder ou l'explorateur.

Les fichiers supprimés sont déplacés vers `.corbeille/` avec un préfixe temporel.
Ils ne sont jamais supprimés directement par l'application.

## Facteurs personnalisés

Les facteurs personnalisés sont regroupés dans `facteurs-custom.json` à la racine
du dossier de travail. Ils ne sont pas recopiés dans chaque bilan ; les lignes
conservent leur `facteurId`. Le fichier est une enveloppe partagée par tous les
bilans du dossier :

```json
{
  "schemaVersion": 1,
  "app": "open-carbon-tool",
  "factorsVersion": "ademe-base-empreinte-23.6",
  "updatedAt": "2026-07-13T00:00:00.000Z",
  "facteurs": [
    {
      "id": "facteur-custom-id",
      "nom": "Facteur fournisseur",
      "unite": "kg",
      "valeur": 1.23,
      "archived": false
    }
  ],
  "archivedCatalogIds": []
}
```

`archived` vaut `false` lorsqu'il est absent dans un ancien fichier. Archiver
un facteur personnalisé bascule cet état sans supprimer l'objet. Les facteurs
du catalogue embarqué restent inchangés : leurs identifiants archivés sont
conservés dans `archivedCatalogIds`, également réversible.
