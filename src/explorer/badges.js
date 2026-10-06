const { TFile } = require("obsidian");
const { isDotFile, getTypeLabelFromFile } = require("../editor/fileTypes");

// Méthodes rattachées au prototype du plugin dans src/main.js.
// `this` désigne toujours la même instance du plugin.
const badgeMethods = {
    installFileExplorerBadges() {
        this.scheduleExplorerBadgeUpdate();

        const observer =
            new MutationObserver(
                mutations => {
                    if (this.badgeUpdateRunning) {
                        return;
                    }

                    let relevant = false;
                    for (const m of mutations) {
                        if (
                            m.target &&
                            m.target.classList &&
                            m.target.classList.contains("dev-file-explorer-badge")
                        ) {
                            continue;
                        }

                        const allNodes = Array.from(m.addedNodes || []).concat(Array.from(m.removedNodes || []));
                        const hasOnlyBadges = allNodes.length > 0 && allNodes.every(
                            node => node.nodeType === 1 && node.classList.contains("dev-file-explorer-badge")
                        );
                        if (hasOnlyBadges) {
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
                        this.scheduleExplorerBadgeUpdate();
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
            () => {
                observer.disconnect();
            }
        );

        this.registerEvent(
            this.app.vault.on(
                "create",
                () => {
                    this.scheduleExplorerBadgeUpdate();
                }
            )
        );

        this.registerEvent(
            this.app.vault.on(
                "delete",
                () => {
                    this.scheduleExplorerBadgeUpdate();
                }
            )
        );
    },


    scheduleExplorerBadgeUpdate() {
        if (
            this.badgeUpdateTimer
        ) {
            clearTimeout(
                this.badgeUpdateTimer
            );
        }

        this.badgeUpdateTimer =
            setTimeout(
                () => {
                    this.updateFileExplorerBadges();
                },
                100
            );
    },


    updateFileExplorerBadges() {
        if (this.badgeUpdateRunning) {
            return;
        }

        this.badgeUpdateRunning = true;

        try {
            const titles =
                document.querySelectorAll(
                    ".nav-file-title"
                );

            titles.forEach(
                title => {
                    const oldBadge =
                        title.querySelector(
                            ".dev-file-explorer-badge"
                        );

                    const path =
                        title.getAttribute(
                            "data-path"
                        );

                    if (!path) {
                        return;
                    }

                    const file =
                        this.app.vault
                            .getAbstractFileByPath(
                                path
                            );

                    if (
                        !(file instanceof TFile)
                    ) {
                        return;
                    }

                    /*
                     * On ajoute nos propres badges uniquement
                     * aux vrais dotfiles. Obsidian garde ses
                     * badges natifs pour YAML, JSON, etc.
                     */
                    if (!isDotFile(file)) {
                        return;
                    }

                    const label =
                        getTypeLabelFromFile(file);

                    if (!label) {
                        return;
                    }

                    if (oldBadge) {
                        if (oldBadge.textContent !== label) {
                            oldBadge.textContent = label;
                        }
                        return;
                    }

                    const badge =
                        document.createElement(
                            "span"
                        );

                    badge.className =
                        "dev-file-explorer-badge";

                    badge.textContent =
                        label;

                    title.appendChild(
                        badge
                    );
                }
            );
        }
        finally {
            this.badgeUpdateRunning = false;
        }
    },
};

module.exports = { badgeMethods };
