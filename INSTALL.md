# Installation

Les bundles ne sont signés par aucun certificat Apple ou Microsoft et ne sont
pas notarisés. L'application est seulement signée ad hoc sur macOS dans la CI.
Les avertissements décrits ci-dessous en découlent : ils signalent l'absence de
certificat, pas la détection d'un contenu malveillant.

## macOS

1. Téléchargez le `.dmg` correspondant à votre Mac.
2. Ouvrez-le puis glissez `Open Carbon Tool` dans `Applications`.
3. Lancez l'application une première fois. macOS affiche « Apple n'a pas pu
   confirmer que "Open Carbon Tool" ne contenait pas de logiciel malveillant ».
   Cliquez sur **Terminé** — surtout pas sur « Placer dans la corbeille ».
4. Ouvrez **Réglages Système › Confidentialité et sécurité**, faites défiler
   jusqu'à la section Sécurité : la mention « "Open Carbon Tool" a été bloqué »
   y apparaît, avec un bouton **Ouvrir quand même**. Cliquez dessus et
   authentifiez-vous.
5. Relancez l'application, puis confirmez une dernière fois **Ouvrir quand
   même**.

Sur macOS 15 (Sequoia) et versions ultérieures, le Ctrl-clic suivi de
**Ouvrir** ne contourne plus Gatekeeper : Apple a retiré ce raccourci. Il faut
passer par les Réglages Système.

Autre méthode, équivalente et plus rapide, si vous êtes à l'aise avec le
Terminal :

```bash
xattr -dr com.apple.quarantine "/Applications/Open Carbon Tool.app"
```

Cette commande ne télécharge rien et n'installe rien : elle retire uniquement
l'attribut de quarantaine posé par le navigateur au téléchargement. Elle résout
aussi le message « application endommagée ».

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

