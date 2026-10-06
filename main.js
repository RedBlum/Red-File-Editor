var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// src/constants.js
var require_constants = __commonJS({
  "src/constants.js"(exports2, module2) {
    var VIEW_TYPE_DEV_FILE2 = "dev-file-editor-view";
    var DEFAULT_EXTENSIONS2 = [
      "env",
      "example",
      "txt",
      "text",
      "log",
      "yml",
      "yaml",
      "json",
      "jsonc",
      "conf",
      "config",
      "cfg",
      "ini",
      "toml",
      "properties",
      "sh",
      "bash",
      "zsh",
      "js",
      "jsx",
      "ts",
      "tsx",
      "py",
      "php",
      "rb",
      "go",
      "rs",
      "java",
      "c",
      "cpp",
      "h",
      "hpp",
      "html",
      "htm",
      "css",
      "scss",
      "xml",
      "csv",
      "sql"
    ];
    module2.exports = { VIEW_TYPE_DEV_FILE: VIEW_TYPE_DEV_FILE2, DEFAULT_EXTENSIONS: DEFAULT_EXTENSIONS2 };
  }
});

// src/editor/fileTypes.js
var require_fileTypes = __commonJS({
  "src/editor/fileTypes.js"(exports2, module2) {
    var { TFile: TFile2 } = require("obsidian");
    function isDotFile2(file) {
      if (!(file instanceof TFile2)) {
        return false;
      }
      return file.name.startsWith(".") && file.name.length > 1;
    }
    function getTypeLabelFromFile(file) {
      if (!(file instanceof TFile2)) {
        return "TEXT";
      }
      return getTypeLabelFromName(file.name);
    }
    function getTypeLabelFromName(filename) {
      const name = String(filename || "").toLowerCase();
      if (name === ".env" || name.startsWith(".env.")) {
        return "ENV";
      }
      if (name === ".gitignore") {
        return "GIT";
      }
      if (name === ".npmrc") {
        return "NPM";
      }
      if (name === ".bashrc") {
        return "BASH";
      }
      if (name === ".zshrc") {
        return "ZSH";
      }
      let extension = "";
      const lastDot = name.lastIndexOf(".");
      if (lastDot >= 0 && lastDot < name.length - 1) {
        extension = name.substring(lastDot + 1);
      }
      const labels = {
        env: "ENV",
        example: "EXAMPLE",
        yml: "YAML",
        yaml: "YAML",
        json: "JSON",
        jsonc: "JSON",
        txt: "TEXT",
        text: "TEXT",
        log: "LOG",
        conf: "CONF",
        config: "CONF",
        cfg: "CONF",
        ini: "INI",
        toml: "TOML",
        properties: "PROPERTIES",
        sh: "SHELL",
        bash: "BASH",
        zsh: "ZSH",
        js: "JAVASCRIPT",
        jsx: "JSX",
        ts: "TYPESCRIPT",
        tsx: "TSX",
        py: "PYTHON",
        php: "PHP",
        rb: "RUBY",
        go: "GO",
        rs: "RUST",
        java: "JAVA",
        c: "C",
        cpp: "C++",
        h: "C HEADER",
        hpp: "C++ HEADER",
        html: "HTML",
        htm: "HTML",
        css: "CSS",
        scss: "SCSS",
        xml: "XML",
        csv: "CSV",
        sql: "SQL"
      };
      return labels[extension] || extension.toUpperCase() || "TEXT";
    }
    module2.exports = { isDotFile: isDotFile2, getTypeLabelFromFile, getTypeLabelFromName };
  }
});

// src/editor/patterns.js
var require_patterns = __commonJS({
  "src/editor/patterns.js"(exports2, module2) {
    function getPatterns(type) {
      const common = [
        {
          regex: /^\$\{[A-Za-z_][A-Za-z0-9_]*\}/,
          className: "tok-variable"
        },
        {
          regex: /^"(?:\\.|[^"\\])*"/,
          className: "tok-string"
        },
        {
          regex: /^'(?:\\.|[^'\\])*'/,
          className: "tok-string"
        },
        {
          regex: /^`(?:\\.|[^`\\])*`/,
          className: "tok-string"
        },
        {
          regex: /^\b(?:true|false|null|yes|no|on|off)\b/i,
          className: "tok-boolean"
        },
        {
          regex: /^-?\b\d+(?:\.\d+)?\b/,
          className: "tok-number"
        }
      ];
      switch (type) {
        case "ENV":
          return [
            {
              regex: /^#[^\n]*/,
              className: "tok-comment"
            },
            {
              regex: /^[A-Za-z_][A-Za-z0-9_]*(?=\s*=)/,
              className: "tok-key"
            },
            {
              regex: /^=/,
              className: "tok-punctuation"
            },
            ...common
          ];
        case "YAML":
          return [
            {
              regex: /^#[^\n]*/,
              className: "tok-comment"
            },
            {
              regex: /^[A-Za-z0-9_.-]+(?=\s*:)/,
              className: "tok-key"
            },
            {
              regex: /^[-?:,[\]{}]/,
              className: "tok-punctuation"
            },
            ...common
          ];
        case "JSON":
          return [
            {
              regex: /^"(?:\\.|[^"\\])*"(?=\s*:)/,
              className: "tok-key"
            },
            {
              regex: /^[{}\[\],:]/,
              className: "tok-punctuation"
            },
            ...common
          ];
        case "JAVASCRIPT":
        case "JSX":
        case "TYPESCRIPT":
        case "TSX":
          return [
            {
              regex: /^\/\/[^\n]*/,
              className: "tok-comment"
            },
            {
              regex: /^\/\*.*?\*\//,
              className: "tok-comment"
            },
            {
              regex: /^\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|new|this|async|await|try|catch|finally|throw|import|from|export|default|typeof|instanceof|in|of|interface|type|enum|implements|public|private|protected|static)\b/,
              className: "tok-keyword"
            },
            ...common
          ];
        case "PYTHON":
          return [
            {
              regex: /^#[^\n]*/,
              className: "tok-comment"
            },
            {
              regex: /^\b(?:def|class|return|if|elif|else|for|while|break|continue|import|from|as|try|except|finally|raise|with|lambda|yield|async|await|pass|in|is|not|and|or|None|True|False)\b/,
              className: "tok-keyword"
            },
            ...common
          ];
        case "SHELL":
        case "BASH":
        case "ZSH":
          return [
            {
              regex: /^#[^\n]*/,
              className: "tok-comment"
            },
            {
              regex: /^\$[A-Za-z_][A-Za-z0-9_]*/,
              className: "tok-variable"
            },
            {
              regex: /^\b(?:if|then|else|elif|fi|for|while|do|done|case|esac|function|in|export|local|readonly|source)\b/,
              className: "tok-keyword"
            },
            ...common
          ];
        case "INI":
        case "CONF":
        case "PROPERTIES":
        case "TOML":
          return [
            {
              regex: /^[#;][^\n]*/,
              className: "tok-comment"
            },
            {
              regex: /^\[[^\]]+\]/,
              className: "tok-section"
            },
            {
              regex: /^[A-Za-z0-9_.-]+(?=\s*[=:])/,
              className: "tok-key"
            },
            ...common
          ];
        case "CSS":
        case "SCSS":
          return [
            {
              regex: /^\/\*.*?\*\//,
              className: "tok-comment"
            },
            {
              regex: /^--[A-Za-z0-9_-]+(?=\s*:)/,
              className: "tok-variable"
            },
            {
              regex: /^[A-Za-z-]+(?=\s*:)/,
              className: "tok-key"
            },
            ...common
          ];
        case "HTML":
        case "XML":
          return [
            {
              regex: /^<!--.*?-->/,
              className: "tok-comment"
            },
            {
              regex: /^<\/?[A-Za-z][A-Za-z0-9:_-]*/,
              className: "tok-keyword"
            },
            {
              regex: /^[A-Za-z_:][-A-Za-z0-9_:.]*(?=\s*=)/,
              className: "tok-key"
            },
            ...common
          ];
        case "SQL":
          return [
            {
              regex: /^--[^\n]*/,
              className: "tok-comment"
            },
            {
              regex: /^\b(?:select|from|where|insert|into|update|delete|create|drop|alter|table|join|left|right|inner|outer|on|as|and|or|not|null|values|set|group|by|order|having|limit|offset|distinct|union)\b/i,
              className: "tok-keyword"
            },
            ...common
          ];
        default:
          return [
            {
              regex: /^#[^\n]*/,
              className: "tok-comment"
            },
            {
              regex: /^\/\/[^\n]*/,
              className: "tok-comment"
            },
            ...common
          ];
      }
    }
    module2.exports = { getPatterns };
  }
});

// src/editor/highlight.js
var require_highlight = __commonJS({
  "src/editor/highlight.js"(exports2, module2) {
    var { getPatterns } = require_patterns();
    function highlightCode(source, type) {
      const lines = source.split("\n");
      return lines.map(
        (line) => highlightLine(
          line,
          type
        )
      ).join("\n") + "\n";
    }
    function highlightLine(line, type) {
      const patterns = getPatterns(type);
      let output = "";
      let position = 0;
      while (position < line.length) {
        const remaining = line.slice(position);
        let best = null;
        for (const pattern of patterns) {
          const match = remaining.match(
            pattern.regex
          );
          if (!match || match.index !== 0 || !match[0]) {
            continue;
          }
          best = {
            text: match[0],
            className: pattern.className
          };
          break;
        }
        if (best) {
          output += `<span class="${best.className}">${escapeHtml(best.text)}</span>`;
          position += best.text.length;
        } else {
          output += escapeHtml(
            line[position]
          );
          position++;
        }
      }
      return output;
    }
    function escapeHtml(value) {
      return value.replace(
        /&/g,
        "&amp;"
      ).replace(
        /</g,
        "&lt;"
      ).replace(
        />/g,
        "&gt;"
      ).replace(
        /"/g,
        "&quot;"
      ).replace(
        /'/g,
        "&#039;"
      );
    }
    module2.exports = { highlightCode, highlightLine, escapeHtml };
  }
});

// src/views/DevFileView.js
var require_DevFileView = __commonJS({
  "src/views/DevFileView.js"(exports2, module2) {
    var { ItemView, TFile: TFile2, Notice: Notice2 } = require("obsidian");
    var { VIEW_TYPE_DEV_FILE: VIEW_TYPE_DEV_FILE2 } = require_constants();
    var { getTypeLabelFromName } = require_fileTypes();
    var { highlightCode } = require_highlight();
    var DevFileView2 = class extends ItemView {
      constructor(leaf) {
        super(leaf);
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
        return VIEW_TYPE_DEV_FILE2;
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
        const newPath = state && typeof state.file === "string" ? state.file : "";
        const pathChanged = newPath !== this.filePath;
        this.filePath = newPath;
        this.file = this.filePath ? this.app.vault.getAbstractFileByPath(this.filePath) : null;
        if (!(this.file instanceof TFile2)) {
          this.file = null;
        }
        if (pathChanged) {
          await this.loadCurrentPath();
        }
      }
      async loadCurrentPath() {
        if (!this.filePath || !this.editor || this.loadingPath) {
          return;
        }
        this.loadingPath = true;
        try {
          const data = await this.app.vault.adapter.read(
            this.filePath
          );
          this.editor.value = data;
          this.refreshHeader();
          this.renderEditor();
        } catch (error) {
          console.error(
            "[Dev File Editor] Impossible de lire",
            this.filePath,
            error
          );
          new Notice2(
            `Impossible de lire : ${this.filePath}`
          );
        } finally {
          this.loadingPath = false;
        }
      }
      requestSave() {
        this.setSaveStatus("saving");
        if (this.saveTimer) {
          clearTimeout(this.saveTimer);
        }
        this.saveTimer = setTimeout(
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
        if (!this.filePath || !this.editor || this.loadingPath) {
          return;
        }
        try {
          await this.app.vault.adapter.write(
            this.filePath,
            this.editor.value
          );
          this.setSaveStatus("saved");
        } catch (error) {
          console.error(
            "[Dev File Editor] Impossible d'\xE9crire",
            this.filePath,
            error
          );
          this.setSaveStatus("error");
          new Notice2(
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
        const header = this.contentEl.createDiv({
          cls: "dev-file-editor-header"
        });
        const headerLeft = header.createDiv({
          cls: "dev-file-editor-header-left"
        });
        this.filenameEl = headerLeft.createDiv({
          cls: "dev-file-editor-filename"
        });
        this.languageEl = headerLeft.createDiv({
          cls: "dev-file-editor-language"
        });
        const headerActions = header.createDiv({
          cls: "dev-file-editor-header-actions"
        });
        this.copyButtonEl = headerActions.createEl("button", {
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
              if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
                await navigator.clipboard.writeText(this.editor.value);
              }
              this.copyButtonEl.setText("Copi\xE9 !");
              new Notice2("Contenu copi\xE9 dans le presse-papiers.");
              setTimeout(() => {
                if (this.copyButtonEl) {
                  this.copyButtonEl.setText("Copier");
                }
              }, 1500);
            } catch (e) {
              new Notice2("Impossible de copier le contenu.");
            }
          }
        );
        const body = this.contentEl.createDiv({
          cls: "dev-code-editor"
        });
        this.lineNumbersEl = body.createEl(
          "pre",
          {
            cls: "dev-code-line-numbers",
            attr: {
              "aria-hidden": "true"
            }
          }
        );
        const viewport = body.createDiv({
          cls: "dev-code-viewport"
        });
        this.highlightEl = viewport.createEl(
          "pre",
          {
            cls: "dev-code-highlight",
            attr: {
              "aria-hidden": "true"
            }
          }
        );
        this.editor = viewport.createEl(
          "textarea",
          {
            cls: "dev-code-input"
          }
        );
        this.editor.spellcheck = false;
        this.editor.wrap = "off";
        const footer = this.contentEl.createDiv({
          cls: "dev-file-editor-statusbar"
        });
        this.statusEl = footer.createDiv({
          cls: "dev-file-editor-status"
        });
        this.saveStatusEl = footer.createDiv({
          cls: "dev-file-editor-save-status"
        });
        this.setSaveStatus("saved");
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
          (event) => {
            this.handleKeyDown(event);
          }
        );
        this.refreshHeader();
        this.renderEditor();
        await this.loadCurrentPath();
      }
      setViewData(data, clear) {
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
        const name = this.filePath.split("/").pop() || this.filePath;
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
        if (!this.editor || !this.highlightEl || !this.lineNumbersEl) {
          return;
        }
        const value = this.editor.value;
        const type = this.filePath ? getTypeLabelFromName(
          this.filePath.split("/").pop() || this.filePath
        ) : "TEXT";
        this.highlightEl.innerHTML = highlightCode(
          value,
          type
        );
        const lineCount = Math.max(
          1,
          value.split("\n").length
        );
        let numbers = "";
        for (let i = 1; i <= lineCount; i++) {
          numbers += `${i}
`;
        }
        this.lineNumbersEl.textContent = numbers;
        this.syncScroll();
        this.updateStatus();
      }
      syncScroll() {
        if (!this.editor || !this.highlightEl || !this.lineNumbersEl) {
          return;
        }
        this.highlightEl.style.transform = `translate(${-this.editor.scrollLeft}px, ${-this.editor.scrollTop}px)`;
        this.lineNumbersEl.style.transform = `translateY(${-this.editor.scrollTop}px)`;
      }
      updateStatus() {
        if (!this.editor || !this.statusEl) {
          return;
        }
        const position = this.editor.selectionStart;
        const before = this.editor.value.slice(
          0,
          position
        );
        const lines = before.split("\n");
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;
        const totalLines = Math.max(
          1,
          this.editor.value.split("\n").length
        );
        this.statusEl.setText(
          `Ln ${line}, Col ${column}  \u2022  ${totalLines} ligne${totalLines > 1 ? "s" : ""}`
        );
      }
      async handleKeyDown(event) {
        if (!this.editor) {
          return;
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
          event.preventDefault();
          await this.saveNow();
          const name = this.filePath.split("/").pop() || this.filePath;
          new Notice2(`Enregistr\xE9 : ${name}`);
          return;
        }
        if (event.key === "Tab") {
          event.preventDefault();
          if (event.shiftKey) {
            this.unindentSelection();
          } else {
            this.indentSelection();
          }
          this.renderEditor();
          this.requestSave();
          return;
        }
        if (event.key === "Enter") {
          const start = this.editor.selectionStart;
          const before = this.editor.value.slice(
            0,
            start
          );
          const currentLine = before.split("\n").pop() || "";
          const indentation = currentLine.match(
            /^[\t ]*/
          )[0];
          if (indentation) {
            event.preventDefault();
            this.replaceSelection(
              `
${indentation}`
            );
            this.renderEditor();
            this.requestSave();
          }
        }
      }
      replaceSelection(text) {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        this.editor.setRangeText(
          text,
          start,
          end,
          "end"
        );
      }
      indentSelection() {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        if (start === end) {
          this.editor.setRangeText(
            "    ",
            start,
            end,
            "end"
          );
          return;
        }
        const value = this.editor.value;
        const lineStart = value.lastIndexOf(
          "\n",
          start - 1
        ) + 1;
        const block = value.slice(
          lineStart,
          end
        );
        const indented = block.split("\n").map(
          (line) => `    ${line}`
        ).join("\n");
        this.editor.setRangeText(
          indented,
          lineStart,
          end,
          "select"
        );
      }
      unindentSelection() {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const value = this.editor.value;
        const lineStart = value.lastIndexOf(
          "\n",
          start - 1
        ) + 1;
        const block = value.slice(
          lineStart,
          end
        );
        const unindented = block.split("\n").map(
          (line) => {
            if (line.startsWith(
              "    "
            )) {
              return line.slice(4);
            }
            if (line.startsWith(
              "	"
            )) {
              return line.slice(1);
            }
            return line;
          }
        ).join("\n");
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
        const label = this.saveStatusEl.createSpan({
          cls: "dev-save-label"
        });
        if (status === "saving") {
          label.setText("Enregistrement...");
        } else if (status === "saved") {
          label.setText("Enregistr\xE9");
        } else if (status === "error") {
          label.setText("Erreur");
        }
      }
    };
    module2.exports = { DevFileView: DevFileView2 };
  }
});

// src/modals/CreateFileModal.js
var require_CreateFileModal = __commonJS({
  "src/modals/CreateFileModal.js"(exports2, module2) {
    var { Modal, Setting, Notice: Notice2 } = require("obsidian");
    var CreateFileModal2 = class extends Modal {
      constructor(app, plugin, targetFolder = null) {
        super(app);
        this.plugin = plugin;
        this.targetFolder = targetFolder;
        this.filename = "";
      }
      onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h2", {
          text: "Cr\xE9er un fichier"
        });
        contentEl.createEl("p", {
          text: "Sans extension \u2192 .md | Avec extension \u2192 extension conserv\xE9e"
        });
        if (this.targetFolder) {
          contentEl.createEl("p", {
            cls: "setting-item-description",
            text: `Dossier cible : ${this.targetFolder}/`
          });
        }
        new Setting(contentEl).setName("Nom du fichier").setDesc("Exemples : Note serveur, .env, docker-compose.yml, nginx.conf").addText((text) => {
          text.setPlaceholder("docker-compose.yml").onChange((value) => {
            this.filename = value.trim();
          });
          text.inputEl.addEventListener(
            "keydown",
            async (event) => {
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
        new Setting(contentEl).addButton((button) => {
          button.setButtonText("Cr\xE9er").setCta().onClick(async () => {
            await this.create();
          });
        });
      }
      async create() {
        if (!this.filename) {
          new Notice2("Veuillez saisir un nom.");
          return;
        }
        this.close();
        await this.plugin.createFile(this.filename, this.targetFolder);
      }
      onClose() {
        this.contentEl.empty();
      }
    };
    module2.exports = { CreateFileModal: CreateFileModal2 };
  }
});

// src/modals/ChangeExtensionModal.js
var require_ChangeExtensionModal = __commonJS({
  "src/modals/ChangeExtensionModal.js"(exports2, module2) {
    var { Modal, Setting } = require("obsidian");
    var ChangeExtensionModal2 = class extends Modal {
      constructor(app, plugin, file) {
        super(app);
        this.plugin = plugin;
        this.file = file;
        this.extension = "";
      }
      onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h2", {
          text: "Changer l'extension"
        });
        contentEl.createEl("p", {
          text: `Fichier : ${this.file.name}`
        });
        new Setting(contentEl).setName("Nouvelle extension").setDesc("Exemples : env, txt, yaml, conf").addText((text) => {
          const currentExtension = "." + this.plugin.getExtension(
            this.file.name
          );
          text.setPlaceholder(
            currentExtension
          ).onChange((value) => {
            this.extension = value.trim();
          });
          setTimeout(
            () => text.inputEl.focus(),
            50
          );
        });
        new Setting(contentEl).addButton((button) => {
          button.setButtonText("Renommer").setCta().onClick(async () => {
            if (!this.extension) {
              return;
            }
            this.close();
            await this.plugin.changeExtension(
              this.file,
              this.extension
            );
          });
        });
      }
      onClose() {
        this.contentEl.empty();
      }
    };
    module2.exports = { ChangeExtensionModal: ChangeExtensionModal2 };
  }
});

// src/settings/DevFileEditorSettingTab.js
var require_DevFileEditorSettingTab = __commonJS({
  "src/settings/DevFileEditorSettingTab.js"(exports2, module2) {
    var { PluginSettingTab, Setting, Notice: Notice2 } = require("obsidian");
    var { DEFAULT_EXTENSIONS: DEFAULT_EXTENSIONS2 } = require_constants();
    var DevFileEditorSettingTab2 = class extends PluginSettingTab {
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
        containerEl.createEl("h3", {
          text: "\xC9diteur de code"
        });
        new Setting(containerEl).setName("Largeur de l'\xE9diteur").setDesc(
          "R\xE8gle la largeur du bloc d'\xE9dition (50% \xE0 100%). La modification est appliqu\xE9e imm\xE9diatement."
        ).addSlider((slider) => {
          slider.setLimits(50, 100, 1).setValue(this.plugin.getEditorWidthPercent()).setDynamicTooltip().onChange(async (value) => {
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
        containerEl.createEl("h3", {
          text: "Compagnon .env"
        });
        new Setting(containerEl).setName("Ouvrir automatiquement le .env avec les fichiers YAML").setDesc(
          "Affiche automatiquement le fichier .env du m\xEAme dossier dans un panneau vertical \xE0 droite lors de l'ouverture d'un fichier .yaml ou .yml."
        ).addToggle((toggle) => {
          toggle.setValue(this.plugin.settings.autoOpenEnvWithYaml !== false).onChange(async (value) => {
            this.plugin.settings.autoOpenEnvWithYaml = value;
            await this.plugin.saveSettings();
            if (this.plugin.envCompanion) {
              this.plugin.envCompanion.schedule();
            }
          });
        });
        containerEl.createEl("h3", {
          text: "Extensions de fichiers prises en charge"
        });
        const extensionsDesc = containerEl.createEl("p", {
          cls: "setting-item-description"
        });
        extensionsDesc.setText(
          "Les fichiers dotfiles (.env, .gitignore, etc.) sont toujours pris en charge. Les extensions ci-dessous sont \xE9dit\xE9es dans l'\xE9diteur de code sans ajouter le suffixe .md."
        );
        let newExtInput = "";
        new Setting(containerEl).setName("Ajouter une extension").setDesc("Saisissez une extension sans point (ex: env.local, prisma, proto)").addText((text) => {
          text.setPlaceholder("ex: prisma").onChange((val) => {
            newExtInput = val.trim().toLowerCase().replace(/^\./, "");
          });
          text.inputEl.addEventListener("keydown", async (event) => {
            if (event.key === "Enter" && newExtInput) {
              event.preventDefault();
              await this.addExtension(newExtInput);
            }
          });
        }).addButton((btn) => {
          btn.setButtonText("Ajouter").setCta().onClick(async () => {
            if (newExtInput) {
              await this.addExtension(newExtInput);
            } else {
              new Notice2("Veuillez saisir une extension valide.");
            }
          });
        });
        const badgesContainer = containerEl.createDiv({
          cls: "dev-extensions-list-container"
        });
        const currentExtensions = Array.isArray(this.plugin.settings.extensions) ? this.plugin.settings.extensions : [...DEFAULT_EXTENSIONS2];
        for (const ext of currentExtensions) {
          const badge = badgesContainer.createDiv({
            cls: "dev-extension-tag"
          });
          badge.createSpan({ text: `.${ext}` });
          const removeBtn = badge.createSpan({
            cls: "dev-extension-tag-remove",
            text: "\xD7"
          });
          removeBtn.setAttribute("title", `Supprimer .${ext}`);
          removeBtn.addEventListener("click", async () => {
            this.plugin.settings.extensions = this.plugin.settings.extensions.filter(
              (e) => e !== ext
            );
            await this.plugin.saveSettings();
            this.display();
            new Notice2(`Extension retir\xE9e : .${ext}`);
          });
        }
        new Setting(containerEl).setName("R\xE9initialiser les extensions par d\xE9faut").setDesc("R\xE9tablit la liste d'origine des extensions support\xE9es.").addButton((btn) => {
          btn.setButtonText("R\xE9initialiser").setWarning().onClick(async () => {
            this.plugin.settings.extensions = [...DEFAULT_EXTENSIONS2];
            await this.plugin.saveSettings();
            if (typeof this.plugin.registerSupportedExtensions === "function") {
              this.plugin.registerSupportedExtensions();
            }
            this.display();
            new Notice2("Extensions r\xE9initialis\xE9es aux valeurs par d\xE9faut.");
          });
        });
      }
      async addExtension(ext) {
        if (!ext || ext === "md") {
          new Notice2("Extension invalide ou non support\xE9e.");
          return;
        }
        if (this.plugin.settings.extensions.includes(ext)) {
          new Notice2(`L'extension .${ext} est d\xE9j\xE0 enregistr\xE9e.`);
          return;
        }
        if (typeof this.plugin.addExtension === "function") {
          await this.plugin.addExtension(ext);
        } else {
          this.plugin.settings.extensions.push(ext);
          await this.plugin.saveSettings();
        }
        this.display();
        new Notice2(`Extension ajout\xE9e : .${ext}`);
      }
    };
    module2.exports = { DevFileEditorSettingTab: DevFileEditorSettingTab2 };
  }
});

// src/workspace/openFiles.js
var require_openFiles = __commonJS({
  "src/workspace/openFiles.js"(exports2, module2) {
    var { TFile: TFile2, WorkspaceLeaf } = require("obsidian");
    var { VIEW_TYPE_DEV_FILE: VIEW_TYPE_DEV_FILE2 } = require_constants();
    var { isDotFile: isDotFile2 } = require_fileTypes();
    var openFileMethods2 = {
      async openInDevEditor(file, leaf = null) {
        if (!(file instanceof TFile2)) {
          return;
        }
        await this.openPathInDevEditor(
          file.path,
          leaf
        );
      },
      getOpenDevFileLeaf(path) {
        if (!path) {
          return null;
        }
        const leaves = this.app.workspace.getLeavesOfType(
          VIEW_TYPE_DEV_FILE2
        );
        return leaves.find((leaf) => {
          const viewState = leaf.getViewState();
          return viewState && viewState.state && viewState.state.file === path;
        }) || null;
      },
      async focusDevFileLeaf(leaf) {
        if (!leaf) {
          return;
        }
        if (typeof this.app.workspace.revealLeaf === "function") {
          await this.app.workspace.revealLeaf(leaf);
          return;
        }
        this.app.workspace.setActiveLeaf(
          leaf,
          { focus: true }
        );
      },
      async openPathInDevEditor(path, leaf = null) {
        if (!path) {
          return;
        }
        const existingLeaf = this.getOpenDevFileLeaf(path);
        if (existingLeaf) {
          await this.focusDevFileLeaf(
            existingLeaf
          );
          return;
        }
        if (!leaf) {
          leaf = this.app.workspace.getLeaf(false);
        }
        await leaf.setViewState({
          type: VIEW_TYPE_DEV_FILE2,
          active: true,
          state: {
            file: path
          }
        });
      },
      installExistingFileClickInterceptor() {
        const plugin = this;
        const onExplorerClickCapture = (event) => {
          if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
            return;
          }
          const target = event.target;
          if (!(target instanceof Element)) {
            return;
          }
          const title = target.closest(
            ".nav-file-title[data-path]"
          );
          if (!title) {
            return;
          }
          const path = title.getAttribute(
            "data-path"
          );
          if (!path) {
            return;
          }
          const name = path.split("/").pop() || path;
          const extension = plugin.getExtension(name);
          const handledByPlugin = name.startsWith(".") || extension && extension !== "md" && plugin.settings.extensions.includes(extension);
          if (!handledByPlugin) {
            return;
          }
          const existingLeaf = plugin.getOpenDevFileLeaf(path);
          if (!existingLeaf) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          void plugin.focusDevFileLeaf(
            existingLeaf
          );
        };
        document.addEventListener(
          "click",
          onExplorerClickCapture,
          true
        );
        this.register(() => {
          document.removeEventListener(
            "click",
            onExplorerClickCapture,
            true
          );
        });
      },
      installDotFileOpenHandler() {
        const prototype = WorkspaceLeaf.prototype;
        if (!prototype || typeof prototype.openFile !== "function") {
          console.warn(
            "[Dev File Editor] openFile introuvable."
          );
          return;
        }
        const originalOpenFile = prototype.openFile;
        const plugin = this;
        const patchedOpenFile = async function(file, openState) {
          if (file instanceof TFile2) {
            const extension = plugin.getExtension(
              file.name
            );
            const handledByPlugin = isDotFile2(file) || extension && extension !== "md" && plugin.settings.extensions.includes(extension);
            if (handledByPlugin) {
              const existingLeaf = plugin.getOpenDevFileLeaf(
                file.path
              );
              if (existingLeaf) {
                if (this !== existingLeaf && this.view && typeof this.view.getViewType === "function" && this.view.getViewType() === "empty" && typeof this.detach === "function") {
                  this.detach();
                }
                await plugin.focusDevFileLeaf(
                  existingLeaf
                );
                return;
              }
              await plugin.openInDevEditor(
                file,
                this
              );
              return;
            }
          }
          return originalOpenFile.call(
            this,
            file,
            openState
          );
        };
        prototype.openFile = patchedOpenFile;
        this.register(
          () => {
            if (prototype.openFile === patchedOpenFile) {
              prototype.openFile = originalOpenFile;
            }
          }
        );
      }
    };
    module2.exports = { openFileMethods: openFileMethods2 };
  }
});

// src/explorer/badges.js
var require_badges = __commonJS({
  "src/explorer/badges.js"(exports2, module2) {
    var { TFile: TFile2 } = require("obsidian");
    var { isDotFile: isDotFile2, getTypeLabelFromFile } = require_fileTypes();
    var badgeMethods2 = {
      installFileExplorerBadges() {
        this.scheduleExplorerBadgeUpdate();
        const observer = new MutationObserver(
          (mutations) => {
            if (this.badgeUpdateRunning) {
              return;
            }
            let relevant = false;
            for (const m of mutations) {
              if (m.target && m.target.classList && m.target.classList.contains("dev-file-explorer-badge")) {
                continue;
              }
              const allNodes = Array.from(m.addedNodes || []).concat(Array.from(m.removedNodes || []));
              const hasOnlyBadges = allNodes.length > 0 && allNodes.every(
                (node) => node.nodeType === 1 && node.classList.contains("dev-file-explorer-badge")
              );
              if (hasOnlyBadges) {
                continue;
              }
              if (m.target && m.target.closest && m.target.closest('.workspace-leaf-content[data-type="file-explorer"]')) {
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
        if (this.badgeUpdateTimer) {
          clearTimeout(
            this.badgeUpdateTimer
          );
        }
        this.badgeUpdateTimer = setTimeout(
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
          const titles = document.querySelectorAll(
            ".nav-file-title"
          );
          titles.forEach(
            (title) => {
              const oldBadge = title.querySelector(
                ".dev-file-explorer-badge"
              );
              const path = title.getAttribute(
                "data-path"
              );
              if (!path) {
                return;
              }
              const file = this.app.vault.getAbstractFileByPath(
                path
              );
              if (!(file instanceof TFile2)) {
                return;
              }
              if (!isDotFile2(file)) {
                return;
              }
              const label = getTypeLabelFromFile(file);
              if (!label) {
                return;
              }
              if (oldBadge) {
                if (oldBadge.textContent !== label) {
                  oldBadge.textContent = label;
                }
                return;
              }
              const badge = document.createElement(
                "span"
              );
              badge.className = "dev-file-explorer-badge";
              badge.textContent = label;
              title.appendChild(
                badge
              );
            }
          );
        } finally {
          this.badgeUpdateRunning = false;
        }
      }
    };
    module2.exports = { badgeMethods: badgeMethods2 };
  }
});

// src/explorer/dotfiles.js
var require_dotfiles = __commonJS({
  "src/explorer/dotfiles.js"(exports2, module2) {
    var { getTypeLabelFromName } = require_fileTypes();
    var dotfileMethods2 = {
      installHiddenDotFilesExplorer() {
        this.scheduleHiddenDotFilesUpdate();
        const observer = new MutationObserver(
          (mutations) => {
            if (this.hiddenFilesUpdateRunning) {
              return;
            }
            let relevant = false;
            for (const m of mutations) {
              if (m.target && m.target.classList && (m.target.classList.contains("dev-hidden-dotfile") || m.target.classList.contains("dev-hidden-dotfile-title") || m.target.classList.contains("dev-file-explorer-badge"))) {
                continue;
              }
              const allNodes = Array.from(m.addedNodes || []).concat(Array.from(m.removedNodes || []));
              const hasSelfElements = allNodes.some(
                (node) => node.nodeType === 1 && (node.classList.contains("dev-hidden-dotfile") || node.classList.contains("dev-file-explorer-badge"))
              );
              if (hasSelfElements) {
                continue;
              }
              if (m.target && m.target.closest && m.target.closest('.workspace-leaf-content[data-type="file-explorer"]')) {
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
        this.hiddenFilesUpdateTimer = setTimeout(
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
          const explorerRoots = document.querySelectorAll(
            '.workspace-leaf-content[data-type="file-explorer"]'
          );
          for (const explorer of explorerRoots) {
            const rootContainer = explorer.querySelector(
              ".nav-files-container"
            );
            if (rootContainer) {
              const modRoot = rootContainer.querySelector(
                ":scope > .nav-folder.mod-root > .nav-folder-children"
              ) || rootContainer.querySelector(
                ":scope > .tree-item.nav-folder > .tree-item-children"
              );
              await this.syncHiddenFilesForFolder(
                "",
                modRoot || rootContainer
              );
            }
            const folderTitles = explorer.querySelectorAll(
              ".nav-folder-title[data-path]"
            );
            for (const folderTitle of folderTitles) {
              const folderPath = folderTitle.getAttribute(
                "data-path"
              );
              if (!folderPath) {
                continue;
              }
              const folderEl = folderTitle.closest(
                ".nav-folder"
              );
              if (!folderEl) {
                continue;
              }
              const children = Array.from(folderEl.children).find(
                (child) => child.classList && child.classList.contains(
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
        } catch (error) {
          console.error(
            "[Dev File Editor] Erreur affichage dotfiles :",
            error
          );
        } finally {
          this.hiddenFilesUpdateRunning = false;
          if (this.hiddenFilesNeedsRerun) {
            this.hiddenFilesNeedsRerun = false;
            this.scheduleHiddenDotFilesUpdate();
          }
        }
      },
      async syncHiddenFilesForFolder(folderPath, container) {
        let listing;
        try {
          listing = await this.app.vault.adapter.list(
            folderPath
          );
        } catch (error) {
          return;
        }
        const hiddenFiles = (listing.files || []).filter((path) => {
          const name = path.split("/").pop() || "";
          return name.startsWith(".") && name.length > 1;
        }).sort(
          (a, b) => a.localeCompare(b)
        );
        const wanted = new Set(hiddenFiles);
        const existingSynthetic = Array.from(
          container.querySelectorAll(
            ":scope > .nav-file.dev-hidden-dotfile"
          )
        );
        for (const element of existingSynthetic) {
          const path = element.getAttribute(
            "data-path"
          );
          if (!wanted.has(path)) {
            element.remove();
          }
        }
        for (const path of hiddenFiles) {
          const alreadyNative = Array.from(
            container.querySelectorAll(
              ":scope > .nav-file > .nav-file-title[data-path]"
            )
          ).some(
            (title) => title.getAttribute(
              "data-path"
            ) === path
          );
          if (alreadyNative) {
            continue;
          }
          const name = path.split("/").pop() || path;
          const isEnv = name === ".env" || name.startsWith(".env.");
          let targetYamlFile = null;
          if (isEnv) {
            const targetYamlTitle = Array.from(
              container.querySelectorAll(
                ":scope > .nav-file > .nav-file-title[data-path], :scope > .tree-item > .tree-item-self[data-path]"
              )
            ).find((el) => {
              const p = el.getAttribute("data-path") || "";
              const fileFolder = p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "";
              return fileFolder === folderPath && /\.(yaml|yml)$/i.test(p);
            });
            const rawYamlFile = targetYamlTitle ? targetYamlTitle.closest(".nav-file") || targetYamlTitle.closest(".tree-item") : null;
            targetYamlFile = rawYamlFile && rawYamlFile.parentElement === container ? rawYamlFile : null;
          }
          const alreadySynthetic = Array.from(
            container.querySelectorAll(
              ":scope > .nav-file.dev-hidden-dotfile"
            )
          ).find(
            (element) => element.getAttribute(
              "data-path"
            ) === path
          );
          if (alreadySynthetic) {
            if (isEnv && targetYamlFile && alreadySynthetic.previousSibling !== targetYamlFile) {
              container.insertBefore(
                alreadySynthetic,
                targetYamlFile.nextSibling
              );
            }
            continue;
          }
          const nativeFile = Array.from(container.children).find(
            (child) => child.classList && child.classList.contains(
              "nav-file"
            ) && !child.classList.contains(
              "dev-hidden-dotfile"
            )
          ) || null;
          const nativeTitle = nativeFile ? nativeFile.querySelector(
            ":scope > .nav-file-title"
          ) : null;
          const fileEl = document.createElement("div");
          if (nativeFile) {
            for (const className of nativeFile.classList) {
              if (className !== "is-active" && className !== "is-selected" && className !== "is-being-dragged") {
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
          const titleEl = document.createElement("div");
          if (nativeTitle) {
            for (const className of nativeTitle.classList) {
              if (className !== "is-active" && className !== "is-selected" && className !== "is-being-dragged") {
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
              const value = nativeTitle.style.getPropertyValue(
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
              const value = nativeTitle.style.getPropertyValue(
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
          const contentEl = document.createElement("div");
          const nativeContent = nativeTitle ? nativeTitle.querySelector(
            ".nav-file-title-content"
          ) : null;
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
          const label = getTypeLabelFromName(name);
          if (label) {
            const badge = document.createElement("span");
            badge.className = "dev-file-explorer-badge";
            badge.textContent = label;
            titleEl.appendChild(
              badge
            );
          }
          titleEl.addEventListener(
            "click",
            async (event) => {
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
          const firstNormalFile = Array.from(container.children).find(
            (child) => child.classList && child.classList.contains(
              "nav-file"
            ) && !child.classList.contains(
              "dev-hidden-dotfile"
            )
          );
          if (isEnv && targetYamlFile) {
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
      }
    };
    module2.exports = { dotfileMethods: dotfileMethods2 };
  }
});

// src/files/operations.js
var require_operations = __commonJS({
  "src/files/operations.js"(exports2, module2) {
    var { TFile: TFile2, Notice: Notice2 } = require("obsidian");
    var { VIEW_TYPE_DEV_FILE: VIEW_TYPE_DEV_FILE2 } = require_constants();
    var { isDotFile: isDotFile2 } = require_fileTypes();
    var fileOperationMethods2 = {
      registerSupportedExtensions() {
        const extensions = this.settings.extensions.filter(
          (extension) => extension && extension !== "md"
        );
        for (const extension of extensions) {
          try {
            this.registerExtensions(
              [extension],
              VIEW_TYPE_DEV_FILE2
            );
          } catch (error) {
            console.warn(
              `[Dev File Editor] .${extension} d\xE9j\xE0 enregistr\xE9e.`
            );
          }
        }
      },
      async addExtension(extension) {
        extension = extension.replace(/^\./, "").toLowerCase().trim();
        if (!extension || extension === "md") {
          return;
        }
        if (this.settings.extensions.includes(
          extension
        )) {
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
            VIEW_TYPE_DEV_FILE2
          );
        } catch (error) {
          console.warn(
            `[Dev File Editor] Impossible d'enregistrer .${extension}`
          );
        }
      },
      async createFile(filename, targetFolder = null) {
        filename = filename.trim();
        if (!filename) {
          return;
        }
        if (!this.hasExplicitExtension(
          filename
        )) {
          filename += ".md";
        }
        let folder = targetFolder || "";
        if (!folder) {
          const activeFile = this.app.workspace.getActiveFile();
          if (activeFile && activeFile.parent && activeFile.parent.path !== "/") {
            folder = activeFile.parent.path;
          }
        }
        const path = folder ? `${folder}/${filename}` : filename;
        const existing = this.app.vault.getAbstractFileByPath(
          path
        );
        if (existing) {
          new Notice2(
            `Le fichier existe d\xE9j\xE0 : ${path}`
          );
          return;
        }
        const extension = this.getExtension(
          filename
        );
        if (extension && extension !== "md") {
          await this.addExtension(
            extension
          );
        }
        try {
          const file = await this.app.vault.create(
            path,
            ""
          );
          const extension2 = this.getExtension(
            file.name
          );
          const handledByPlugin = isDotFile2(file) || extension2 && extension2 !== "md" && this.settings.extensions.includes(extension2);
          if (handledByPlugin) {
            await this.openInDevEditor(
              file
            );
          } else {
            const leaf = typeof this.app.workspace.getLeaf === "function" ? this.app.workspace.getLeaf(false) : null;
            if (leaf && typeof leaf.openFile === "function") {
              await leaf.openFile(file);
            }
          }
          this.scheduleExplorerBadgeUpdate();
          new Notice2(
            `Cr\xE9\xE9 : ${file.path}`
          );
        } catch (error) {
          console.error(
            "Dev File Editor:",
            error
          );
          new Notice2(
            "Impossible de cr\xE9er le fichier."
          );
        }
      },
      hasExplicitExtension(filename) {
        if (filename.startsWith(".") && filename.length > 1) {
          return true;
        }
        const lastDot = filename.lastIndexOf(".");
        return lastDot > 0 && lastDot < filename.length - 1;
      },
      getExtension(filename) {
        if (filename.startsWith(".") && filename.indexOf(
          ".",
          1
        ) === -1) {
          return filename.substring(1).toLowerCase();
        }
        const lastDot = filename.lastIndexOf(".");
        if (lastDot === -1 || lastDot === filename.length - 1) {
          return "";
        }
        return filename.substring(
          lastDot + 1
        ).toLowerCase();
      },
      async removeTrailingMd(file) {
        if (!file.name.toLowerCase().endsWith(".md")) {
          new Notice2(
            "Ce fichier ne se termine pas par .md"
          );
          return;
        }
        const newName = file.name.slice(
          0,
          -3
        );
        const extension = this.getExtension(
          newName
        );
        if (extension) {
          await this.addExtension(
            extension
          );
        }
        const newPath = file.parent && file.parent.path !== "/" ? `${file.parent.path}/${newName}` : newName;
        const success = await this.renameFile(
          file,
          newPath
        );
        if (!success) {
          return;
        }
        const renamedFile = this.app.vault.getAbstractFileByPath(
          newPath
        );
        if (renamedFile instanceof TFile2 && isDotFile2(renamedFile)) {
          await this.openInDevEditor(
            renamedFile
          );
        }
        this.scheduleExplorerBadgeUpdate();
      },
      async changeExtension(file, extension) {
        extension = extension.replace(/^\./, "").trim();
        if (!extension) {
          new Notice2(
            "Extension invalide."
          );
          return;
        }
        await this.addExtension(
          extension
        );
        let basename = file.name;
        const currentExtension = file.extension;
        if (currentExtension) {
          basename = file.name.slice(
            0,
            -(currentExtension.length + 1)
          );
        }
        const newName = `${basename}.${extension}`;
        const newPath = file.parent && file.parent.path !== "/" ? `${file.parent.path}/${newName}` : newName;
        const success = await this.renameFile(
          file,
          newPath
        );
        if (success) {
          this.scheduleExplorerBadgeUpdate();
        }
      },
      async renameFile(file, newPath) {
        const existing = this.app.vault.getAbstractFileByPath(
          newPath
        );
        if (existing) {
          new Notice2(
            `Le fichier existe d\xE9j\xE0 : ${newPath}`
          );
          return false;
        }
        try {
          await this.app.fileManager.renameFile(
            file,
            newPath
          );
          new Notice2(
            `Renomm\xE9 : ${newPath}`
          );
          return true;
        } catch (error) {
          console.error(
            "Dev File Editor:",
            error
          );
          new Notice2(
            "Impossible de renommer le fichier."
          );
          return false;
        }
      }
    };
    module2.exports = { fileOperationMethods: fileOperationMethods2 };
  }
});

// src/workspace/envCompanion.js
var require_envCompanion = __commonJS({
  "src/workspace/envCompanion.js"(exports2, module2) {
    var { VIEW_TYPE_DEV_FILE: VIEW_TYPE_DEV_FILE2 } = require_constants();
    var EnvCompanion2 = class {
      constructor(plugin) {
        this.plugin = plugin;
        this.workspace = plugin.app.workspace;
        this.leaf = null;
        this.source = null;
        this.currentSourcePath = null;
        this.lastSourcePath = null;
        this.manuallyClosed = /* @__PURE__ */ new Set();
        this._programmaticClosing = false;
        this.timer = null;
        this.running = null;
        this.dirty = false;
        this.stopped = false;
      }
      leaves() {
        const leaves = [];
        this.workspace.iterateAllLeaves((leaf) => leaves.push(leaf));
        return leaves;
      }
      isLeafAttached(leaf) {
        if (!leaf) return false;
        if (leaf.parent != null) return true;
        return this.leaves().includes(leaf);
      }
      path(leaf) {
        return leaf?.view?.file?.path || leaf?.view?.filePath || leaf?.getViewState()?.state?.file || "";
      }
      owns(leaf) {
        if (!leaf) return false;
        const type = leaf.getViewState()?.type || (typeof leaf.view?.getViewType === "function" ? leaf.view.getViewType() : null);
        if (type && type !== VIEW_TYPE_DEV_FILE2 && type !== "empty") {
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
        return state?.type === VIEW_TYPE_DEV_FILE2 && state.state?.autoEnvCompanion === true;
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
        this.leaf = this.workspace.getLeavesOfType(VIEW_TYPE_DEV_FILE2).find((leaf) => this.owns(leaf)) || null;
        if (this.leaf) {
          this.leaf._isEnvCompanion = true;
          const sourcePath = this.leaf.getViewState()?.state?.envSourcePath;
          this.source = this.leaves().find((leaf) => leaf !== this.leaf && this.path(leaf) === sourcePath) || null;
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
        return !this.stopped && this.plugin.settings.autoOpenEnvWithYaml !== false && current?.source === expected.source && current.path === expected.path;
      }
      async sync() {
        if (this.leaf && !this.isLeafAttached(this.leaf)) {
          const envSourcePath = this.currentSourcePath || this.leaf._envSourcePath || this.leaf.getViewState()?.state?.envSourcePath || this.path(this.source);
          if (envSourcePath) {
            this.manuallyClosed.add(envSourcePath);
          }
          this.leaf = null;
          this.currentSourcePath = null;
        } else if (this.leaf && !this.owns(this.leaf)) {
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
          leaf = this.leaves().find((l) => this.owns(l)) || null;
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
            type: VIEW_TYPE_DEV_FILE2,
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
        if (!this.sameTarget(target)) this.dirty = !this.stopped;
      }
      async close() {
        const leaf = this.leaf;
        this.leaf = null;
        this.currentSourcePath = null;
        if (!leaf || !this.isLeafAttached(leaf) || !this.owns(leaf)) return;
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
        void this.close().catch((error) => console.error("[Red File Editor] Fermeture du .env :", error));
      }
    };
    module2.exports = { EnvCompanion: EnvCompanion2 };
  }
});

// src/main.js
var { Plugin, TFile, TFolder, Notice } = require("obsidian");
var { VIEW_TYPE_DEV_FILE, DEFAULT_EXTENSIONS } = require_constants();
var { DevFileView } = require_DevFileView();
var { CreateFileModal } = require_CreateFileModal();
var { ChangeExtensionModal } = require_ChangeExtensionModal();
var { DevFileEditorSettingTab } = require_DevFileEditorSettingTab();
var { isDotFile } = require_fileTypes();
var { openFileMethods } = require_openFiles();
var { badgeMethods } = require_badges();
var { dotfileMethods } = require_dotfiles();
var { fileOperationMethods } = require_operations();
var { EnvCompanion } = require_envCompanion();
var DevFileEditorPlugin = class extends Plugin {
  async onload() {
    console.log("Loading Dev File Editor V2");
    this.settings = Object.assign(
      {
        editorWidthPercent: 90,
        autoOpenEnvWithYaml: true,
        extensions: [
          ...DEFAULT_EXTENSIONS
        ]
      },
      await this.loadData()
    );
    this.settings.editorWidthPercent = this.getEditorWidthPercent();
    if (!Array.isArray(
      this.settings.extensions
    )) {
      this.settings.extensions = [
        ...DEFAULT_EXTENSIONS
      ];
    }
    this.applyEditorWidth();
    this.addSettingTab(
      new DevFileEditorSettingTab(
        this.app,
        this
      )
    );
    this.registerView(
      VIEW_TYPE_DEV_FILE,
      (leaf) => new DevFileView(leaf)
    );
    this.registerSupportedExtensions();
    this.envCompanion = new EnvCompanion(this);
    this.app.workspace.onLayoutReady(() => {
      this.installExistingFileClickInterceptor();
      this.installDotFileOpenHandler();
      this.installFileExplorerBadges();
      this.installHiddenDotFilesExplorer();
      this.envCompanion.start();
    });
    const handleNoteWithExplicitExtension = async (file) => {
      if (!(file instanceof TFile)) {
        return;
      }
      if (!file.name.toLowerCase().endsWith(".md")) {
        this.scheduleExplorerBadgeUpdate();
        return;
      }
      const rawBaseName = file.name.split("/").pop() || file.name;
      const nameWithoutMd = rawBaseName.slice(0, -3);
      if (!this.hasExplicitExtension(
        nameWithoutMd
      ) || nameWithoutMd.toLowerCase().endsWith(".md")) {
        this.scheduleExplorerBadgeUpdate();
        return;
      }
      const extension = this.getExtension(
        nameWithoutMd
      );
      if (extension) {
        await this.addExtension(
          extension
        );
      }
      const parentPath = file.parent && file.parent.path !== "/" && file.parent.path !== "" ? file.parent.path : "";
      const newPath = parentPath ? `${parentPath}/${nameWithoutMd}` : nameWithoutMd;
      const existing = this.app.vault.getAbstractFileByPath(
        newPath
      );
      if (existing) {
        new Notice(
          `Le fichier existe d\xE9j\xE0 : ${newPath}`
        );
        return;
      }
      try {
        if (this.app.fileManager && typeof this.app.fileManager.renameFile === "function") {
          await this.app.fileManager.renameFile(
            file,
            newPath
          );
        }
        const renamedFile = this.app.vault.getAbstractFileByPath(
          newPath
        );
        if (renamedFile instanceof TFile) {
          await this.openInDevEditor(
            renamedFile
          );
        }
        this.scheduleExplorerBadgeUpdate();
      } catch (error) {
        console.error(
          "Dev File Editor:",
          error
        );
      }
    };
    this.registerEvent(
      this.app.vault.on(
        "create",
        handleNoteWithExplicitExtension
      )
    );
    this.registerEvent(
      this.app.vault.on(
        "rename",
        handleNoteWithExplicitExtension
      )
    );
    this.addCommand({
      id: "create-file",
      name: "Create file",
      callback: () => {
        new CreateFileModal(
          this.app,
          this
        ).open();
      }
    });
    this.addCommand({
      id: "remove-trailing-md",
      name: "Remove trailing .md",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        const valid = file && file instanceof TFile && file.name.toLowerCase().endsWith(".md");
        if (valid && !checking) {
          this.removeTrailingMd(file);
        }
        return valid;
      }
    });
    this.addCommand({
      id: "change-extension",
      name: "Change file extension",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        const valid = file instanceof TFile;
        if (valid && !checking) {
          new ChangeExtensionModal(
            this.app,
            this,
            file
          ).open();
        }
        return valid;
      }
    });
    this.registerEvent(
      this.app.workspace.on(
        "file-menu",
        (menu, file) => {
          if (typeof TFolder !== "undefined" && file instanceof TFolder || file && file.children !== void 0) {
            menu.addItem((item) => {
              item.setTitle("Cr\xE9er un fichier ici (Red File Editor)").setIcon("file-plus").onClick(() => {
                new CreateFileModal(
                  this.app,
                  this,
                  file.path
                ).open();
              });
            });
            return;
          }
          if (!(file instanceof TFile)) {
            return;
          }
          if (file.extension !== "md") {
            menu.addItem((item) => {
              item.setTitle(
                "Open in Dev File Editor"
              ).setIcon("file-code").onClick(
                async () => {
                  await this.openInDevEditor(
                    file
                  );
                }
              );
            });
          }
          if (file.name.toLowerCase().endsWith(".md")) {
            menu.addItem((item) => {
              item.setTitle(
                "Remove trailing .md"
              ).setIcon("file-code").onClick(
                async () => {
                  await this.removeTrailingMd(
                    file
                  );
                }
              );
            });
          }
          menu.addItem((item) => {
            item.setTitle(
              "Change extension"
            ).setIcon("file-edit").onClick(
              () => {
                new ChangeExtensionModal(
                  this.app,
                  this,
                  file
                ).open();
              }
            );
          });
        }
      )
    );
    this.registerEvent(
      this.app.workspace.on(
        "folder-menu",
        (menu, folder) => {
          const folderPath = folder ? folder.path : "";
          menu.addItem((item) => {
            item.setTitle("Cr\xE9er un fichier ici (Red File Editor)").setIcon("file-plus").onClick(() => {
              new CreateFileModal(
                this.app,
                this,
                folderPath
              ).open();
            });
          });
        }
      )
    );
    this.addRibbonIcon(
      "file-plus",
      "Create file",
      () => {
        new CreateFileModal(
          this.app,
          this
        ).open();
      }
    );
  }
  getEditorWidthPercent() {
    const value = Number(
      this.settings && this.settings.editorWidthPercent
    );
    if (!Number.isFinite(value)) {
      return 90;
    }
    return Math.min(
      100,
      Math.max(
        50,
        Math.round(value)
      )
    );
  }
  applyEditorWidth() {
    const value = this.getEditorWidthPercent();
    document.documentElement.style.setProperty(
      "--dev-file-editor-width",
      `${value}%`
    );
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  onunload() {
    if (this.badgeUpdateTimer) {
      clearTimeout(
        this.badgeUpdateTimer
      );
    }
    if (this.hiddenFilesUpdateTimer) {
      clearTimeout(
        this.hiddenFilesUpdateTimer
      );
    }
    document.querySelectorAll(
      ".dev-file-explorer-badge"
    ).forEach(
      (element) => element.remove()
    );
    document.querySelectorAll(
      ".dev-hidden-dotfile"
    ).forEach(
      (element) => element.remove()
    );
    document.documentElement.style.removeProperty(
      "--dev-file-editor-width"
    );
    if (this.envCompanion) {
      this.envCompanion.stop();
    }
    console.log(
      "Unloading Dev File Editor V2"
    );
  }
};
Object.assign(
  DevFileEditorPlugin.prototype,
  openFileMethods,
  badgeMethods,
  dotfileMethods,
  fileOperationMethods
);
module.exports = DevFileEditorPlugin;
