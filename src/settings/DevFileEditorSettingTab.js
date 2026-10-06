const { PluginSettingTab, Setting, Notice } = require("obsidian");
const { DEFAULT_EXTENSIONS } = require("../constants");

class DevFileEditorSettingTab extends PluginSettingTab {

    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl("h2", {
            text: "Red File Editor"
        });

        /*
         * SECTION : AFFICHAGE & ÉDITEUR
         */
        containerEl.createEl("h3", {
            text: "Éditeur de code"
        });

        new Setting(containerEl)
            .setName("Largeur de l'éditeur")
            .setDesc(
                "Règle la largeur du bloc d'édition (50% à 100%). " +
                "La modification est appliquée immédiatement."
            )
            .addSlider(slider => {
                slider
                    .setLimits(50, 100, 1)
                    .setValue(this.plugin.getEditorWidthPercent())
                    .setDynamicTooltip()
                    .onChange(async value => {
                        this.plugin.settings.editorWidthPercent = value;
                        this.plugin.applyEditorWidth();
                        await this.plugin.saveSettings();
                        if (widthInfo) {
                            widthInfo.setText(`Largeur actuelle : ${value} %`);
                        }
                    });
            });

        const widthInfo = containerEl.createDiv({
            cls: "dev-file-editor-setting-info"
        });
        widthInfo.setText(
            `Largeur actuelle : ${this.plugin.getEditorWidthPercent()} %`
        );

        /*
         * SECTION : COMPAGNON .ENV
         */
        containerEl.createEl("h3", {
            text: "Compagnon .env"
        });

        new Setting(containerEl)
            .setName("Ouvrir automatiquement le .env avec les fichiers YAML")
            .setDesc(
                "Affiche automatiquement le fichier .env du même dossier dans un panneau vertical à droite lors de l'ouverture d'un fichier .yaml ou .yml."
            )
            .addToggle(toggle => {
                toggle
                    .setValue(this.plugin.settings.autoOpenEnvWithYaml !== false)
                    .onChange(async value => {
                        this.plugin.settings.autoOpenEnvWithYaml = value;
                        await this.plugin.saveSettings();
                        if (this.plugin.envCompanion) {
                            this.plugin.envCompanion.schedule();
                        }
                    });
            });

        /*
         * SECTION : EXTENSIONS DE FICHIERS
         */
        containerEl.createEl("h3", {
            text: "Extensions de fichiers prises en charge"
        });

        const extensionsDesc = containerEl.createEl("p", {
            cls: "setting-item-description"
        });
        extensionsDesc.setText(
            "Les fichiers dotfiles (.env, .gitignore, etc.) sont toujours pris en charge. " +
            "Les extensions ci-dessous sont éditées dans l'éditeur de code sans ajouter le suffixe .md."
        );

        // Ajout d'une nouvelle extension
        let newExtInput = "";
        new Setting(containerEl)
            .setName("Ajouter une extension")
            .setDesc("Saisissez une extension sans point (ex: env.local, prisma, proto)")
            .addText(text => {
                text
                    .setPlaceholder("ex: prisma")
                    .onChange(val => {
                        newExtInput = val.trim().toLowerCase().replace(/^\./, "");
                    });
                text.inputEl.addEventListener("keydown", async event => {
                    if (event.key === "Enter" && newExtInput) {
                        event.preventDefault();
                        await this.addExtension(newExtInput);
                    }
                });
            })
            .addButton(btn => {
                btn
                    .setButtonText("Ajouter")
                    .setCta()
                    .onClick(async () => {
                        if (newExtInput) {
                            await this.addExtension(newExtInput);
                        } else {
                            new Notice("Veuillez saisir une extension valide.");
                        }
                    });
            });

        // Conteneur des badges d'extensions
        const badgesContainer = containerEl.createDiv({
            cls: "dev-extensions-list-container"
        });

        const currentExtensions = Array.isArray(this.plugin.settings.extensions)
            ? this.plugin.settings.extensions
            : [...DEFAULT_EXTENSIONS];

        for (const ext of currentExtensions) {
            const badge = badgesContainer.createDiv({
                cls: "dev-extension-tag"
            });
            badge.createSpan({ text: `.${ext}` });

            // Bouton de suppression
            const removeBtn = badge.createSpan({
                cls: "dev-extension-tag-remove",
                text: "×"
            });
            removeBtn.setAttribute("title", `Supprimer .${ext}`);
            removeBtn.addEventListener("click", async () => {
                this.plugin.settings.extensions = this.plugin.settings.extensions.filter(
                    e => e !== ext
                );
                await this.plugin.saveSettings();
                this.display();
                new Notice(`Extension retirée : .${ext}`);
            });
        }

        // Bouton de réinitialisation des extensions
        new Setting(containerEl)
            .setName("Réinitialiser les extensions par défaut")
            .setDesc("Rétablit la liste d'origine des extensions supportées.")
            .addButton(btn => {
                btn
                    .setButtonText("Réinitialiser")
                    .setWarning()
                    .onClick(async () => {
                        this.plugin.settings.extensions = [...DEFAULT_EXTENSIONS];
                        await this.plugin.saveSettings();
                        if (typeof this.plugin.registerSupportedExtensions === "function") {
                            this.plugin.registerSupportedExtensions();
                        }
                        this.display();
                        new Notice("Extensions réinitialisées aux valeurs par défaut.");
                    });
            });
    }

    async addExtension(ext) {
        if (!ext || ext === "md") {
            new Notice("Extension invalide ou non supportée.");
            return;
        }

        if (this.plugin.settings.extensions.includes(ext)) {
            new Notice(`L'extension .${ext} est déjà enregistrée.`);
            return;
        }

        if (typeof this.plugin.addExtension === "function") {
            await this.plugin.addExtension(ext);
        } else {
            this.plugin.settings.extensions.push(ext);
            await this.plugin.saveSettings();
        }

        this.display();
        new Notice(`Extension ajoutée : .${ext}`);
    }
}

module.exports = { DevFileEditorSettingTab };
