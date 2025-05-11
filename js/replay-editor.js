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
  #editor;
  #monacoModule;

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
      getWorker: function(workerId, label) {
        const src = `
          self.MonacoEnvironment = {
            baseUrl: 'https://unpkg.com/monaco-editor@latest/min/'
          };
          importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
        `;

        const blob = new Blob([src], { type: "application/javascript"} );
        return new Worker(URL.createObjectURL(blob));
      }
    };

    this.#monacoModule = await import("https://cdn.jsdelivr.net/npm/monaco-editor@latest/+esm");

    this.#editor = this.#monacoModule.editor.create(this.getDom().querySelector('#editor'), {
      value: this.value,
      language: this.language || undefined,
      theme: 'vs-dark',
      folding: false,
      minimap: {
        enabled: false,
      },
      smoothScrolling: true,
    });

    this.#editor.getModel().onDidChangeContent(() => {
      this.value = this.#editor.getModel().getValue();
      this.dispatchEvent(new Event("change"));
    });

    const resizeObserver = new ResizeObserver((_) => {
      this.#editor.layout();
    });

    resizeObserver.observe(this.getHost());

    this.dispatchEvent(new Event("load"));
  }

  getValue() {
    return this.value;
  }

  setValue(value) {
    this.#editor.getModel().setValue(value);
  }

  setSelection(startIndex, endIndex) {
    const startPosition = this.#editor.getModel().getPositionAt(startIndex);
    const endPosition = this.#editor.getModel().getPositionAt(endIndex);
    const selection = new this.#monacoModule.Selection(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);

    this.#editor.revealRange(selection, this.#monacoModule.editor.ScrollType.Smooth);
    this.#editor.setSelection(selection);
  }

  setCursor(index) {
    this.setSelection(index, index);
  }

  type(content) {
    const model = this.#editor.getModel();
    const selection = this.#editor.getSelection();
    const afterEditSelection = new this.#monacoModule.Selection(selection.startLineNumber, selection.startColumn + content.length, selection.startLineNumber, selection.startColumn + content.length);

    model.pushEditOperations(
      [selection],
      [{
        range: selection,
        text: content,
      }],
      (_) => [selection],
    );
  }

  deleteCurrentSelection() {
    this.type("");
  }

  focus() {
   this.#editor.focus(); 
  }
}

ReplayEditor.register();
  