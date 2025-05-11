class ReplayIcon extends LightElement {
  static tagName = "replay-icon";
  static css = `
    :host {
      --fill: {{ this.fill ? '1' : '0' }};
      --weight: {{ this.weight }};
      --grade: {{ this.grade }};
      --optical-size: {{ this.opticalSize }};

      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }

    span.material-symbols-outlined {
      display: block;
      font-size: inherit;
      font-variation-settings: 'FILL' var(--fill), 'wght' var(--weight), 'GRAD' var(--grade), 'opsz' var(--optical-size);
    }
  `;
  static html = `
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <span class="material-symbols-outlined">{{ this.icon }}</span>
  `;

  icon;
  fill;
  weight;
  grade;
  opticalSize;

  constructor(shell) {
    super(shell);
    this.icon ||= "";
    this.fill ||= false;
    this.weight ||= 400;
    this.grade ||= 0;
    this.opticalSize ||= 24;
  }

  onInit() {
    
  }
}

ReplayIcon.register();
