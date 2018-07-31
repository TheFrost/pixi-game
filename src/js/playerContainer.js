import * as PIXI from 'pixi.js';
import { getPixelCounter, getPercent } from './utils';

export default class PlayerContainer {
  constructor(appContext, resources) {
    
    this.app = appContext;
    this.stage = this.app.stage;
    this.renderer = this.app.renderer;
    this.resources = resources;
    this.extract = this.app.renderer.plugins.extract;
    this.totalBasePixels = 0;
    
    this.isDragging = false;
    
    // set up container
    this.container = new PIXI.Container();
    this.container.pivot.x = 295/2;
    this.container.pivot.y = 284/2;
    this.container.position.x = this.app.screen.width/2;
    this.container.position.y = this.app.screen.height/2;
    console.log(this.container);
    
    this.init();
  }

  init() {
    this.drawShape();
    this.setupBasePixels();
    this.buildBrush();
    this.bindEvents();
  }

  drawShape() {
    const { width, height } = this.app.screen;
    console.log(width, height);
    this.shape = new PIXI.Sprite(this.resources['images/shape.png'].texture);
    this.shape.width = 295;
    this.shape.height = 284;
    // this.shape.anchor.x = 0.5;
    // this.shape.anchor.y = 0.5;
    // this.shape.position.set(
    //   width/2,
    //   height/2
    // );
    this.container.addChild(this.shape);
  }

  setupBasePixels() {
    this.totalBasePixels = this.getTotalBasePixels();
    console.log(`totalBasePixels: ${this.totalBasePixels}`);
  }

  buildBrush() {
    const { width, height } = this.app.screen;

    this.brush = new PIXI.Graphics();
    this.brush.beginFill(0xffff00);
    this.brush.drawCircle(0, 0, 5);
    this.brush.endFill();

    this.cheeseTexture = PIXI.RenderTexture.create(this.shape.width, this.shape.height);
    const cheeseTextureSprite = new PIXI.Sprite(this.cheeseTexture);
    this.container.addChild(cheeseTextureSprite);
    
    const cheeseAsset = new PIXI.Sprite.fromImage('images/chesse-back.png');
    cheeseAsset.width = this.shape.width;
    cheeseAsset.height = this.shape.height;
    cheeseAsset.mask = cheeseTextureSprite;
    this.container.addChild(cheeseAsset);
  }

  validatePixels() {
    const basePixels = this.getTotalBasePixels();
    const percent = getPercent(basePixels, this.totalBasePixels);
    console.log({percent});
  }

  getTotalBasePixels() {
    const pixels = this.extract.pixels(this.container);
    console.log(pixels);
    return getPixelCounter(pixels, pixel => (pixel.r+pixel.g+pixel.b) === 0 && pixel.a === 255);
  }

  update() {
    if (this.isDragging) {
      this.renderer.render(this.brush, this.cheeseTexture, false, null, false);
    }
  }

  bindEvents() {
    this.stage.interactive = true;
    this.stage.on('pointerdown', this.pointerDown.bind(this));
    this.stage.on('pointerup', this.pointerUp.bind(this));
    this.stage.on('pointermove', this.pointerMove.bind(this));
  }

  pointerDown(event) {
    this.isDragging = true;
    this.pointerMove(event);
  }

  pointerUp() {
    this.isDragging = false;
    
    window.setTimeout(() => {
      if(!this.isDragging) this.validatePixels()
    }, 500);
  }
  
  pointerMove(event) {
    if (this.isDragging) {
      this.brush.position.copy(event.data.getLocalPosition(this.container));
    }
  }
}