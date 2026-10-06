const test = require('node:test');
const assert = require('node:assert/strict');
const { variants, fixture, TFile } = require('./obsidianMock.cjs');

for (const [label, PluginClass] of variants) {
    test(`${label} : création de note test.js.md renommée automatiquement en test.js sans .md`, async t => {
        const f = fixture(PluginClass);
        t.after(f.cleanup);
        await f.plugin.onload();

        let renamedFrom = null;
        let renamedTo = null;
        let isRenamed = false;

        f.app.fileManager = {
            renameFile: async (file, newPath) => {
                renamedFrom = file.path;
                renamedTo = newPath;
                file.name = newPath.split('/').pop();
                file.path = newPath;
                isRenamed = true;
            }
        };

        const file = new TFile('test.js.md');
        file.parent = { path: '/' };
        f.app.vault.getAbstractFileByPath = (path) => {
            if (path === 'test.js' && isRenamed) return file;
            return null;
        };

        let openedInDevEditor = null;
        f.plugin.openInDevEditor = async (targetFile) => {
            openedInDevEditor = targetFile;
        };

        // Simulate Obsidian vault "create" event
        f.app.vault.emit('create', file);

        // Wait for async handler
        await new Promise(r => setTimeout(r, 60));

        assert.equal(renamedTo, 'test.js');
        assert.equal(openedInDevEditor, file);
        assert(f.plugin.settings.extensions.includes('js'));
    });

    test(`${label} : note Markdown normale note.md conserve son extension .md`, async t => {
        const f = fixture(PluginClass);
        t.after(f.cleanup);
        await f.plugin.onload();

        let renamed = false;
        f.app.fileManager = {
            renameFile: async () => { renamed = true; }
        };

        const file = new TFile('note.md');
        file.parent = { path: '/' };

        f.app.vault.emit('create', file);
        await new Promise(r => setTimeout(r, 60));

        assert.equal(renamed, false);
    });

    test(`${label} : sous-dossier src/test.py.md renommé en src/test.py`, async t => {
        const f = fixture(PluginClass);
        t.after(f.cleanup);
        await f.plugin.onload();

        let renamedTo = null;
        let isRenamed = false;
        f.app.fileManager = {
            renameFile: async (file, newPath) => {
                renamedTo = newPath;
                file.name = newPath.split('/').pop();
                file.path = newPath;
                isRenamed = true;
            }
        };

        const file = new TFile('src/test.py.md');
        file.parent = { path: 'src' };
        f.app.vault.getAbstractFileByPath = (path) => {
            if (path === 'src/test.py' && isRenamed) return file;
            return null;
        };
        f.plugin.openInDevEditor = async () => {};

        f.app.vault.emit('rename', file);
        await new Promise(r => setTimeout(r, 60));

        assert.equal(renamedTo, 'src/test.py');
        assert(f.plugin.settings.extensions.includes('py'));
    });

    test(`${label} : createFile avec targetFolder crée le fichier dans ce dossier`, async t => {
        const f = fixture(PluginClass);
        t.after(f.cleanup);
        await f.plugin.onload();

        let createdPath = null;
        f.app.vault.create = async (path, content) => {
            createdPath = path;
            const file = new TFile(path);
            return file;
        };
        f.plugin.openInDevEditor = async () => {};

        await f.plugin.createFile('docker-compose.yml', 'deploy/server');
        assert.equal(createdPath, 'deploy/server/docker-compose.yml');
    });

    test(`${label} : addExtension ajoute et normalise une nouvelle extension`, async t => {
        const f = fixture(PluginClass);
        t.after(f.cleanup);
        await f.plugin.onload();

        await f.plugin.addExtension('.prisma');
        assert(f.plugin.settings.extensions.includes('prisma'));

        // Ignorer .md
        await f.plugin.addExtension('md');
        assert(!f.plugin.settings.extensions.includes('md'));
    });
}
