const directions = {
  DOWNLEFT: 0,
  DOWN: 1,
  DOWNRIGHT: 2, 
  LEFT: 3,
  UPLEFT: 4,
  RIGHT: 5, 
  UPRIGHT: 6,
  UP: 7
};

const spriteSizes = {
  WIDTH: 61,
  HEIGHT: 121
};

const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};

const redraw = (time) => {
  updatePosition();

  ctx.clearRect(0, 0, 500, 500);

  const keys = Object.keys(squares);

  for(let i = 0; i < keys.length; i++) {
    const square = squares[keys[i]];

    if(square.alpha < 1) square.alpha += 0.05;

    if(square.hash === hash) {
      ctx.filter = "none"
    }
    else {
      ctx.filter = "hue-rotate(40deg)";
    }

    square.x = lerp(square.prevX, square.destX, square.alpha);
    square.y = lerp(square.prevY, square.destY, square.alpha);

    if(square.frame > 0 || (square.moveUp || square.moveDown || square.moveRight || square.moveLeft)) {
      square.frameCount++;

      if(square.frameCount % 8 === 0) {
        if(square.frame < 7) {
          square.frame++;
        } else {
          square.frame = 0;
        }
      }
    }

    ctx.drawImage(
      walkImage, 
      spriteSizes.WIDTH * square.frame,
      spriteSizes.HEIGHT * square.direction,
      spriteSizes.WIDTH, 
      spriteSizes.HEIGHT,
      square.x, 
      square.y, 
      spriteSizes.WIDTH, 
      spriteSizes.HEIGHT
    );
    
    ctx.strokeRect(square.x, square.y, spriteSizes.WIDTH, spriteSizes.HEIGHT);
  }

  animationFrame = requestAnimationFrame(redraw);
};

let canvas;
let ctx;
let walkImage;
let slashImage;
let socket; 
let hash;
let animationFrame;

let squares = {};
let attacks = [];

const keyDownHandler = (e) => {
  var keyPressed = e.which;
  const square = squares[hash];

  if(keyPressed === 65 || keyPressed === 37) {
    square.moveLeft = true;
    square.moveRight = false;
  }
  else if(keyPressed === 68 || keyPressed === 39) {
    square.moveRight = true;
    square.moveLeft = false;
  }
};

const keyUpHandler = (e) => {
  var keyPressed = e.which;
  const square = squares[hash];

  if(keyPressed === 65 || keyPressed === 37) {
    square.moveLeft = false;
  }
  else if(keyPressed === 68 || keyPressed === 39) {
    square.moveRight = false;
  }
  else if(keyPressed === 32) {
    sendJump();
  }
};

const init = () => {
  walkImage = document.querySelector('#walk');
  slashImage = document.querySelector('#slash');
  
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  socket = io.connect();

  socket.on('joined', setUser);
  socket.on('updatedMovement', update);
  socket.on('left', removeUser);

  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
};

const update = (data) => {
  if(!squares[data.hash]) {
    squares[data.hash] = data;
    return;
  }

  if(squares[data.hash].lastUpdate >= data.lastUpdate) {
    return;
  }

  const square = squares[data.hash];
  square.prevX = data.prevX;
  square.prevY = data.prevY;
  square.destX = data.destX;
  square.destY = data.destY;
  square.direction = data.direction;
  square.moveLeft = data.moveLeft;
  square.moveRight = data.moveRight;
  square.velocityY = data.velocityY;
  square.alpha = 0.05;
};

const removeUser = (data) => {
  if(squares[data.hash]) {
    delete squares[data.hash];
  }
};

const setUser = (data) => {
  hash = data.hash;
  squares[hash] = data;
  requestAnimationFrame(redraw);
};

const sendJump = () => {
  const square = squares[hash];
  
  socket.emit('jump', square);
};

const updatePosition = () => {
  const square = squares[hash];

  square.prevX = square.x;
  square.prevY = square.y;
  
  console.log(square.velocityY);
  square.destY+= square.velocityY;
  if(square.destY <= 0) square.destY = 1;
  if(square.destY >= 400) square.destY = 399;

  if(square.moveLeft && square.destX > 0) {
    console.log("moving left");
    square.destX -= 2;
  }
  if(square.moveRight && square.destX < 400) {
    console.log("moving right");
      square.destX += 2;
  }

  if(square.moveLeft) square.direction = directions.LEFT;

  if(square.moveRight) square.direction = directions.RIGHT;

  square.alpha = 0.05;

  socket.emit('movementUpdate', square);
};

window.onload = init;