async function sleep(ms) {
  return new Promise((r, _) => setTimeout(r, ms));
}

const defaultCode = `class DemoHello extends LightElement {
  static tagName = "demo-hello";
  static css = \`
    span {
      font-weight: 400;
      font-style: normal;
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

class ReplayApp extends LightElement {
  static tagName = "replay-app";
  static css = `
    :host {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    body {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
    }

    section.menu {
      padding: 0 0.35em;
      height: 3em;
      overflow: hidden;
      color: #c7c7c7;
      background-color: #3c3c3c;
      border-bottom: 1px solid #444746;
      z-index: 1000;

      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      button {
        display: flex;
        justify-content: center;
        align-items: center;

        margin: 0;
        padding: 0;
        width: 2em;
        height: 2em;
        box-sizing: border-box;

        font-size: 1em;

        color: #c7c7c7;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 1em;
        cursor: pointer;
        transition: all ease-in-out 0.2s;

        &:hover:not([disabled]) {
          color: #cbcbcb;
          background-color: #505050;
          box-shadow: 0 0 0 1px #3a3a3a;
        }

        &:active:not([disabled]) {
          color: #cbcbcb;
          background-color: #696969;
        }

        &[disabled] {
          cursor: default;
          color: #7b7b7b;
        }
      }

      aside.frames {
        counter-reset: frame-counter;

        ul {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          gap: 0.3em;
          padding: 0;
          margin: 0;

          li.frame {
            display: flex;
            flex-direction: row;
            gap: 0.3em;
            counter-increment: frame-counter;

            margin: 0;
            padding: 0;
            list-style: none;

            &.selected {
              button.frame {
                border-color: #cbcbcb6b;
                background-color: #50505088;
              }
            }

            button.frame {
              width: 2em;
              height: 2em;
              line-height: 2em;
              text-align: center;
              font-family: arial;

              border: 1px solid #cbcbcb40;
              border-radius: 5px;
              background-color: transparent;

              &::before {
                content: counter(frame-counter);
              }

              &:hover:not([disabled]) {
                border-color: #cbcbcb6b;
                background-color: #505050;
              }
            }

            button.insert {
              position: relative;
              width: 0;
              height: 2em;
              border: 2px solid transparent;

              &::after {
                opacity: 0.0;
                width: 10px;
                height: 10px;
                background-color: #848484;
                border: 1px solid #848484;
                border-radius: 12px;
                content: "+";
                line-height: 11px;
                text-align: center;
                transition: all ease-in-out 0.2s;
              }

              &:hover:not([disabled]), &:active {
                border-color: #848484;

                &::after {
                  opacity: 1.0;
                }
              }
            }

            &:not(:first-child) {
              button.insert:first-child {
                display: none;
              }
            }      
          }
        }
      }

      aside.controls {
        ul {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          gap: 0.3em;
          margin: 0;
          padding: 0;

          li {
            margin: 0;
            padding: 0;
            list-style: none;

            &.hidden {
              display: none;
            }
          }
        }
      }
    }

    section.ide {
      position: relative;
      flex: 1;

      display: flex;
      flex-direction: row;
      justify-content: stretch;
      align-items: stretch;
      box-sizing: border-box;

      replay-editor {
        margin-top: 0.5em;
        flex: 1;
        z-index: 500;
      }

      div#output {
        position: relative;
        display: flex;
        flex: 1;
        justify-content: stretch;
        align-items: stretch;
        border: 1px solid transparent;
        background-color: #ffffff;

        z-index: 750;

        iframe {
          flex: 1;
          padding: 1em;
          box-sizing: border-box;
          border: none;
        }
      }

      &.recording {
        width: auto;
        aspect-ratio: 9/16;
        align-self: center;

        margin: 3px 0;
        box-shadow: 0px 0px 0px 3px #c0c0c0;

        flex-direction: column-reverse;
        gap: 0.2em;

        div#output {
          flex: 0;
          aspect-ratio: 16/9;
          margin: 0 0.8em;
          margin-top: 0.5em;
          border-radius: 1em;

          box-shadow: 0 0 7px #1e1e1e;
          filter: drop-shadow(1px 1px 2px #000000);
        }
      }
    }

    section.menu.hidden {
      display: none;
    }
  `;
  static html = `
    <section [class]="'menu' + (this._playing && this._recordingMode ? ' hidden' : '')">
      <aside class="frames">
        <ul>
          <li *for="let frame of this._frames" [class]="'frame' + (frame.index == this._currentFrame?.index ? ' selected' : '')">
            <button class="insert" [disabled]="this._playing" (click)="this._insertFrame(frame.content, frame.index)"></button>
            <button class="frame" [disabled]="this._playing" (click)="this._showFrame(frame.index)"></button>
            <button class="insert" [disabled]="this._playing" (click)="this._insertFrame(frame.content, frame.index + 1)"></button>
          </li>
        </ul>
      </aside>
      <aside class="controls">
        <ul>
          <li>
            <button (click)="this._openGist()">
              <replay-icon icon="folder_open"></replay-icon>
            </button>
          </li>
          <li>
            <button (click)="this._toggleRecordingMode()">
              <replay-icon [icon]="this._recordingMode ? 'videocam': 'videocam_off'"></replay-icon>
            </button>
          </li>
          <li><button (click)="this._previousFrame()" [disabled]="this._currentFrame?.index == 0"><replay-icon icon="skip_previous"></replay-icon></button></li>
          <li [class]="this._playing ? 'hidden' : ''">
            <button (click)="this._play()" [disabled]="!this._frames?.length || this._currentFrame?.index + 1 >= this._frames?.length"><replay-icon icon="play_arrow"></replay-icon></button>
          </li>
          <li [class]="this._playing ? '' : 'hidden'">
            <button (click)="this._stop()"><replay-icon icon="stop"></replay-icon></button>
          </li>
          <li><button (click)="this._nextFrame()" [disabled]="this._currentFrame?.index + 1 >= this._frames?.length"><replay-icon icon="skip_next"></replay-icon></button></li>
        </ul>
      </aside>
    </section>
    <section [class]="'ide' + (this._recordingMode ? ' recording' : '')">
      <replay-editor (load)="this._triggerRendering()" (change)="this._updateCode()" [value]="this._code" language="javascript"></replay-editor>
      <div id="output">
        <iframe src="about:blank" (load)="this.renderIframe()" sandox="allow-scripts, allow-forms"></iframe>
      </div>
    </section>
  `;

  _frames;
  _currentFrame;
  _code;
  _playing;
  _recordingMode;
  #editor;

  constructor(shell) {
    super(shell);
    this._code = defaultCode;
    this._frames = [{
      index: 0,
      content: this._code,
    }];
    this._currentFrame = this._frames[0];
    this._playing = false;
    this._recordingMode = false;
    this.#editor = null;
  }

  async onInit() {
    this.#editor = this.getDom().querySelector("replay-editor");
    const currentUrl = new URL(document.location.href);

    if (currentUrl.searchParams.has("gist")) {
      const gistId = currentUrl.searchParams.get("gist");

      try {
        const gist = await Gist.load(gistId);
        this.#loadGist(gist);
      }
      catch (e) {
        alert(e);
      }
    }

    /*this._insertFrame(`class DemoHello extends LightElement {
  static tagName = "demo-hello";
  static css = \`
    span {
      font-weight: 500;
      font-style: normal;
      color: red;
    }
  \`;
  static html = \`
    Hello <span>{{ this.name }}</span>!
  \`;

  name;

  constructor(shell) {
    super(shell);
    this.name ||= "World";
  }
}

DemoHello.register();
`, -1, false);*/
  }

  #loadGist(gist) {
    this._frames = [];

    [...gist.files.entries()].toSorted((a, b) => a[0].localeCompare(b[0])).forEach(([_, content]) => {
      this._insertFrame(content, -1, false);
    });
    
    this._currentFrame = this._frames[0];
    this._code = this._currentFrame.content;
  }

  async _openGist() {
    const sUrl = prompt("Load the following Gist (1 frame per file, alphabetical ordered):", "https://gist.github.com/");
    let url = null;

    try {
      url = new URL(sUrl);
    }
    catch (e) {
      alert("Incorrect URL.");
      return;
    }

    if (url.host != "gist.github.com") {
      alert("URL must be on the gist.github.com domain.");
      return;
    }

    const id = url.pathname.split("/").pop();

    if (!/^[a-f0-9]+$/.test(id)) {
      alert("Gist identifier looks not a valid one.");
      return;
    }

    document.location.href = `?gist=${id}`;
  }

  _toggleRecordingMode() {
    this._recordingMode = !this._recordingMode;
  }

  _nextFrame() {
    this._showFrame(this._currentFrame.index + 1);
  }

  _previousFrame() {
    this._showFrame(this._currentFrame.index - 1);
  }

  _showFrame(index) {
    if (index < 0 || index >= this._frames.length || this._currentFrame.index == index) {
      return;
    }

    this._currentFrame = this._frames[index];
    this.#editor.setValue(this._currentFrame.content);
  }

  _insertFrame(content, index = -1, showFrame = true) {
    if (index < 0 || index > this._frames.length) {
      index = this._frames.length;
    }

    this._frames.splice(index, 0, {
      index: index,
      content: content,
    });

    // Recompute indexes
    this._frames.forEach((frame, index) => {
      frame.index = index;
    });

    this.update("this._frames");

    if (showFrame) {
      this._showFrame(index);
    }
  }

  async _play() {
    this._playing = true;

    // Short break for recording post edition purposes
    if (this._recordingMode) {
      await sleep(1000);
    }

    for (let index = this._currentFrame.index ; index < this._frames.length; index++) {
      this._currentFrame = this._frames[index];
      await this.#playFrame(index);
    }

    // Short break for recording post edition purposes
    if (this._recordingMode) {
      await sleep(1000);
    }

    this._playing = false;
  }

  #generateDiffSteps(code, dst) {
    const dmp = new diff_match_patch();
    dmp.Diff_EditCost = 4;

    const diff = dmp.diff_main(code, dst); 
    dmp.diff_cleanupEfficiency(diff);

    const patch = dmp.patch_make(diff);
    const sPatch = dmp.patch_toText(patch);

    const steps = [];

    dmp.patch_apply(patch, code, (index, length, replacement) => {
      const actions = [];
      const patchDiff = dmp.diff_main(code.substring(index, index + length), replacement);

      let subindex = 0;

      // todo: find atomic changes
      for (let df of patchDiff) {
        // Deletion
        if (df[0] < 0) {
          actions.push({"type": "select", "from": index + subindex, "to": index + subindex + df[1].length});
          actions.push({"type": "delete"});
        }

        // Insertion
        else if (df[0] > 0) {
          if (actions.length > 1 && actions[actions.length - 1].type == "delete" && actions[actions.length - 2].type == "select" && actions[actions.length - 2].from == index + subindex) {
            actions.pop();
          }
          else {
            actions.push({"type": "select", "from": index + subindex, "to": index + subindex});
          }

          actions.push({"type": "insert", "content": df[1]});
        }

        if (df[0] >= 0) {
          subindex += df[1].length;
        }
      }

      /*const actionsToRemove = [];
      for (let i = 0; i + 2 < actions.length; i++) {
        if (actions[i].type == "select" && actions[i+1].type == "delete" && actions[i+2].type == "select" && actions[i].from == actions[i+2].from) {
          actionsToRemove.push(i+1);
          actionsToRemove.push(i+2);
          i += 2;
        }
      }

      actionsToRemove.sort().reverse();
      for (let i of actionsToRemove) {
        actions.splice(i, 1);
      }*/
      
      code = code.substring(0, index) + replacement + code.substring(index + length);

      steps.push({
        actions: actions,
      });
    });

    return steps;
  }

  async #playFrame(index) {
    const steps = this.#generateDiffSteps(this._code, this._frames[index].content);

    this.#editor.focus();

    for (let step of steps) {
      for (let action of step.actions) {
        if (action.type == "select") {
          if (action.from == action.to) {
            this.#editor.setSelection(action.from, action.to);
          }
          else {
            const increment = 1 * ((action.to - action.from)/Math.abs(action.to - action.from));
            for (let i = action.from ; i != action.to + increment ; i += increment) {
              this.#editor.setSelection(i < action.from ? i : action.from, i < action.from ? action.from : i);
              await sleep(50);
            }
          }
        }
        else if (action.type == "delete") {
          this.#editor.deleteCurrentSelection();
        }
        else if (action.type == "insert") {
          for (let letter of action.content) {
            this.#editor.type(letter);
            await sleep(50);
          }
        }

        await sleep(1000);
      }

      await sleep(1000);
    }
  }

  _stop() {
    console.warn("Stop is not really implemented");
    this._playing = false;
    this.#editor.setValue(this._currentFrame.content);
    this._triggerRendering();
  }

  _triggerRendering() {
    this._code = this.#editor.getValue();

    // TODO timeout?
    this.getDom().querySelector("iframe").src = `about:blank?${Date.now()}`;
  }

  _updateCode() {
    this._triggerRendering();
    this._currentFrame.content = this._code;
    this.update("this._frames");
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
          display: flex;
          flex-direction: row;
          justify-content: stretch;
          align-items: stretch;

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
