const { getTypeLabelFromName } = require("../editor/fileTypes");

// Méthodes rattachées au prototype du plugin dans src/main.js.
// `this` désigne toujours la même instance du plugin.
const dotfileMethods = {
    installHiddenDotFilesExplorer() {
        this.scheduleHiddenDotFilesUpdate();

        const observer =
            new MutationObserver(
                mutations => {
                    if (this.hiddenFilesUpdateRunning) {
                        return;
                    }

                    let relevant = false;
                    for (const m of mutations) {
                        if (
                            m.target &&
                            m.target.classList &&
                            (
                                m.target.classList.contains("dev-hidden-dotfile") ||
                                m.target.classList.contains("dev-hidden-dotfile-title") ||
                                m.target.classList.contains("dev-file-explorer-badge")
                            )
                        ) {
                            continue;
                        }

                        const allNodes = Array.from(m.addedNodes || []).concat(Array.from(m.removedNodes || []));
                        const hasSelfElements = allNodes.some(
                            node =>
                                node.nodeType === 1 &&
                                (
                                    node.classList.contains("dev-hidden-dotfile") ||
                                    node.classList.contains("dev-file-explorer-badge")
                                )
                        );

                        if (hasSelfElements) {
                            continue;
                        }

                        if (
                            m.target &&
                            m.target.closest &&
                            m.target.closest('.workspace-leaf-content[data-type="file-explorer"]')
                        ) {
                            relevant = true;
                            break;
                        }
                    }

                    if (relevant) {
                        this.scheduleHiddenDotFilesUpdate();
                    }
                }
            );

        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );

        this.register(
            () => observer.disconnect()
        );

        for (const eventName of [
            "create",
            "delete",
            "rename"
        ]) {
            this.registerEvent(
                this.app.vault.on(
                    eventName,
                    () => {
                        this.scheduleHiddenDotFilesUpdate();
                    }
                )
            );
        }
    },


    scheduleHiddenDotFilesUpdate() {
        if (this.hiddenFilesUpdateRunning) {
            this.hiddenFilesNeedsRerun = true;
            return;
        }

        if (this.hiddenFilesUpdateTimer) {
            clearTimeout(
                this.hiddenFilesUpdateTimer
            );
        }

        this.hiddenFilesUpdateTimer =
            setTimeout(
                () => {
                    this.updateHiddenDotFilesExplorer();
                },
                120
            );
    },


    async updateHiddenDotFilesExplorer() {
        if (this.hiddenFilesUpdateRunning) {
            return;
        }

        this.hiddenFilesUpdateRunning = true;

        try {
            const explorerRoots =
                document.querySelectorAll(
                    '.workspace-leaf-content[data-type="file-explorer"]'
                );

            for (const explorer of explorerRoots) {
                const rootContainer =
                    explorer.querySelector(
                        ".nav-files-container"
                    );

                if (rootContainer) {
                    const modRoot =
                        rootContainer.querySelector(
                            ":scope > .nav-folder.mod-root > .nav-folder-children"
                        ) ||
                        rootContainer.querySelector(
                            ":scope > .tree-item.nav-folder > .tree-item-children"
                        );

                    await this.syncHiddenFilesForFolder(
                        "",
                        modRoot || rootContainer
                    );
                }

                const folderTitles =
                    explorer.querySelectorAll(
                        ".nav-folder-title[data-path]"
                    );

                for (const folderTitle of folderTitles) {
                    const folderPath =
                        folderTitle.getAttribute(
                            "data-path"
                        );

                    if (!folderPath) {
                        continue;
                    }

                    const folderEl =
                        folderTitle.closest(
                            ".nav-folder"
                        );

                    if (!folderEl) {
                        continue;
                    }

                    const children =
                        Array.from(folderEl.children)
                            .find(
                                child =>
                                    child.classList &&
                                    child.classList.contains(
                                        "nav-folder-children"
                                    )
                            );

                    if (!children) {
                        continue;
                    }

                    await this.syncHiddenFilesForFolder(
                        folderPath,
                        children
                    );
                }
            }
        }

        catch (error) {
            console.error(
                "[Dev File Editor] Erreur affichage dotfiles :",
                error
            );
        }

        finally {
            this.hiddenFilesUpdateRunning = false;
            if (this.hiddenFilesNeedsRerun) {
                this.hiddenFilesNeedsRerun = false;
                this.scheduleHiddenDotFilesUpdate();
            }
        }
    },


    async syncHiddenFilesForFolder(
        folderPath,
        container
    ) {
        let listing;

        try {
            listing =
                await this.app.vault.adapter.list(
                    folderPath
                );
        }

        catch (error) {
            return;
        }

        const hiddenFiles =
            (listing.files || [])
                .filter(path => {
                    const name =
                        path.split("/").pop() || "";

                    return (
                        name.startsWith(".") &&
                        name.length > 1
                    );
                })
                .sort((a, b) =>
                    a.localeCompare(b)
                );

        const wanted =
            new Set(hiddenFiles);

        const existingSynthetic =
            Array.from(
                container.querySelectorAll(
                    ":scope > .nav-file.dev-hidden-dotfile"
                )
            );

        for (const element of existingSynthetic) {
            const path =
                element.getAttribute(
                    "data-path"
                );

            if (!wanted.has(path)) {
                element.remove();
            }
        }

        for (const path of hiddenFiles) {
            const alreadyNative =
                Array.from(
                    container.querySelectorAll(
                        ":scope > .nav-file > .nav-file-title[data-path]"
                    )
                )
                .some(
                    title =>
                        title.getAttribute(
                            "data-path"
                        ) === path
                );

            if (alreadyNative) {
                continue;
            }

            const name =
                path.split("/").pop() || path;

            const isEnv =
                name === ".env" ||
                name.startsWith(".env.");

            let targetYamlFile = null;
            if (isEnv) {
                const targetYamlTitle = Array.from(
                    container.querySelectorAll(
                        ":scope > .nav-file > .nav-file-title[data-path], :scope > .tree-item > .tree-item-self[data-path]"
                    )
                ).find(el => {
                    const p = el.getAttribute("data-path") || "";
                    const fileFolder = p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "";
                    return fileFolder === folderPath && /\.(yaml|yml)$/i.test(p);
                });

                const rawYamlFile = targetYamlTitle
                    ? (targetYamlTitle.closest(".nav-file") || targetYamlTitle.closest(".tree-item"))
                    : null;

                targetYamlFile = (rawYamlFile && rawYamlFile.parentElement === container)
                    ? rawYamlFile
                    : null;
            }

            const alreadySynthetic =
                Array.from(
                    container.querySelectorAll(
                        ":scope > .nav-file.dev-hidden-dotfile"
                    )
                )
                .find(
                    element =>
                        element.getAttribute(
                            "data-path"
                        ) === path
                );

            if (alreadySynthetic) {
                if (
                    isEnv &&
                    targetYamlFile &&
                    alreadySynthetic.previousSibling !== targetYamlFile
                ) {
                    container.insertBefore(
                        alreadySynthetic,
                        targetYamlFile.nextSibling
                    );
                }
                continue;
            }

            /*
             * Reprendre la structure/classes d'un fichier natif du même
             * dossier est beaucoup plus fiable que de tenter de reproduire
             * la largeur/indentation d'Obsidian à la main. Selon la version
             * et le thème, des classes comme `tree-item-self` participent
             * directement au calcul de la largeur de la ligne.
             */
            const nativeFile =
                Array.from(container.children)
                    .find(child =>
                        child.classList &&
                        child.classList.contains(
                            "nav-file"
                        ) &&
                        !child.classList.contains(
                            "dev-hidden-dotfile"
                        )
                    ) || null;

            const nativeTitle =
                nativeFile
                    ? nativeFile.querySelector(
                        ":scope > .nav-file-title"
                    )
                    : null;

            const fileEl =
                document.createElement("div");

            if (nativeFile) {
                for (const className of nativeFile.classList) {
                    if (
                        className !== "is-active" &&
                        className !== "is-selected" &&
                        className !== "is-being-dragged"
                    ) {
                        fileEl.classList.add(
                            className
                        );
                    }
                }
            }

            fileEl.classList.add(
                "nav-file",
                "dev-hidden-dotfile"
            );

            fileEl.setAttribute(
                "data-path",
                path
            );

            const titleEl =
                document.createElement("div");

            if (nativeTitle) {
                for (const className of nativeTitle.classList) {
                    if (
                        className !== "is-active" &&
                        className !== "is-selected" &&
                        className !== "is-being-dragged"
                    ) {
                        titleEl.classList.add(
                            className
                        );
                    }
                }
            }

            titleEl.classList.add(
                "nav-file-title",
                "dev-hidden-dotfile-title"
            );

            titleEl.setAttribute(
                "data-path",
                path
            );

            titleEl.setAttribute(
                "draggable",
                "false"
            );

            /*
             * Certains thèmes mettent une partie du retrait en style inline.
             * On ne copie que ces propriétés de géométrie lorsqu'elles sont
             * réellement présentes sur la ligne native.
             */
            if (nativeTitle) {
                for (const property of [
                    "padding-left",
                    "padding-right",
                    "padding-inline-start",
                    "padding-inline-end",
                    "margin-left",
                    "margin-right",
                    "margin-inline-start",
                    "margin-inline-end"
                ]) {
                    const value =
                        nativeTitle.style.getPropertyValue(
                            property
                        );

                    if (value) {
                        titleEl.style.setProperty(
                            property,
                            value
                        );
                    }
                }

                for (const variable of [
                    "--nav-item-depth",
                    "--nav-item-parent-padding",
                    "--nav-item-children-margin-start"
                ]) {
                    const value =
                        nativeTitle.style.getPropertyValue(
                            variable
                        );

                    if (value) {
                        titleEl.style.setProperty(
                            variable,
                            value
                        );
                    }
                }
            }

            const contentEl =
                document.createElement("div");

            const nativeContent =
                nativeTitle
                    ? nativeTitle.querySelector(
                        ".nav-file-title-content"
                    )
                    : null;

            if (nativeContent) {
                for (const className of nativeContent.classList) {
                    contentEl.classList.add(
                        className
                    );
                }
            }

            contentEl.classList.add(
                "nav-file-title-content"
            );

            contentEl.textContent = name;

            titleEl.appendChild(
                contentEl
            );

            const label =
                getTypeLabelFromName(name);

            if (label) {
                const badge =
                    document.createElement("span");

                badge.className =
                    "dev-file-explorer-badge";

                badge.textContent = label;

                titleEl.appendChild(
                    badge
                );
            }

            titleEl.addEventListener(
                "click",
                async event => {
                    event.preventDefault();
                    event.stopPropagation();

                    await this.openPathInDevEditor(
                        path
                    );
                }
            );

            fileEl.appendChild(
                titleEl
            );

            const firstNormalFile =
                Array.from(container.children)
                    .find(child =>
                        child.classList &&
                        child.classList.contains(
                            "nav-file"
                        ) &&
                        !child.classList.contains(
                            "dev-hidden-dotfile"
                        )
                    );

            if (
                isEnv &&
                targetYamlFile
            ) {
                container.insertBefore(
                    fileEl,
                    targetYamlFile.nextSibling
                );
            } else if (firstNormalFile && firstNormalFile.parentElement === container) {
                container.insertBefore(
                    fileEl,
                    firstNormalFile
                );
            } else {
                container.appendChild(
                    fileEl
                );
            }
        }
    },
};

module.exports = { dotfileMethods };
