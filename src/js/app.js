import EventEmitter  from 'eventemitter3';
import PlayerContainer from './playerContainer';
import * as PIXI from 'pixi.js';
import { debounce } from './utils';

export default class App extends EventEmitter {
  constructor(containerSelector) {
    super();

    this.container = containerSelector || document.body;
    this.GAME_WIDTH = 360;
    this.GAME_HEIGHT = 640;

    this.appConfig = {
      width: this.GAME_WIDTH,
      height: this.GAME_WIDTH,
      antialias: true,
      transparent: true,
      roundPixels: true,
      resolution: window.devicePixelRatio || 1
    };

    this.loader = PIXI.loader;
  }

  init() {
    this.loadResources();
    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('resize', debounce(this.resize.bind(this), 500));
  }

  setupTicker() {
    this.ticker = new PIXI.ticker.Ticker();
    this.ticker.add(this.loop.bind(this));
    this.ticker.start();
  }

  loop(delta) {
    this.playerContainer.update();
  }

  loadResources() {
    this.loader.add(['images/shape.png'])
      .load(this.setup.bind(this));
  }

  resize() {
    const scale = Math.min(
      window.innerWidth / this.GAME_WIDTH,
      window.innerHeight / this.GAME_HEIGHT
    );

    const width = Math.ceil(this.GAME_WIDTH * scale);
    const height = Math.ceil(this.GAME_HEIGHT * scale);

    const styles = { width: `${width}px`, height: `${height}px` };

    Object.assign(this.app.view.style, styles);
    this.app.renderer.resize(width, height);
    this.app.stage.scale.set(scale);
  }

  setup(loader, resources) {
    // Main app class setup
    this.app = new PIXI.Application(this.appConfig);
    this.container.appendChild(this.app.view);

    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    // Player interactions class setup
    this.playerContainer = new PlayerContainer(this.app, resources);
    this.app.stage.addChild(this.playerContainer.container);

    // setup ticker
    this.setupTicker();

    // resize
    this.resize();
  }
}