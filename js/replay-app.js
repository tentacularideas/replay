class ReplayApp extends LightElement {
  static tagName = "replay-app";
  static css = `
  replay-editor {
    position: absolute;
    top: 1em;
    left: 0;
    right: 50%;
    bottom: 0;
  }

  div#output {
    position: absolute;
    top: 0;
    left: 50%;
    right: 0;
    bottom: 0;
    background-color: #ffffff;
    border: 1px solid transparent;

    iframe {
      width: 100%;
      height: 100%;
      padding: 1em;
      box-sizing: border-box;
      border: none;
    }
  }
  `;
  static html = `
    <replay-editor (load)="this._triggerRendering()" (change)="this._triggerRendering()" [value]="this._code" language="javascript"></replay-editor>
    <div id="output">
      <iframe src="about:blank" (load)="this.renderIframe()"></iframe>
    </div>
  `;

  _code;
  #editor;

  constructor(shell) {
    super(shell);
    this._code ||= "";
    this.#editor = null;
  }

  onInit() {
    this.#editor = this.getDom().querySelector("replay-editor");
    this._code = `class DemoHello extends LightElement {
  static tagName = "demo-hello";
  static css = \`
    span {
      font-weight: 500;
    }
  \`;
  static html = \`
    Hello, <span>{{ this.name }}</span>!
  \`;

  name;

  constructor(shell) {
    super(shell);
    this.name ||= "World";
  }
}

DemoHello.register();
`;
  }

  _triggerRendering() {
    this._code = this.#editor.getValue();

    // TODO timeout?
    this.getDom().querySelector("iframe").src = `about:blank?${Date.now()}`;
  }

  renderIframe() {
    const iframe = this.getDom().querySelector("iframe").contentWindow;
    const iframeDocument = iframe.document;

    let code = this._code;
    let tagName = null;
    const match = code.match(/static\s+tagName\s*=\s*([`'"])(?<tagName>[a-zA-Z0-9-]+)\1/);

    if (match) {
      tagName = match.groups.tagName;
    }

    // TODO: Check if a valid custom element name (-)
    if (!tagName) {
      return;
    }

    const tags = [
      {
        tag: "link",
        attrs: {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
      },
      {
        tag: "link",
        attrs: {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: true,
        },
      },
      {
        tag: "link",
        attrs: {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap",
        },
      },
      {
        tag: "style",
        attrs: {
          type: "text/css",
        },
        content: `body {
          padding: 0;
          margin: 0;
          font-family: "Noto Sans", sans-serif;
          font-weight: 300;
        }`
      },
    ];

    for (let tag of tags) {
      const el = iframeDocument.createElement(tag.tag);
      
      for (let [key, value] of Object.entries(tag.attrs || [])) {
        el.setAttribute(key, value);
      }

      if (tag.content) {
        el.append(iframeDocument.createTextNode(tag.content));
      }

      iframeDocument.body.append(el);
    }


    const iframeScript = iframeDocument.createElement("script");
    iframeScript.append(iframeDocument.createTextNode(code));

    const leScript = iframeDocument.createElement("script");
    leScript.setAttribute("src", "https://tentacularideas.github.io/lightelement/lightelement.js");
    leScript.onload = () => {
      iframeDocument.body.append(iframeScript);
    };

    iframeDocument.body.append(leScript);

    iframe.customElements.whenDefined(tagName).then(() => {
      const tag = iframeDocument.createElement(tagName);
      iframeDocument.body.append(tag);
    });
  }
}

ReplayApp.register();
