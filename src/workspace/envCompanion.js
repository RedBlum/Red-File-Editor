const { VIEW_TYPE_DEV_FILE } = require("../constants");

// Un seul panneau automatique. Les onglets .env ouverts manuellement restent indépendants.
class EnvCompanion {
    constructor(plugin) {
        this.plugin = plugin;
        this.workspace = plugin.app.workspace;
        this.leaf = null;
        this.source = null;
        this.currentSourcePath = null;
        this.lastSourcePath = null;
        this.manuallyClosed = new Set();
        this._programmaticClosing = false;
        this.timer = null;
        this.running = null;
        this.dirty = false;
        this.stopped = false;
    }

    leaves() {
        const leaves = [];
        this.workspace.iterateAllLeaves(leaf => leaves.push(leaf));
        return leaves;
    }

    isLeafAttached(leaf) {
        if (!leaf) return false;
        if (leaf.parent != null) return true;
        return this.leaves().includes(leaf);
    }

    path(leaf) {
        return leaf?.view?.file?.path ||
            leaf?.view?.filePath ||
            leaf?.getViewState()?.state?.file ||
            "";
    }

    owns(leaf) {
        if (!leaf) return false;
        const type = leaf.getViewState()?.type || (typeof leaf.view?.getViewType === "function" ? leaf.view.getViewType() : null);
        if (type && type !== VIEW_TYPE_DEV_FILE && type !== "empty") {
            return false;
        }
        if (leaf.view && leaf.view.autoEnvCompanion === false) {
            leaf._isEnvCompanion = false;
            return false;
        }
        if (leaf._isEnvCompanion === true) return true;
        if (leaf === this.leaf) return true;
        if (leaf.view && (leaf.view.autoEnvCompanion === true || leaf.view._isEnvCompanion === true)) return true;
        const state = leaf.getViewState();
        return state?.type === VIEW_TYPE_DEV_FILE && state.state?.autoEnvCompanion === true;
    }

    target() {
        const active = this.workspace.activeLeaf;
        const source = active === this.leaf && this.owns(active) ? this.source : active;
        if (!source || !this.isLeafAttached(source)) return null;
        const path = this.path(source);
        return /\.(yaml|yml|yam)$/i.test(path) ? { source, path } : null;
    }

    attachDetachInterceptor(leaf, sourcePath) {
        if (!leaf || leaf._detachInterceptorAttached) return;
        leaf._detachInterceptorAttached = true;
        const originalDetach = leaf.detach;
        leaf.detach = () => {
            if (!this._programmaticClosing) {
                const closingFor = sourcePath || this.currentSourcePath;
                if (closingFor) {
                    this.manuallyClosed.add(closingFor);
                }
                if (this.leaf === leaf) {
                    this.leaf = null;
                }
            }
            return originalDetach.call(leaf);
        };
    }

    start() {
        // Retrouver le panneau automatique après un redémarrage, sans en dupliquer un.
        this.leaf = this.workspace.getLeavesOfType(VIEW_TYPE_DEV_FILE).find(leaf => this.owns(leaf)) || null;
        if (this.leaf) {
            this.leaf._isEnvCompanion = true;
            const sourcePath = this.leaf.getViewState()?.state?.envSourcePath;
            this.source = this.leaves().find(leaf => leaf !== this.leaf && this.path(leaf) === sourcePath) || null;
            this.currentSourcePath = sourcePath || null;
            this.attachDetachInterceptor(this.leaf, sourcePath);
        }
        for (const name of ["active-leaf-change", "file-open", "layout-change"]) {
            this.plugin.registerEvent(this.workspace.on(name, () => this.schedule()));
        }
        for (const name of ["create", "delete", "rename"]) {
            this.plugin.registerEvent(this.plugin.app.vault.on(name, () => this.schedule()));
        }
        this.schedule();
    }

    schedule() {
        if (this.stopped) return;
        this.dirty = true;
        if (this.running || this.timer) return;
        this.timer = setTimeout(() => {
            this.timer = null;
            void this.run();
        }, 30);
    }

    async run() {
        if (this.running) return this.running;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.running = this.drain();
        try {
            await this.running;
        } finally {
            this.running = null;
            if (this.dirty && !this.stopped) this.schedule();
        }
    }

    async drain() {
        while (this.dirty && !this.stopped) {
            this.dirty = false;
            try {
                await this.sync();
            } catch (error) {
                console.error("[Red File Editor] Suivi du .env :", error);
                await this.close();
            }
        }
    }

    sameTarget(expected) {
        const current = this.target();
        return !this.stopped && this.plugin.settings.autoOpenEnvWithYaml !== false &&
            current?.source === expected.source && current.path === expected.path;
    }

    async sync() {
        if (this.leaf && !this.isLeafAttached(this.leaf)) {
            // Respecter une fermeture manuelle jusqu'au prochain changement de YAML.
            const envSourcePath =
                this.currentSourcePath ||
                this.leaf._envSourcePath ||
                this.leaf.getViewState()?.state?.envSourcePath ||
                this.path(this.source);
            if (envSourcePath) {
                this.manuallyClosed.add(envSourcePath);
            }
            this.leaf = null;
            this.currentSourcePath = null;
        } else if (this.leaf && !this.owns(this.leaf)) {
            // Le panneau a été réutilisé manuellement : ne pas fermer son nouveau fichier.
            this.leaf = null;
            this.currentSourcePath = null;
        }

        const target = this.target();
        if (this.lastSourcePath && target && this.lastSourcePath !== target.path) {
            this.manuallyClosed.delete(this.lastSourcePath);
        }
        this.lastSourcePath = target?.path || null;

        if (this.plugin.settings.autoOpenEnvWithYaml === false || !target) {
            await this.close();
            this.source = null;
            this.currentSourcePath = null;
            return;
        }

        if (this.manuallyClosed.has(target.path)) {
            return;
        }
        this.source = target.source;

        const slash = target.path.lastIndexOf("/");
        const envPath = slash < 0 ? ".env" : `${target.path.slice(0, slash)}/.env`;
        const stat = await this.plugin.app.vault.adapter.stat(envPath);
        // Vérifier à nouveau la sélection après l'accès disque : elle a pu changer.
        if (!this.sameTarget(target)) {
            this.dirty = !this.stopped;
            return;
        }
        if (!stat || stat.type !== "file") {
            await this.close();
            return;
        }

        let leaf = this.leaf;
        if (!leaf || !this.isLeafAttached(leaf)) {
            leaf = this.leaves().find(l => this.owns(l)) || null;
            if (!leaf) {
                leaf = this.workspace.createLeafBySplit(target.source, "vertical", false);
            }
            this.leaf = leaf;
        }
        leaf._isEnvCompanion = true;
        leaf._envSourcePath = target.path;
        this.attachDetachInterceptor(leaf, target.path);

        const state = leaf.getViewState().state || {};
        if (!this.owns(leaf) || state.file !== envPath || state.envSourcePath !== target.path) {
            if (this.owns(leaf) && state.file && state.file !== envPath && typeof leaf.view?.saveNow === "function") {
                await leaf.view.saveNow();
            }
            await leaf.setViewState({
                type: VIEW_TYPE_DEV_FILE,
                active: false,
                pinned: true,
                state: { file: envPath, autoEnvCompanion: true, envSourcePath: target.path }
            });
            leaf._isEnvCompanion = true;
            leaf._envSourcePath = target.path;
            if (leaf.view) {
                leaf.view._isEnvCompanion = true;
                leaf.view.autoEnvCompanion = true;
                leaf.view.envSourcePath = target.path;
            }
        }
        this.currentSourcePath = target.path;
        if (typeof leaf.loadIfDeferred === "function") await leaf.loadIfDeferred();
        // Un événement intervenu pendant le chargement sera traité au tour suivant.
        if (!this.sameTarget(target)) this.dirty = !this.stopped;
    }

    async close() {
        const leaf = this.leaf;
        this.leaf = null;
        this.currentSourcePath = null;
        if (!leaf || !this.isLeafAttached(leaf) || !this.owns(leaf)) return;
        // Sauvegarder immédiatement, sans attendre le délai de frappe de l'éditeur.
        if (typeof leaf.view?.saveNow === "function") await leaf.view.saveNow();
        if (this.isLeafAttached(leaf) && this.owns(leaf)) {
            this._programmaticClosing = true;
            try {
                leaf.detach();
            } finally {
                this._programmaticClosing = false;
            }
        }
    }

    stop() {
        this.stopped = true;
        this.dirty = false;
        if (this.timer) clearTimeout(this.timer);
        this.timer = null;
        void this.close().catch(error => console.error("[Red File Editor] Fermeture du .env :", error));
    }
}

module.exports = { EnvCompanion };
