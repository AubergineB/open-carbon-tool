# Installation

## Quel fichier télécharger ?

| Votre machine | Fichier |
|---|---|
| Mac Apple Silicon (M1 et suivants, depuis fin 2020) | `Open.Carbon.Tool_x.y.z_aarch64.dmg` |
| Mac Intel | `Open.Carbon.Tool_x.y.z_x64.dmg` |
| Windows | `Open.Carbon.Tool_x.y.z_x64-setup.exe` |
| Linux (Debian, Ubuntu) | `Open.Carbon.Tool_x.y.z_amd64.deb` |
| Linux (autres distributions) | `Open.Carbon.Tool_x.y.z_amd64.AppImage` |

Les fichiers `.app.tar.gz` ne servent pas à l'installation, ignorez-les.

Sur Mac, en cas de doute : menu Pomme → À propos de ce Mac. La ligne « Puce »
indique Apple M1/M2/M3/M4 (prenez `aarch64`) ou Intel (prenez `x64`).

## macOS

Depuis la version 0.3.0, l'application est signée avec un certificat Apple
Developer ID et notarisée par Apple. Il n'y a aucune manipulation à faire.

1. Téléchargez le `.dmg` correspondant à votre Mac — `aarch64` pour les Mac
   Apple Silicon (M1 et suivants), `x64` pour les Mac Intel.
2. Ouvrez-le, puis glissez `Open Carbon Tool` dans `Applications`.
3. Double-cliquez sur l'application.

Aucun avertissement Gatekeeper, aucun passage par les Réglages Système. Le
ticket de notarisation est agrafé au bundle : la vérification fonctionne même
hors connexion.

Les versions 0.2.0 et antérieures n'étaient pas notarisées et exigeaient un
contournement manuel. Téléchargez la dernière version plutôt que de contourner.

## Windows

1. Téléchargez le `.exe`.
2. Lancez l'installateur. Il s'installe dans votre profil utilisateur et ne
   demande **pas** de droits administrateur.
3. Si SmartScreen apparaît (« Windows a protégé votre ordinateur »), cliquez sur
   **Informations complémentaires** — le lien est discret, sous le message — puis
   sur **Exécuter quand même**.

L'absence de certificat de signature Windows explique cet avertissement ; elle
ne signifie pas que les données sont envoyées à un serveur. Contrairement à
macOS, la partie Windows n'est pas encore signée.

## Linux

Le paquet `.deb` convient aux distributions Debian/Ubuntu. L'AppImage peut être
rendue exécutable puis lancée directement :

```bash
chmod +x Open-Carbon-Tool.AppImage
./Open-Carbon-Tool.AppImage
```

