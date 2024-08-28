class ReplayEditor extends LightElement {
  static tagName = "replay-editor";
  static css = `
    :host {
      display: block;
      position: relative;
    }

    div#editor {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    div.monaco-editor {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      height: auto !important;
    }
  `;
  static html = `
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs/editor/editor.main.css">
    <div id="editor"></div>
  `;

  value;
  language;

  constructor(shell) {
    super(shell);
    this.value ||= "";
    this.language ||= null;
  }

  onInit() {
    this.#initializeEditor();
  }

  async #initializeEditor() {
    window.MonacoEnvironment = {
      getWorkerUrl: function(workerId, label) {
        return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
          self.MonacoEnvironment = {
            baseUrl: 'https://unpkg.com/monaco-editor@latest/min/'
          };
          importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');`
        )}`;
      }
    };

    const monaco = await import("https://cdn.jsdelivr.net/npm/monaco-editor@latest/+esm");

    const editor = monaco.editor.create(this.getDom().querySelector('#editor'), {
      value: this.value,
      language: this.language || undefined,
      theme: 'vs-dark',
      folding: false,
      minimap: {
        enabled: false,
      },
    });

    editor.getModel().onDidChangeContent(() => {
      this.value = editor.getModel().getValue();
      this.dispatchEvent(new Event("change"));
    });

    this.dispatchEvent(new Event("load"));
  }

  getValue() {
    return this.value;
  }
}

ReplayEditor.register();
  