# Installation

Les bundles de portfolio ne sont pas signés par un certificat commercial.
L'application est néanmoins signée ad hoc sur macOS dans la CI.

## macOS

1. Téléchargez le `.dmg` correspondant à votre Mac.
2. Ouvrez-le puis glissez `Open Carbon Tool` dans `Applications`.
3. Au premier lancement, faites Ctrl-clic sur l'application et choisissez
   **Ouvrir**.
4. Confirmez **Ouvrir** dans le dialogue Gatekeeper.

Si macOS affiche « application endommagée », ouvrez Terminal et exécutez :

```bash
xattr -dr com.apple.quarantine "/Applications/Open Carbon Tool.app"
```

Cette commande ne télécharge rien et retire uniquement l'attribut de quarantaine
ajouté au téléchargement.

## Windows

1. Téléchargez le `.msi`.
2. Lancez l'installateur.
3. Si SmartScreen apparaît, cliquez sur **Informations complémentaires**, puis
   **Exécuter quand même**.

L'absence de certificat EV explique cet avertissement ; elle ne signifie pas que
les données sont envoyées à un serveur.

## Linux

Le paquet `.deb` convient aux distributions Debian/Ubuntu. L'AppImage peut être
rendue exécutable puis lancée directement :

```bash
chmod +x Open-Carbon-Tool.AppImage
./Open-Carbon-Tool.AppImage
```

