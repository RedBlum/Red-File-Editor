const test = require('node:test');
const assert = require('node:assert/strict');
const { variants, fixture } = require('./obsidianMock.cjs');
async function start(f) {
    await f.plugin.onload();
    for (const callback of f.callbacks) callback();
    await f.settle();
}
function deferred() {
    let resolve; const promise = new Promise(r => { resolve = r; });
    return { promise, resolve };
}
for (const [label, PluginClass] of variants) {
    test(`${label} : split à droite, même .env réutilisé puis fermé sur Markdown`, async t => {
        const f = fixture(PluginClass); t.after(f.cleanup);
        f.files.set('a/.env', 'A=1'); f.files.set('b/.env', 'B=2');
        const a = f.addLeaf('a/compose.yaml'); const b = f.addLeaf('b/compose.yml');
        const md = f.addLeaf('note.md', 'markdown');
        const manual = f.addLeaf('personnel/.env');
        f.workspace.activeLeaf = a;
        await start(f);
        const env = f.plugin.envCompanion.leaf;
        assert.deepEqual(f.workspace.splits, [[a, 'vertical', false]]);
        assert.equal(f.workspace.activeLeaf, a);
        assert.equal(env.getViewState().state.file, 'a/.env');
        assert.equal(env.view.editor.value, 'A=1');
        assert.equal(env.state.pinned, true);
        assert.equal(env.view.navigation, false);
        env.view.editor.value = 'A=edited'; env.view.requestSave();
        f.workspace.setActiveLeaf(b); await f.settle();
        assert.equal(f.plugin.envCompanion.leaf, env);
        assert.equal(env.getViewState().state.file, 'b/.env');
        assert.equal(env.view.editor.value, 'B=2');
        assert.equal(f.files.get('a/.env'), 'A=edited');
        assert.equal(env.view.saveTimer, null);
        assert.equal(f.workspace.splits.length, 1);
        env.view.editor.value = 'B=edited';
        f.workspace.setActiveLeaf(md); await f.settle();
        assert.equal(env.detached, true);
        assert.equal(f.files.get('b/.env'), 'B=edited');
        assert(f.workspace.leaves.includes(manual));
        assert.equal(f.workspace.activeLeaf, md);
    });

    test(`${label} : focus sur .env autorisé, fermeture du YAML ferme son panneau`, async t => {
        const f = fixture(PluginClass); t.after(f.cleanup);
        f.files.set('.env', 'ROOT=1'); const yaml = f.addLeaf('compose.yam');
        f.workspace.activeLeaf = yaml; await start(f);
        const env = f.plugin.envCompanion.leaf;
        f.workspace.setActiveLeaf(env); await f.settle();
        assert.equal(f.plugin.envCompanion.leaf, env);
        assert.equal(env.detached, false);
        yaml.detach(); await f.settle();
        assert.equal(env.detached, true); assert.equal(f.workspace.leaves.length, 0);
    });

    test(`${label} : YAML sans .env et dossier nommé .env n'ouvrent aucun panneau`, async t => {
        const f = fixture(PluginClass); t.after(f.cleanup);
        const yaml = f.addLeaf('sans/compose.yaml'); f.workspace.activeLeaf = yaml;
        await start(f); assert.equal(f.workspace.splits.length, 0);
        f.app.vault.adapter.stat = async () => ({ type: 'folder' });
        await f.settle(); assert.equal(f.workspace.splits.length, 0);
    });

    test(`${label} : passage sur un YAML sans .env ferme le panneau précédent`, async t => {
        const f = fixture(PluginClass); t.after(f.cleanup);
        f.files.set('a/.env', 'A=1'); const a = f.addLeaf('a/compose.yaml');
        const absent = f.addLeaf('sans/compose.yaml'); f.workspace.activeLeaf = a;
        await start(f); const env = f.plugin.envCompanion.leaf;
        f.workspace.setActiveLeaf(absent); await f.settle();
        assert.equal(env.detached, true); assert.equal(f.plugin.envCompanion.leaf, null);
    });

    test(`${label} : deux YAML du même dossier conservent les modifications non enregistrées`, async t => {
        const f = fixture(PluginClass); t.after(f.cleanup);
        f.files.set('a/.env', 'A=1'); const a = f.addLeaf('a/first.yaml');
        const b = f.addLeaf('a/second.YML'); f.workspace.activeLeaf = a;
        await start(f); const env = f.plugin.envCompanion.leaf;
        env.view.editor.value = 'A=unsaved';
        f.workspace.setActiveLeaf(b); await f.settle();
        assert.equal(env.view.editor.value, 'A=unsaved');
        assert.equal(env.getViewState().state.envSourcePath, 'a/second.YML');
        assert.equal(f.workspace.splits.length, 1);
    });

    test(`${label} : changement rapide pendant la recherche du .env`, async t => {
        const f = fixture(PluginClass); t.after(f.cleanup);
        const begun = deferred(); const result = deferred();
        f.files.set('a/.env', 'A=1'); f.files.set('b/.env', 'B=2');
        const a = f.addLeaf('a/compose.yaml'); const b = f.addLeaf('b/compose.yaml');
        f.app.vault.adapter.stat = async path => {
            if (path === 'a/.env') { begun.resolve(); return result.promise; }
            return { type: 'file' };
        };
        f.workspace.activeLeaf = a; await f.plugin.onload();
        for (const callback of f.callbacks) callback();
        const running = f.settle(); await begun.promise;
        f.workspace.setActiveLeaf(b); result.resolve({ type: 'file' }); await running;
        assert.equal(f.workspace.splits.length, 1);
        assert.equal(f.plugin.envCompanion.leaf.getViewState().state.file, 'b/.env');
    });

    test(`${label} : quitter le YAML pendant la recherche n'ouvre aucun onglet`, async t => {
        const f = fixture(PluginClass); t.after(f.cleanup);
        const begun = deferred(); const result = deferred();
        const yaml = f.addLeaf('compose.yaml'); const md = f.addLeaf('note.md', 'markdown');
        f.app.vault.adapter.stat = async () => { begun.resolve(); return result.promise; };
        f.workspace.activeLeaf = yaml; await f.plugin.onload();
        for (const callback of f.callbacks) callback();
        const running = f.settle(); await begun.promise;
        f.workspace.setActiveLeaf(md); result.resolve({ type: 'file' }); await running;
        assert.equal(f.workspace.splits.length, 0); assert.equal(f.workspace.activeLeaf, md);
    });

    test(`${label} : panneau restauré après redémarrage, sans split supplémentaire`, async t => {
        const f = fixture(PluginClass); t.after(f.cleanup);
        f.files.set('a/.env', 'A=1'); const yaml = f.addLeaf('a/compose.yaml');
        const env = f.addLeaf('a/.env');
        env.state.state = { file: 'a/.env', autoEnvCompanion: true, envSourcePath: 'a/compose.yaml' };
        f.workspace.activeLeaf = env;
        await start(f);
        assert.equal(f.plugin.envCompanion.leaf, env);
        assert.equal(f.workspace.splits.length, 0); assert.equal(f.workspace.activeLeaf, env);
        assert.equal(env.view.editor.value, 'A=1');
    });

    test(`${label} : changement de YAML pendant le chargement, aucun contenu écrit dans le mauvais .env`, async t => {
        const f = fixture(PluginClass); t.after(f.cleanup);
        const begun = deferred(); const result = deferred();
        f.files.set('a/.env', 'A=1'); f.files.set('b/.env', 'B=2');
        const a = f.addLeaf('a/compose.yaml'); const b = f.addLeaf('b/compose.yml');
        f.app.vault.adapter.read = async path => {
            if (path === 'a/.env') { begun.resolve(); return result.promise; }
            return f.files.get(path);
        };
        f.workspace.activeLeaf = a; await f.plugin.onload();
        for (const callback of f.callbacks) callback();
        const running = f.settle(); await begun.promise;
        f.workspace.setActiveLeaf(b); result.resolve('A=1'); await running;
        const env = f.plugin.envCompanion.leaf;
        assert.equal(env.getViewState().state.file, 'b/.env');
        assert.equal(env.view.editor.value, 'B=2');
        assert.equal(f.files.get('a/.env'), 'A=1');
        assert.equal(f.files.get('b/.env'), 'B=2');
        assert.equal(f.workspace.splits.length, 1);
    });

    test(`${label} : passage sur Markdown pendant le chargement ferme le panneau`, async t => {
        const f = fixture(PluginClass); t.after(f.cleanup);
        const begun = deferred(); const result = deferred();
        f.files.set('.env', 'A=1');
        const yaml = f.addLeaf('compose.yaml'); const md = f.addLeaf('note.md', 'markdown');
        f.app.vault.adapter.read = async () => { begun.resolve(); return result.promise; };
        f.workspace.activeLeaf = yaml; await f.plugin.onload();
        for (const callback of f.callbacks) callback();
        const running = f.settle(); await begun.promise;
        const env = f.plugin.envCompanion.leaf;
        f.workspace.setActiveLeaf(md); result.resolve('A=1'); await running;
        assert.equal(env.detached, true); assert.equal(f.workspace.activeLeaf, md);
        assert.equal(f.plugin.envCompanion.leaf, null);
    });

    test(`${label} : un panneau réutilisé manuellement pour un autre fichier reste ouvert`, async t => {
        const f = fixture(PluginClass); t.after(f.cleanup);
        f.files.set('.env', 'A=1');
        const yaml = f.addLeaf('compose.yaml'); f.workspace.activeLeaf = yaml;
        await start(f); const env = f.plugin.envCompanion.leaf;
        env.state = { type: 'markdown', state: { file: 'note.md' } };
        env.view = { getViewType: () => 'markdown' };
        f.workspace.setActiveLeaf(env); await f.settle();
        assert.equal(env.detached, false); assert.equal(f.workspace.activeLeaf, env);
        assert.equal(f.plugin.envCompanion.leaf, null);
    });

    test(`${label} : fermeture manuelle respectée jusqu'au changement de YAML`, async t => {
        const f = fixture(PluginClass); t.after(f.cleanup);
        f.files.set('.env', 'A=1'); const a = f.addLeaf('a.yaml'); const b = f.addLeaf('b.yaml');
        f.workspace.activeLeaf = a; await start(f);
        f.plugin.envCompanion.leaf.detach(); await f.settle();
        assert.equal(f.workspace.splits.length, 1); assert.equal(f.plugin.envCompanion.leaf, null);
        f.workspace.setActiveLeaf(b); await f.settle(); assert.equal(f.workspace.splits.length, 2);
    });

    test(`${label} : clics répétés dans l'éditeur YAML ne dupliquent pas le panneau .env`, async t => {
        const f = fixture(PluginClass); t.after(f.cleanup);
        f.files.set('.env', 'A=1'); const yaml = f.addLeaf('compose.yaml');
        f.workspace.activeLeaf = yaml; await start(f);
        const env = f.plugin.envCompanion.leaf;
        assert.equal(f.workspace.splits.length, 1);
        // Simuler 50 clics dans l'éditeur YAML
        for (let i = 0; i < 50; i++) {
            f.workspace.setActiveLeaf(yaml);
            await f.settle();
        }
        assert.equal(f.workspace.splits.length, 1);
        assert.equal(f.plugin.envCompanion.leaf, env);
    });

    test(`${label} : fermeture manuelle respectée malgré clics répétés dans le YAML`, async t => {
        const f = fixture(PluginClass); t.after(f.cleanup);
        f.files.set('.env', 'A=1'); const a = f.addLeaf('a.yaml'); const b = f.addLeaf('b.yaml');
        f.workspace.activeLeaf = a; await start(f);
        assert.equal(f.workspace.splits.length, 1);
        // Fermeture manuelle de .env
        f.plugin.envCompanion.leaf.detach(); await f.settle();
        assert.equal(f.plugin.envCompanion.leaf, null);
        assert.equal(f.workspace.splits.length, 1);
        // Clics répétés dans a.yaml ne doivent pas ré-ouvrir .env
        for (let i = 0; i < 20; i++) {
            f.workspace.setActiveLeaf(a);
            await f.settle();
        }
        assert.equal(f.plugin.envCompanion.leaf, null);
        assert.equal(f.workspace.splits.length, 1);
        // Changer de fichier YAML ré-active l'ouverture automatique
        f.workspace.setActiveLeaf(b); await f.settle();
        assert.equal(f.workspace.splits.length, 2);
        assert.notEqual(f.plugin.envCompanion.leaf, null);
    });

    test(`${label} : réglage désactivé ferme le panneau et bloque son ouverture`, async t => {
        const f = fixture(PluginClass); t.after(f.cleanup);
        f.files.set('.env', 'A=1'); const yaml = f.addLeaf('compose.yaml');
        f.workspace.activeLeaf = yaml; await start(f); const env = f.plugin.envCompanion.leaf;
        f.plugin.settings.autoOpenEnvWithYaml = false; await f.settle();
        assert.equal(env.detached, true); await f.settle(); assert.equal(f.workspace.splits.length, 1);
        f.plugin.settings.autoOpenEnvWithYaml = true; await f.settle(); assert.equal(f.workspace.splits.length, 2);
    });
}
