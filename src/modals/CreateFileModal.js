const { Modal, Setting, Notice } = require("obsidian");

class CreateFileModal extends Modal {

    constructor(app, plugin, targetFolder = null) {
        super(app);
        this.plugin = plugin;
        this.targetFolder = targetFolder;
        this.filename = "";
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl("h2", {
            text: "Créer un fichier"
        });

        contentEl.createEl("p", {
            text: "Sans extension → .md | Avec extension → extension conservée"
        });

        if (this.targetFolder) {
            contentEl.createEl("p", {
                cls: "setting-item-description",
                text: `Dossier cible : ${this.targetFolder}/`
            });
        }

        new Setting(contentEl)
            .setName("Nom du fichier")
            .setDesc("Exemples : Note serveur, .env, docker-compose.yml, nginx.conf")
            .addText(text => {
                text
                    .setPlaceholder("docker-compose.yml")
                    .onChange(value => {
                        this.filename = value.trim();
                    });

                text.inputEl.addEventListener(
                    "keydown",
                    async event => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            await this.create();
                        }
                    }
                );

                setTimeout(
                    () => text.inputEl.focus(),
                    50
                );
            });

        new Setting(contentEl)
            .addButton(button => {
                button
                    .setButtonText("Créer")
                    .setCta()
                    .onClick(async () => {
                        await this.create();
                    });
            });
    }

    async create() {
        if (!this.filename) {
            new Notice("Veuillez saisir un nom.");
            return;
        }

        this.close();
        await this.plugin.createFile(this.filename, this.targetFolder);
    }

    onClose() {
        this.contentEl.empty();
    }
}

module.exports = { CreateFileModal };
