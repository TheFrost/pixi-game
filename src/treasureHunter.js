// hack reload to parceljs
if (module.hot) module.hot.dispose(() => window.location.reload());

import * as PIXI from 'pixi.js';

// Aliases
const { 
  Application, 
  Container, 
  loader,
  Graphics,
  Sprite,
  Text,
  TextStyle } = PIXI;

const { resources } = PIXI.loader;

const { TextureCache } = PIXI.utils;

// Create a Pixi Application
const app = new Application({
  width: 512,
  height: 512,
  antialias: true,
  transparent: false,
  resolution: 1
});

const treasureHunterPATH = 'images/treasureHunter.json';

// Add the canvas that pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

// Define variables that might be used in more than one function
let state, explorer, treasure, blobs, chimes, exit, player, dungeon, door, healthBar, message, gameScene, gameOverScene, enemies, id;

const setup = () => {
  //make the game scene and add it to the stage
  gameScene = new Container();
  app.stage.addChild(gameScene);

  // make the sprites and add them to the 'gameScene'
  // create an alias for the texture atlas frame ids
  id = resources[treasureHunterPATH].textures;

  // dungeon
  dungeon = new Sprite(id['dungeon.png']);
  gameScene.addChild(dungeon);

  // door
  door = new Sprite(id['door.png']);
  door.position.set(32, 0);
  gameScene.addChild(door);

  // explorer
  explorer = new Sprite(id['explorer.png']);
  explorer.x = 68;
  explorer.y = gameScene.height/2 - explorer.height/2;
  explorer.vx = 0;
  explorer.vy = 0;
  gameScene.addChild(explorer);

  // treasure
  treasure = new Sprite(id['treasure.png']);
  treasure.x = gameScene.width - treasure.width - 48;
  treasure.y = gameScene.height/2 - treasure.height/2;
  gameScene.addChild(treasure);

  // make the blobs
  const numberOfBlobs = 6,
        spacing = 48,
        xOffset = 150,
        speed = 2;
  
  let direction = 1;

  // an array to store all the blob monster
  blobs = [];

  // make as many blobs as there are 'numberOfBlobs'
  for (let i = 0; i < numberOfBlobs; i++) {
    // make a blob
    const blob = new Sprite(id['blob.png']);

    // space each blob horizontally according to the 'spacing' value.
    // 'xOffset' determines the point of the left of the screen at wich the first blob shuld be added
    const x = spacing * i + xOffset;

    // give the blob a random y position
    const y = randomInt(0, app.stage.height - blob.height);

    // set the blob's position
    blob.x = x;
    blob.y = y;

    // set the blob's vertical velocity. 'direction' will be either '1' or '-1'. '1' means the enemy will move down and '-1' means the blob will move up. Multiplying 'direction' by 'speed' determines the blob's vertical direction.
    blob.vy = speed * direction;

    // reverse the direction for the next blob
    direction *= -1;

    // push the blob into the blobs array
    blobs.push(blob);

    // add the blob to the 'gameScene'
    gameScene.addChild(blob);
  }

  // create the health bar
  healthBar = new Container();
  healthBar.position.set(app.stage.width - 170, 4);
  gameScene.addChild(healthBar);

  // create the black background rectangle
  const innerBar = new Graphics();
  innerBar.beginFill(0x000000);
  innerBar.drawRect(0, 0, 128, 8);
  innerBar.endFill();
  healthBar.addChild(innerBar);

  // create the fron red rectangle
  const outerBar = new Graphics();
  outerBar.beginFill(0xFF3300);
  outerBar.drawRect(0, 0, 128, 8);
  outerBar.endFill();
  healthBar.addChild(outerBar);

  healthBar.outer = outerBar;

  // create the 'gameOver' scene
  gameOverScene = new Container();
  app.stage.addChild(gameOverScene);

  // make the 'gameOver' scene invisible when the game first starts
  gameOverScene.visible = false;

  // create the text sprite and add it to the 'gameOver' scene
  const style = new TextStyle({
    fontFamily: "Futura",
    fontSize: 64,
    fill: 'white'
  });
  message = new Text('The End', style);
  message.x = 120;
  message.y = app.stage.height/2 - 32;
  gameOverScene.addChild(message);

  // capture the keyboard arrow keys
  const left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40);

  // left arrow key 'press' method
  left.press = () => {
    // changes the explore's velocity when the key is pressed
    explorer.vx = -5;
    explorer.vy = 0;
  };

  // left arrow key 'release' method
  left.release = () => {
    // if the left arrow has been released, and the right arrow, isn't down, and the explorer isn't moving vertically: Stop the explorer
    if (!right.isDown && explorer.vy === 0) {
      explorer.vx = 0;
    }
  }

  //Up
  up.press = () => {
    explorer.vy = -5;
    explorer.vx = 0;
  };

  up.release = () => {
    if (!down.isDown && explorer.vx === 0) {
      explorer.vy = 0;
    }
  };

  //Right
  right.press = () => {
    explorer.vx = 5;
    explorer.vy = 0;
  };

  right.release = () => {
    if (!left.isDown && explorer.vy === 0) {
      explorer.vx = 0;
    }
  };

  //Down
  down.press = () => {
    explorer.vy = 5;
    explorer.vx = 0;
  };

  down.release = () => {
    if (!up.isDown && explorer.vx === 0) {
      explorer.vy = 0;
    }
  };

  // set the game state
  state = play;

  // start the game loop
  app.ticker.add(delta => gameLoop(delta));
};

// update the current game state
const gameLoop = delta => state(delta);

const play = (delta) => {
  // use the explorer's velocity to make it move
  explorer.x += explorer.vx;
  explorer.y += explorer.vy;

  // contain the explorer inside the area of the dungeon
  contain(explorer, { x: 28, y: 10, width: 488, height: 480 });
  // contain(explorer, stage);

  // set 'explorerHit' to 'false' before checking for a collition
  let explorerHit = false;

  // loop through all the sprites in the 'enemies' array
  blobs.forEach(blob => {
    // move the blob
    blob.y += blob.vy;

    // check the blob's screen boundaries
    const blobHitsWall = contain(blob, { x: 28, y: 10, width: 488, height: 480 });

    // if the blob hits the top or bottom of the stage, reverse its direction
    if (blobHitsWall === 'top' || blobHitsWall === 'bottom') {
      blob.vy *= -1;
    }

    // test for a collition. if any of the enemies are touching the explorer, set 'explorerHit' to true
    if (hitTestRectangle(explorer, blob)) {
      explorerHit = true;
    }
  });

  // if the explorer is hit...
  if (explorerHit) {
    // make the explorer semi-transparent
    explorer.alpha = 0.5;

    // reduce the width of the health bar's inner rectangle by 1 pixel
    healthBar.outer.width -= 1;
  } else {
    // make the explorer full opaque (non-transparent) if isn't been hit
    explorer.alpha = 1;
  }

  // check for a collition between the explorer and the treasure
  if (hitTestRectangle(explorer, treasure)) {
    // if the treasure is touching the explorer, center is hover the explorer
    treasure.x = explorer.x + 8;
    treasure.y = explorer.y + 8;
  }

  // does the explorer have enough health? if the width of the 'innerBar' is less than zero, end the game and display 'Youre lost!'
  if (healthBar.outer.width < 0) {
    state = end;
    message.text = 'You lost!'
  }

  // if the explorer has brought the treasure to the exit, end the game and display 'You won!'
  if (hitTestRectangle(treasure, door)) {
    state = end;
    message.text = 'You won!'
  }
};

const end  = () => {
  gameScene.visible = false;
  gameOverScene.visible = true;
}

// init
loader
  .add(treasureHunterPATH)
  .load(setup);

/* Helper functions */
function contain(sprite, container) {
  let collision = undefined;
  //Left
  if (sprite.x < container.x) {
    sprite.x = container.x;
    collision = "left";
  }
  //Top
  if (sprite.y < container.y) {
    sprite.y = container.y;
    collision = "top";
  }
  //Right
  if (sprite.x + sprite.width > container.width) {
    sprite.x = container.width - sprite.width;
    collision = "right";
  }
  //Bottom
  if (sprite.y + sprite.height > container.height) {
    sprite.y = container.height - sprite.height;
    collision = "bottom";
  }
  //Return the `collision` value
  return collision;
}
//The `hitTestRectangle` function
function hitTestRectangle(r1, r2) {
  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  //hit will determine whether there's a collision
  hit = false;
  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2; 
  r1.centerY = r1.y + r1.height / 2; 
  r2.centerX = r2.x + r2.width / 2; 
  r2.centerY = r2.y + r2.height / 2; 
  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;
  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;
  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;
  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {
    //A collision might be occuring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {
      //There's definitely a collision happening
      hit = true;
    } else {
      //There's no collision on the y axis
      hit = false;
    }
  } else {
    //There's no collision on the x axis
    hit = false;
  }
  //`hit` will be either `true` or `false`
  return hit;
};
//The `randomInt` helper function
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
//The `keyboard` helper function
function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };
  //The `upHandler`
  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };
  //Attach event listeners
  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}