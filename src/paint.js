// hack reload to parceljs
if (module.hot) module.hot.dispose(() => window.location.reload());

import * as PIXI from 'pixi.js';

const app = new PIXI.Application({
  width: 300,
  height: 400,
  antialias: true,
  transparent: true
});
document.body.appendChild(app.view);

const stage = app.stage;
const extract = app.renderer.plugins.extract;

// brush
const brush = new PIXI.Graphics();
brush.beginFill(0xffff00);
brush.drawCircle(0, 0, 10);
brush.endFill();

// player container
const playerContainer = new PIXI.Container();
stage.addChild(playerContainer);

const shape = new PIXI.Graphics();
shape.beginFill(0x000000);
shape.drawCircle(app.screen.width/2, app.screen.height/2, 50);
shape.endFill();
playerContainer.addChild(shape);

const setup = () => {
  const validatePixels = () => {
    const basePixels = getTotalBasePixels();
    console.log(Math.ceil(basePixels / totalBasePixels * 100));
  };

  const getTotalBasePixels = () => {
    const pixels = extract.pixels(playerContainer);
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
      brush.position.copy(event.data.global);
      app.renderer.render(brush, renderTexture, false, null, false);
    }
  };

  let dragging = false;
  const totalBasePixels = getTotalBasePixels();

  console.log(totalBasePixels);

  const renderTexture = PIXI.RenderTexture.create(app.screen.width, app.screen.height);
  const renderTextureSprite = new PIXI.Sprite(renderTexture);
  playerContainer.addChild(renderTextureSprite);

  stage.interactive = true;
  stage.on('pointerdown', pointerDown);
  stage.on('pointerup', pointerUp);
  stage.on('pointermove', pointerMove);
};

setup();