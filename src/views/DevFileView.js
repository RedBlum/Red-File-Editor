const { ItemView, TFile, Notice } = require("obsidian");
const { VIEW_TYPE_DEV_FILE } = require("../constants");
const { getTypeLabelFromName } = require("../editor/fileTypes");
const { highlightCode } = require("../editor/highlight");

class DevFileView extends ItemView {

    constructor(leaf) {
        super(leaf);

        // Cette vue représente un fichier et participe à la navigation.
        this.navigation = true;

        this.editor = null;
        this.highlightEl = null;
        this.lineNumbersEl = null;
        this.filenameEl = null;
        this.languageEl = null;
        this.statusEl = null;
        this.saveStatusEl = null;
        this.copyButtonEl = null;
        this.file = null;
        this.filePath = "";
        this.saveTimer = null;
        this.loadingPath = false;
    }


    getViewType() {
        return VIEW_TYPE_DEV_FILE;
    }


    getDisplayText() {
        if (this.filePath) {
            return this.filePath.split("/").pop() || this.filePath;
        }

        return "Dev File Editor";
    }


    getState() {
        return {
            file: this.filePath,
            autoEnvCompanion: this.autoEnvCompanion,
            envSourcePath: this.envSourcePath
        };
    }


    async setState(state) {
        this.autoEnvCompanion = Boolean(state?.autoEnvCompanion);
        this.envSourcePath = state?.envSourcePath || null;
        if (this.autoEnvCompanion) {
            this.navigation = false;
        }

        const newPath =
            state && typeof state.file === "string"
                ? state.file
                : "";

        const pathChanged = newPath !== this.filePath;

        this.filePath = newPath;

        this.file =
            this.filePath
                ? this.app.vault.getAbstractFileByPath(this.filePath)
                : null;

        if (!(this.file instanceof TFile)) {
            this.file = null;
        }

        if (pathChanged) {
            await this.loadCurrentPath();
        }
    }


    async loadCurrentPath() {
        if (
            !this.filePath ||
            !this.editor ||
            this.loadingPath
        ) {
            return;
        }

        this.loadingPath = true;

        try {
            const data =
                await this.app.vault.adapter.read(
                    this.filePath
                );

            this.editor.value = data;
            this.refreshHeader();
            this.renderEditor();
        }

        catch (error) {
            console.error(
                "[Dev File Editor] Impossible de lire",
                this.filePath,
                error
            );

            new Notice(
                `Impossible de lire : ${this.filePath}`
            );
        }

        finally {
            this.loadingPath = false;
        }
    }


    requestSave() {
        this.setSaveStatus("saving");

        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }

        this.saveTimer =
            setTimeout(
                () => {
                    this.saveNow();
                },
                250
            );
    }


    async saveNow() {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
            this.saveTimer = null;
        }

        if (
            !this.filePath ||
            !this.editor ||
            this.loadingPath
        ) {
            return;
        }

        try {
            await this.app.vault.adapter.write(
                this.filePath,
                this.editor.value
            );
            this.setSaveStatus("saved");
        }

        catch (error) {
            console.error(
                "[Dev File Editor] Impossible d'écrire",
                this.filePath,
                error
            );

            this.setSaveStatus("error");

            new Notice(
                `Impossible d'enregistrer : ${this.filePath}`
            );
        }
    }


    async onClose() {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
            this.saveTimer = null;
        }

        await this.saveNow();
    }


    getIcon() {
        return "file-code";
    }


    async onOpen() {
        this.contentEl.empty();

        this.contentEl.addClass(
            "dev-file-editor-container"
        );


        /*
         * HEADER
         */

        const header =
            this.contentEl.createDiv({
                cls: "dev-file-editor-header"
            });

        const headerLeft =
            header.createDiv({
                cls: "dev-file-editor-header-left"
            });

        this.filenameEl =
            headerLeft.createDiv({
                cls: "dev-file-editor-filename"
            });

        this.languageEl =
            headerLeft.createDiv({
                cls: "dev-file-editor-language"
            });

        const headerActions =
            header.createDiv({
                cls: "dev-file-editor-header-actions"
            });

        this.copyButtonEl =
            headerActions.createEl("button", {
                cls: "dev-file-copy-btn",
                text: "Copier"
            });
        this.copyButtonEl.setAttribute(
            "title",
            "Copier tout le contenu"
        );
        this.copyButtonEl.addEventListener(
            "click",
            async () => {
                if (!this.editor) return;
                try {
                    if (
                        navigator.clipboard &&
                        typeof navigator.clipboard.writeText === "function"
                    ) {
                        await navigator.clipboard.writeText(this.editor.value);
                    }
                    this.copyButtonEl.setText("Copié !");
                    new Notice("Contenu copié dans le presse-papiers.");
                    setTimeout(() => {
                        if (this.copyButtonEl) {
                            this.copyButtonEl.setText("Copier");
                        }
                    }, 1500);
                } catch (e) {
                    new Notice("Impossible de copier le contenu.");
                }
            }
        );


        /*
         * EDITEUR
         */

        const body =
            this.contentEl.createDiv({
                cls: "dev-code-editor"
            });


        this.lineNumbersEl =
            body.createEl(
                "pre",
                {
                    cls: "dev-code-line-numbers",
                    attr: {
                        "aria-hidden": "true"
                    }
                }
            );


        const viewport =
            body.createDiv({
                cls: "dev-code-viewport"
            });


        this.highlightEl =
            viewport.createEl(
                "pre",
                {
                    cls: "dev-code-highlight",
                    attr: {
                        "aria-hidden": "true"
                    }
                }
            );


        this.editor =
            viewport.createEl(
                "textarea",
                {
                    cls: "dev-code-input"
                }
            );


        this.editor.spellcheck = false;
        this.editor.wrap = "off";


        /*
         * BARRE D'ETAT
         */

        const footer =
            this.contentEl.createDiv({
                cls: "dev-file-editor-statusbar"
            });


        this.statusEl =
            footer.createDiv({
                cls: "dev-file-editor-status"
            });

        this.saveStatusEl =
            footer.createDiv({
                cls: "dev-file-editor-save-status"
            });

        this.setSaveStatus("saved");


        /*
         * EVENTS
         */

        this.editor.addEventListener(
            "input",
            () => {
                this.renderEditor();
                this.requestSave();
            }
        );


        this.editor.addEventListener(
            "scroll",
            () => {
                this.syncScroll();
            }
        );


        this.editor.addEventListener(
            "click",
            () => {
                this.updateStatus();
            }
        );


        this.editor.addEventListener(
            "keyup",
            () => {
                this.updateStatus();
            }
        );


        this.editor.addEventListener(
            "keydown",
            event => {
                this.handleKeyDown(event);
            }
        );


        this.refreshHeader();
        this.renderEditor();
        await this.loadCurrentPath();
    }


    setViewData(
        data,
        clear
    ) {
        if (!this.editor) {
            return;
        }

        if (clear) {
            this.editor.value = "";
        }

        this.editor.value = data;

        this.refreshHeader();
        this.renderEditor();
    }


    getViewData() {
        if (!this.editor) {
            return "";
        }

        return this.editor.value;
    }


    clear() {
        if (this.editor) {
            this.editor.value = "";
            this.renderEditor();
        }
    }


    refreshHeader() {
        if (!this.filePath) {
            return;
        }

        const name =
            this.filePath.split("/").pop() ||
            this.filePath;

        if (this.filenameEl) {
            this.filenameEl.setText(name);
        }

        if (this.languageEl) {
            this.languageEl.setText(
                getTypeLabelFromName(name)
            );
        }
    }


    renderEditor() {
        if (
            !this.editor ||
            !this.highlightEl ||
            !this.lineNumbersEl
        ) {
            return;
        }

        const value =
            this.editor.value;

        const type =
            this.filePath
                ? getTypeLabelFromName(
                    this.filePath.split("/").pop() || this.filePath
                )
                : "TEXT";

        this.highlightEl.innerHTML =
            highlightCode(
                value,
                type
            );

        const lineCount =
            Math.max(
                1,
                value.split("\n").length
            );

        let numbers = "";

        for (
            let i = 1;
            i <= lineCount;
            i++
        ) {
            numbers += `${i}\n`;
        }

        this.lineNumbersEl.textContent =
            numbers;

        this.syncScroll();
        this.updateStatus();
    }


    syncScroll() {
        if (
            !this.editor ||
            !this.highlightEl ||
            !this.lineNumbersEl
        ) {
            return;
        }

        this.highlightEl.style.transform =
            `translate(${-this.editor.scrollLeft}px, ${-this.editor.scrollTop}px)`;

        this.lineNumbersEl.style.transform =
            `translateY(${-this.editor.scrollTop}px)`;
    }


    updateStatus() {
        if (
            !this.editor ||
            !this.statusEl
        ) {
            return;
        }

        const position =
            this.editor.selectionStart;

        const before =
            this.editor.value.slice(
                0,
                position
            );

        const lines =
            before.split("\n");

        const line =
            lines.length;

        const column =
            lines[
                lines.length - 1
            ].length + 1;

        const totalLines =
            Math.max(
                1,
                this.editor.value
                    .split("\n")
                    .length
            );

        this.statusEl.setText(
            `Ln ${line}, Col ${column}  •  ${totalLines} ligne${totalLines > 1 ? "s" : ""}`
        );
    }


    async handleKeyDown(event) {
        if (!this.editor) {
            return;
        }

        /*
         * Cmd/Ctrl + S : Sauvegarde manuelle immédiate
         */
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
            event.preventDefault();
            await this.saveNow();
            const name = this.filePath.split("/").pop() || this.filePath;
            new Notice(`Enregistré : ${name}`);
            return;
        }

        /*
         * TAB
         */
        if (event.key === "Tab") {
            event.preventDefault();

            if (event.shiftKey) {
                this.unindentSelection();
            }

            else {
                this.indentSelection();
            }

            this.renderEditor();
            this.requestSave();

            return;
        }


        /*
         * Entrée : conserve l'indentation
         */
        if (event.key === "Enter") {
            const start =
                this.editor.selectionStart;

            const before =
                this.editor.value.slice(
                    0,
                    start
                );

            const currentLine =
                before.split("\n").pop() || "";

            const indentation =
                currentLine.match(
                    /^[\t ]*/
                )[0];

            if (indentation) {
                event.preventDefault();

                this.replaceSelection(
                    `\n${indentation}`
                );

                this.renderEditor();
                this.requestSave();
            }
        }
    }


    replaceSelection(text) {
        const start =
            this.editor.selectionStart;

        const end =
            this.editor.selectionEnd;

        this.editor.setRangeText(
            text,
            start,
            end,
            "end"
        );
    }


    indentSelection() {
        const start =
            this.editor.selectionStart;

        const end =
            this.editor.selectionEnd;


        if (start === end) {
            this.editor.setRangeText(
                "    ",
                start,
                end,
                "end"
            );

            return;
        }


        const value =
            this.editor.value;

        const lineStart =
            value.lastIndexOf(
                "\n",
                start - 1
            ) + 1;

        const block =
            value.slice(
                lineStart,
                end
            );

        const indented =
            block
                .split("\n")
                .map(
                    line =>
                        `    ${line}`
                )
                .join("\n");

        this.editor.setRangeText(
            indented,
            lineStart,
            end,
            "select"
        );
    }


    unindentSelection() {
        const start =
            this.editor.selectionStart;

        const end =
            this.editor.selectionEnd;

        const value =
            this.editor.value;

        const lineStart =
            value.lastIndexOf(
                "\n",
                start - 1
            ) + 1;

        const block =
            value.slice(
                lineStart,
                end
            );

        const unindented =
            block
                .split("\n")
                .map(
                    line => {
                        if (
                            line.startsWith(
                                "    "
                            )
                        ) {
                            return line.slice(4);
                        }

                        if (
                            line.startsWith(
                                "\t"
                            )
                        ) {
                            return line.slice(1);
                        }

                        return line;
                    }
                )
                .join("\n");

        this.editor.setRangeText(
            unindented,
            lineStart,
            end,
            "select"
        );
    }


    setSaveStatus(status) {
        if (!this.saveStatusEl) {
            return;
        }

        this.saveStatusEl.empty();

        this.saveStatusEl.createSpan({
            cls: `dev-save-dot mod-${status}`
        });

        const label =
            this.saveStatusEl.createSpan({
                cls: "dev-save-label"
            });

        if (status === "saving") {
            label.setText("Enregistrement...");
        } else if (status === "saved") {
            label.setText("Enregistré");
        } else if (status === "error") {
            label.setText("Erreur");
        }
    }
}

module.exports = { DevFileView };
