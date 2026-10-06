# Red File Editor — sources organisées

Le plugin reste une vue `ItemView`. Le code est maintenant réparti dans
`src/`, et esbuild produit le `main.js` utilisé par Obsidian.

## Installer la version déjà construite

1. Fermer Obsidian et faire une copie du dossier actuel du plugin.
2. Dans le coffre, ouvrir `.obsidian/plugins/red-file-editor/`.
3. Copier les trois fichiers de la racine de ce projet dans ce dossier :
   `main.js`, `manifest.json` et `styles.css`.
4. Conserver le `data.json` déjà présent : il contient les réglages actuels.
   La copie fournie dans cette archive correspond aux réglages joints à la
   demande ; l'utiliser seulement si ces réglages sont ceux souhaités.
5. Relancer Obsidian et activer Red File Editor si nécessaire.

**Aucune compilation nécessaire pour cette installation.** Le `main.js`
à la racine est déjà généré et contient les modules. Il n'a pas besoin du
répertoire `src/` ni de `node_modules/` pour fonctionner dans Obsidian.

## Modifier le plugin dans VSCodium

Ouvrir le dossier complet `red-file-editor/` dans VSCodium.
Installer Node.js 18 ou plus récent avec npm, puis ouvrir un terminal dans ce dossier.

Première préparation :

```bash
npm ci
```

Après une modification des fichiers de `src/` :

```bash
npm run build
npm run check
```

`build` reconstruit le `main.js` de la racine. `check` vérifie la syntaxe du
code source, du fichier généré et des scripts.
Copier ensuite le nouveau `main.js` dans le dossier du plugin et recharger
le plugin dans Obsidian. Si le projet se trouve directement dans ce dossier,
le fichier est déjà au bon endroit.

Pour reconstruire automatiquement pendant les modifications :

```bash
npm run dev
```

Cette commande reste active et surveille `src/`. Arrêter avec `Ctrl+C`.
Les changements de code nécessitent toujours de recharger le plugin dans
Obsidian. `styles.css` et les fichiers JSON restent des fichiers séparés.
Après le développement, `npm run build` recrée la version finale sans carte
source intégrée.

**Modifier les sources dans `src/`, pas le `main.js` généré**, car la prochaine
compilation remplace ce dernier.

## Où trouver chaque partie

| Fichier | Contenu |
| --- | --- |
| `src/main.js` | Initialisation, commandes, menus, paramètres et nettoyage du plugin |
| `src/constants.js` | Identifiant de la vue et extensions par défaut |
| `src/views/DevFileView.js` | Interface de l'éditeur, chargement, sauvegarde et raccourcis |
| `src/editor/fileTypes.js` | Détection des dotfiles et noms des langages |
| `src/editor/highlight.js` | Construction du HTML coloré et échappement du texte |
| `src/editor/patterns.js` | Expressions régulières de coloration par langage |
| `src/modals/CreateFileModal.js` | Fenêtre de création d'un fichier |
| `src/modals/ChangeExtensionModal.js` | Fenêtre de changement d'extension |
| `src/settings/DevFileEditorSettingTab.js` | Interface des réglages |
| `src/workspace/openFiles.js` | Ouverture des fichiers, activation des onglets et interception des clics |
| `src/explorer/badges.js` | Étiquettes de type dans l'explorateur |
| `src/explorer/dotfiles.js` | Affichage des fichiers masqués dans l'explorateur |
| `src/workspace/envCompanion.js` | Gestion du panneau `.env` compagnon des fichiers YAML |
| `src/files/operations.js` | Création, renommage, extensions et retrait du suffixe `.md` |
| `esbuild.config.mjs` | Compilation des sources en un seul `main.js` |
| `package.json` | Commandes npm et dépendance esbuild |
| `package-lock.json` | Versions exactes des dépendances pour `npm ci` |
| `scripts/check.mjs` | Vérification de syntaxe |
| `tests/startup.test.cjs` | Tests de régression du démarrage et des onglets |
| `tests/fileCreation.test.cjs` | Tests de création de fichier et gestion d'extensions |
| `tests/envCompanion.test.cjs` | Tests du panneau `.env` compagnon et de sa fermeture |
| `main.js` | Plugin généré, prêt à copier dans Obsidian |
| `manifest.json` | Identité et métadonnées du plugin, inchangées |
| `styles.css` | Styles de l'éditeur, des indicateurs et des réglages |
| `data.json` | Copie des réglages fournis, inchangée |

Les modules `openFiles`, `badges`, `dotfiles` et `operations` exportent des
groupes de méthodes. `src/main.js` les rattache au prototype du plugin avec
`Object.assign`. Cela conserve leurs noms et le même `this` : les appels
existants entre méthodes restent valables. Les autres modules exportent
leurs classes ou fonctions avec `module.exports`.

## Corrections et améliorations fonctionnelles

### 1. Panneau .env compagnon (YAML)
- **Fermeture manuelle respectée** : fermer le panneau `.env` (clic sur la croix `X` de l'onglet) enregistre l'intention de l'utilisateur. Le `.env` ne réapparaît plus en boucle ni ne clignote tant que l'on reste sur le même fichier YAML.
- **Interception des clics résolue** : cliquer, taper ou sélectionner du texte dans l'éditeur YAML n'ouvre plus de panneau `.env` en boucle.
- **Option dans les paramètres** : activation / désactivation via une bascule dédiée dans l'onglet des réglages (*Ouvrir automatiquement le fichier .env*).

### 2. Gestion des extensions de fichiers
- **Gestionnaire visuel dans les réglages** : affichage de chaque extension sous forme d'étiquette (badge) avec bouton de suppression immédiate.
- **Ajout personnalisé** : champ de saisie avec normalisation automatique (ex. `toml` -> `.toml`) et vérification des doublons.
- **Bouton de réinitialisation** : rétablit la liste des extensions par défaut en un clic.

### 3. Expérience utilisateur et productivité dans l'éditeur
- **Raccourci de sauvegarde manuelle** : `Cmd + S` (macOS) / `Ctrl + S` (Windows/Linux) force une sauvegarde immédiate avec confirmation par notification (`Notice`), en complément de la sauvegarde automatique.
- **Indicateur de statut d'enregistrement** : affichage en direct dans la barre d'état de l'éditeur (`Enregistré` ou `En cours d'enregistrement...` avec voyant visuel).
- **Bouton Copier** : bouton d'action dans l'en-tête de l'éditeur permettant de copier tout le contenu dans le presse-papiers avec message de confirmation visuel.
- **Création de fichier par clic droit sur dossier** : menu contextuel « Créer un fichier ici (Red File Editor) » disponible sur n'importe quel dossier dans l'explorateur de fichiers d'Obsidian.

### 4. Robustesse du démarrage et de la vue
- Dans le fichier fourni, `saveSettings()` appelait `saveSettings()` de nouveau,
  créant une récursion infinie. Cet appel est remplacé par
  `await this.saveData(this.settings)` pour enregistrer les réglages.
- L'installation de l'interception `openFile` utilise directement
  `WorkspaceLeaf.prototype`. Elle ne demande plus d'onglet à `getLeaf(false)`
  au démarrage, ce qui évite de créer un « Nouvel onglet » pendant la restauration.
- La vue `DevFileView` est déclarée navigable avec `navigation = true`.
- La recherche d'un fichier déjà ouvert consulte `leaf.getViewState()` pour
  retrouver aussi les onglets différés. Leur activation utilise `revealLeaf`
  lorsque cette API est disponible, avec un repli sur `setActiveLeaf`.

Après remplacement du `main.js`, fermer une fois l'éventuel onglet vide déjà
présent, activer le fichier voulu, puis fermer et relancer Obsidian.
Ne pas supprimer les fichiers de configuration du workspace.

## Vérifications

- Compilation esbuild et contrôle de syntaxe (`npm run build` et `npm run check`).
- Suite de tests complète automatisée : 50 tests unitaires et d'intégration validés
  sur les modules sources et sur le bundle compilé (`npm test`).
- Tests de non-régression sur le démarrage, la réutilisation des onglets différés,
  la suppression du suffixe `.md`, et le cycle de vie du panneau compagnon `.env`.
