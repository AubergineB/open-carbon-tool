# Publier une release

Une release part d'un tag `v*` poussé sur `main` :

```bash
git tag v0.3.0
git push origin v0.3.0
```

`.github/workflows/release.yml` construit alors les bundles macOS (arm64 et
x64), Windows et Linux, puis crée la release GitHub.

## Artefacts publiés

| Système | Fichier | Droits administrateur |
|---|---|---|
| macOS | `.dmg` (arm64 et x64) | non |
| Windows | `.exe` (NSIS, installation dans le profil utilisateur) | non |
| Linux | `.AppImage` et `.deb` | selon la distribution |

Le MSI n'est plus publié : il exige les droits administrateur, dont l'utilisateur
en PME ne dispose généralement pas, ce qu'aucune documentation ne peut contourner.

## Signature macOS et notarisation

Sans certificat, les bundles sont signés **ad hoc** et Gatekeeper les bloque au
premier lancement. Aucun contournement n'est durable : Apple a supprimé le
Ctrl-clic dans macOS 15 et resserre cette soupape à chaque version majeure. La
seule procédure d'installation qui tienne dans le temps est **l'absence de
procédure** : une app notarisée s'ouvre au double-clic.

### Prérequis

1. Adhérer à l'[Apple Developer Program](https://developer.apple.com/programs/)
   (99 $/an).
2. Dans Xcode ou sur le portail développeur, créer un certificat
   **Developer ID Application** (celui-ci, pas « Apple Distribution », qui ne
   sert qu'à l'App Store).
3. L'exporter au format `.p12` avec un mot de passe.
4. Créer un **mot de passe d'application** sur
   [appleid.apple.com](https://appleid.apple.com) (section Sécurité). Ce n'est
   pas le mot de passe du compte Apple.

### Secrets GitHub à configurer

Dépôt › Settings › Secrets and variables › Actions.

| Secret | Contenu |
|---|---|
| `APPLE_CERTIFICATE` | le `.p12` encodé en base64 : `base64 -i certificat.p12 \| pbcopy` |
| `APPLE_CERTIFICATE_PASSWORD` | le mot de passe choisi à l'export du `.p12` |
| `APPLE_SIGNING_IDENTITY` | l'identité complète, ex. `Developer ID Application: Henri Ducasse (TEAMID)` |
| `APPLE_ID` | l'adresse email du compte développeur Apple |
| `APPLE_PASSWORD` | le mot de passe d'application créé ci-dessus |
| `APPLE_TEAM_ID` | l'identifiant d'équipe, visible sur le portail développeur |

Le workflow lit ces secrets et n'exige aucune modification : tant qu'ils sont
absents, `APPLE_SIGNING_IDENTITY` retombe sur `-` (signature ad hoc) et les
variables vides sont ignorées. Dès qu'ils existent, la CI signe et notarise.

### Vérifier qu'une release est bien notarisée

Sur le `.dmg` téléchargé, puis sur l'app installée :

```bash
spctl -a -vv "/Applications/Open Carbon Tool.app"
```

La réponse attendue est `accepted` avec `source=Notarized Developer ID`. Tant
qu'elle affiche `rejected`, la notarisation n'a pas pris.

Une fois la première release notarisée publiée, simplifier `INSTALL.md` : la
section macOS se réduit à « glissez dans Applications, double-cliquez », et tout
le contournement Gatekeeper disparaît.

## Signature Windows

Non mise en place. SmartScreen affiche un avertissement, mais son contournement
(« Informations complémentaires » puis « Exécuter quand même ») est stable et
fonctionne systématiquement — c'est inesthétique, jamais bloquant.

Deux options le jour où cela devient gênant :

- **Azure Trusted Signing**, environ 10 $/mois, mais réservé aux entités
  juridiques justifiant de trois ans d'ancienneté ;
- **certificat EV**, 400 à 600 €/an avec jeton matériel, qui donne la confiance
  SmartScreen immédiatement.
