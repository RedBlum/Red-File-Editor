const { TFile, Notice } = require("obsidian");
const { VIEW_TYPE_DEV_FILE } = require("../constants");
const { isDotFile } = require("../editor/fileTypes");

// Méthodes rattachées au prototype du plugin dans src/main.js.
// `this` désigne toujours la même instance du plugin.
const fileOperationMethods = {
    registerSupportedExtensions() {
        const extensions =
            this.settings.extensions
                .filter(
                    extension =>
                        extension &&
                        extension !== "md"
                );

        for (
            const extension
            of extensions
        ) {
            try {
                this.registerExtensions(
                    [extension],
                    VIEW_TYPE_DEV_FILE
                );
            }

            catch (error) {
                console.warn(
                    `[Dev File Editor] .${extension} déjà enregistrée.`
                );
            }
        }
    },


    async addExtension(extension) {
        extension =
            extension
                .replace(/^\./, "")
                .toLowerCase()
                .trim();

        if (
            !extension ||
            extension === "md"
        ) {
            return;
        }

        if (
            this.settings.extensions
                .includes(
                    extension
                )
        ) {
            return;
        }

        this.settings.extensions.push(
            extension
        );

        await this.saveData(
            this.settings
        );

        try {
            this.registerExtensions(
                [extension],
                VIEW_TYPE_DEV_FILE
            );
        }

        catch (error) {
            console.warn(
                `[Dev File Editor] Impossible d'enregistrer .${extension}`
            );
        }
    },


    async createFile(filename, targetFolder = null) {
        filename =
            filename.trim();

        if (!filename) {
            return;
        }

        if (
            !this.hasExplicitExtension(
                filename
            )
        ) {
            filename += ".md";
        }

        let folder = targetFolder || "";

        if (!folder) {
            const activeFile =
                this.app.workspace
                    .getActiveFile();

            if (
                activeFile &&
                activeFile.parent &&
                activeFile.parent.path !== "/"
            ) {
                folder =
                    activeFile.parent.path;
            }
        }

        const path =
            folder
                ? `${folder}/${filename}`
                : filename;

        const existing =
            this.app.vault
                .getAbstractFileByPath(
                    path
                );

        if (existing) {
            new Notice(
                `Le fichier existe déjà : ${path}`
            );
            return;
        }

        const extension =
            this.getExtension(
                filename
            );

        if (
            extension &&
            extension !== "md"
        ) {
            await this.addExtension(
                extension
            );
        }

        try {
            const file =
                await this.app.vault
                    .create(
                        path,
                        ""
                    );

            const extension =
                this.getExtension(
                    file.name
                );

            const handledByPlugin =
                isDotFile(file) ||
                (
                    extension &&
                    extension !== "md" &&
                    this.settings.extensions
                        .includes(extension)
                );

            if (
                handledByPlugin
            ) {
                await this
                    .openInDevEditor(
                        file
                    );
            }

            else {
                const leaf =
                    typeof this.app.workspace.getLeaf === "function"
                        ? this.app.workspace.getLeaf(false)
                        : null;

                if (leaf && typeof leaf.openFile === "function") {
                    await leaf.openFile(file);
                }
            }

            this.scheduleExplorerBadgeUpdate();

            new Notice(
                `Créé : ${file.path}`
            );
        }

        catch (error) {
            console.error(
                "Dev File Editor:",
                error
            );

            new Notice(
                "Impossible de créer le fichier."
            );
        }
    },


    hasExplicitExtension(filename) {
        if (
            filename.startsWith(".") &&
            filename.length > 1
        ) {
            return true;
        }

        const lastDot =
            filename.lastIndexOf(".");

        return (
            lastDot > 0 &&
            lastDot <
                filename.length - 1
        );
    },


    getExtension(filename) {
        if (
            filename.startsWith(".") &&
            filename.indexOf(
                ".",
                1
            ) === -1
        ) {
            return filename
                .substring(1)
                .toLowerCase();
        }

        const lastDot =
            filename.lastIndexOf(".");

        if (
            lastDot === -1 ||
            lastDot ===
                filename.length - 1
        ) {
            return "";
        }

        return filename
            .substring(
                lastDot + 1
            )
            .toLowerCase();
    },


    async removeTrailingMd(file) {
        if (
            !file.name
                .toLowerCase()
                .endsWith(".md")
        ) {
            new Notice(
                "Ce fichier ne se termine pas par .md"
            );
            return;
        }

        const newName =
            file.name.slice(
                0,
                -3
            );

        const extension =
            this.getExtension(
                newName
            );

        if (extension) {
            await this.addExtension(
                extension
            );
        }

        const newPath =
            file.parent &&
            file.parent.path !== "/"
                ? `${file.parent.path}/${newName}`
                : newName;

        const success =
            await this.renameFile(
                file,
                newPath
            );

        if (!success) {
            return;
        }

        const renamedFile =
            this.app.vault
                .getAbstractFileByPath(
                    newPath
                );

        if (
            renamedFile instanceof TFile &&
            isDotFile(renamedFile)
        ) {
            await this.openInDevEditor(
                renamedFile
            );
        }

        this.scheduleExplorerBadgeUpdate();
    },


    async changeExtension(
        file,
        extension
    ) {
        extension =
            extension
                .replace(/^\./, "")
                .trim();

        if (!extension) {
            new Notice(
                "Extension invalide."
            );
            return;
        }

        await this.addExtension(
            extension
        );

        let basename =
            file.name;

        const currentExtension =
            file.extension;

        if (currentExtension) {
            basename =
                file.name.slice(
                    0,
                    -(
                        currentExtension.length +
                        1
                    )
                );
        }

        const newName =
            `${basename}.${extension}`;

        const newPath =
            file.parent &&
            file.parent.path !== "/"
                ? `${file.parent.path}/${newName}`
                : newName;

        const success =
            await this.renameFile(
                file,
                newPath
            );

        if (success) {
            this.scheduleExplorerBadgeUpdate();
        }
    },


    async renameFile(
        file,
        newPath
    ) {
        const existing =
            this.app.vault
                .getAbstractFileByPath(
                    newPath
                );

        if (existing) {
            new Notice(
                `Le fichier existe déjà : ${newPath}`
            );
            return false;
        }

        try {
            await this.app.fileManager
                .renameFile(
                    file,
                    newPath
                );

            new Notice(
                `Renommé : ${newPath}`
            );

            return true;
        }

        catch (error) {
            console.error(
                "Dev File Editor:",
                error
            );

            new Notice(
                "Impossible de renommer le fichier."
            );

            return false;
        }
    },
};

module.exports = { fileOperationMethods };
