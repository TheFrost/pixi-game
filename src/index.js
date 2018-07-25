// hack reload to parceljs
if (module.hot) module.hot.dispose(() => window.location.reload());

import * as PIXI from 'pixi.js';

class App extends PIXI.Application {
  constructor() {
    super({
      width: 300,
      height: 400,
      antialias: true,
      transparent: true
    });

    this.init();
  }

  init() {
    const playerContainer = new PlayerContainer(this);
    this.stage.addChild(playerContainer);
  }
}

class PlayerContainer extends PIXI.Container {
  constructor(appContext) {
    super();
    
    this.app = appContext;
    this.extract = this.app.renderer.plugins.extract;

    this.init();
  }

  init() {
    // brush
    this.brush = new PIXI.Graphics();
    this.brush.beginFill(0xffff00);
    this.brush.drawCircle(0, 0, 5);
    this.brush.endFill();

    const { width, height } = this.app.screen;
    const shape = new PIXI.Sprite.fromImage('images/shape.png');
    shape.width = 295;
    shape.height = 284;
    shape.anchor.x = 0.5;
    shape.anchor.y = 0.5;
    shape.position.set(
      width/2,
      height/2
    );
    this.addChild(shape);

    // this.setup();
    setTimeout(() => this.setup(), 5000);
  }

  setup() {
    const validatePixels = () => {
      const basePixels = getTotalBasePixels();
      console.log(Math.ceil(basePixels / totalBasePixels * 100));
    };
  
    const getTotalBasePixels = () => {
      const pixels = this.extract.pixels(this);
      let basePixels = 0;
  
      for (let i = 0; i < pixels.length; i+=4) {
        let r = pixels[i],
            g = pixels[i+1],
            b = pixels[i+2],
            a = pixels[i+3];
  
        if (r === 0 && g === 0 && b === 0 && a === 255) {
          basePixels += 1;
        }
      }
  
      return basePixels;
    }
  
    const pointerDown = event => {
      dragging = true;
      pointerMove(event);
    };
  
    const pointerUp = () => {
      dragging = false;
      validatePixels();
    };
    
    const pointerMove = event => {
      if (dragging) {
        this.brush.position.copy(event.data.global);
        this.app.renderer.render(this.brush, renderTexture, false, null, false);
      }
    };
  
    let dragging = false;
    const totalBasePixels = getTotalBasePixels();
  
    console.log(totalBasePixels);
    const cheesseBrush = new PIXI.Sprite.fromImage('images/chesse-back.png');
    cheesseBrush.width = this.app.screen.width;
    cheesseBrush.height = this.app.screen.height;
    this.addChild(cheesseBrush);

    const renderTexture = PIXI.RenderTexture.create(cheesseBrush.width, cheesseBrush.height);

    const renderTextureSprite = new PIXI.Sprite(renderTexture);
    this.addChild(renderTextureSprite);
    cheesseBrush.mask = renderTextureSprite;
  
    this.app.stage.interactive = true;
    this.app.stage.on('pointerdown', pointerDown);
    this.app.stage.on('pointerup', pointerUp);
    this.app.stage.on('pointermove', pointerMove);
  }
}

const app = new App();
document.body.appendChild(app.view);