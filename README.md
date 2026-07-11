<p align="center">
  <img src="docs/assets/logo.svg" alt="Open Carbon Tool" width="120" />
</p>

<h1 align="center">Open Carbon Tool</h1>

<p align="center">
  Application desktop local-first de bilan carbone, éditée par Mobility Transition Lab.
</p>

<p align="center">
  <a href="https://github.com/AubergineB/open-carbon-tool/actions/workflows/build.yml"><img src="https://img.shields.io/github/actions/workflow/status/AubergineB/open-carbon-tool/build.yml?branch=main" alt="Build" /></a>
  <a href="https://github.com/AubergineB/open-carbon-tool/releases/latest"><img src="https://img.shields.io/github/v/release/AubergineB/open-carbon-tool" alt="Dernière release" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/licence-MIT-blue" alt="Licence MIT" /></a>
  <img src="https://img.shields.io/badge/plateformes-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey" alt="Plateformes macOS, Windows, Linux" />
</p>

Elle aide les PME à structurer un bilan carbone selon le Bilan Carbone® V9 et le GHG Protocol Corporate Standard.

Vos données comptables, RH et opérationnelles restent dans des fichiers JSON sur votre ordinateur. Aucun compte, serveur ou transfert de données n'est nécessaire.

## Capture d'écran

<p align="center">
  <img src="docs/assets/screenshot-resultats.png" alt="Vue Résultats" width="45%" />
  <img src="docs/assets/screenshot-collecte.png" alt="Vue Collecte" width="45%" />
</p>

## Installer

Téléchargez la dernière version depuis la page
[releases](https://github.com/AubergineB/open-carbon-tool/releases/latest).

| Système | Fichier |
|---|---|
| macOS (Apple Silicon) | `.dmg` (arm64) |
| macOS (Intel) | `.dmg` (x64) |
| Windows | `.msi` ou `.exe` |
| Linux | `.AppImage` ou `.deb` |

Les bundles ne sont pas signés par un certificat commercial. Consultez
[INSTALL.md](INSTALL.md) pour contourner Gatekeeper (macOS) et SmartScreen
(Windows).

## Fonctionnalités

- 17 postes d'émission et environ 230 facteurs d'émission intégrés ;
- double restitution Bilan Carbone® / GHG Protocol ;
- Scopes 1, 2 Location-Based / Market-Based et 3 ;
- CO₂ biogénique séparé du total GES ;
- niveaux de précision P0 à P3 et contrôles de cohérence ;
- multi-sites, multi-années, suivi de l'intensité CA/effectif ;
- assignation en texte libre et plan d'action ;
- exports PDF, Excel et JSON ;
- fichiers lisibles, diffables et archivables dans un espace partagé.

## Méthodologie et facteurs

Le moteur sépare les émissions directes, les émissions amont Scope 3.3 et le CO₂ biogénique. La version déclarée est `ademe-base-empreinte-23.6`.

## Format ouvert

Chaque bilan est enregistré sous la forme `<slug>-<annee>.ocbilan.json`. Le format est documenté dans [docs/FORMAT.md](docs/FORMAT.md).

## Pourquoi local-first ?

Les données restent sur la machine du consultant ou du client. Le dossier peut être placé dans un espace partagé pour collaborer, sans créer de compte ni transmettre les données à un tiers.

## Limites assumées

Open Carbon Tool est un outil de diagnostic et d'aide à la décision. Il ne constitue ni un bilan certifié par l'Association Bilan Carbone, ni un BEGES réglementaire, ni un audit externe.

Les bundles sont distribués sans certificat commercial. Consultez [INSTALL.md](INSTALL.md) pour Gatekeeper et SmartScreen.

## Développement

```bash
npm install
npm run dev
```

Pour lancer la fenêtre native Tauri : `npm run tauri:dev`.

| Commande | Effet |
|---|---|
| `npm run dev` | serveur de développement Vite |
| `npm run build` | build production dans `dist/` |
| `npm run preview` | preview du build production |
| `npm run lint` | ESLint |
| `npm run test` | tests Vitest du moteur métier |
| `npm run tauri:dev` | fenêtre desktop Tauri |
| `npm run tauri:build` | bundles desktop (dmg/msi/AppImage/deb) |

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les modalités de contribution.

## Licence

MIT — Mobility Transition Lab. Voir [LICENSE](LICENSE).
