# Contribuer

## Prérequis

- Node 24
- Rust stable (via [rustup](https://rustup.rs))

## Installation

```bash
npm install
npm run tauri:dev
```

## Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | serveur de développement Vite |
| `npm run lint` | ESLint |
| `npm run test` | tests Vitest du moteur métier |
| `npm run tauri:build` | bundles desktop |

## Convention de commits

Messages en français, préfixés :

- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `docs:` documentation uniquement

## Règle d'or méthodo

Toute contribution touchant un facteur d'émission doit citer sa source ADEME
(Base Empreinte, version exacte) et sera revue manuellement. Aucun facteur
n'est fusionné sans cette citation.

## CI

Chaque pull request déclenche `build.yml` : tests, lint et build sur macOS,
Windows et Linux.
