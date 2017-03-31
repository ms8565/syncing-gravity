let canvas;
let ctx;
let walkImage; //spritesheet for character
let slashImage; //image for attack
//our websocket connection 
let socket; 
let hash; //user's unique character id (from the server)
let animationFrame; //our next animation frame function

let squares = {}; //character list
let attacks = []; //attacks to draw on screen

//handle for key down events
const keyDownHandler = (e) => {
  var keyPressed = e.which;
  const square = squares[hash];

  // A OR LEFT
  if(keyPressed === 65 || keyPressed === 37) {
    square.moveLeft = true;
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    square.moveRight = true;
  }
};

//handler for key up events
const keyUpHandler = (e) => {
  var keyPressed = e.which;
  const square = squares[hash];

  // A OR LEFT
  if(keyPressed === 65 || keyPressed === 37) {
    square.moveLeft = false;
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    square.moveRight = false;
  }
  //Space key was lifted
  else if(keyPressed === 32) {
    sendAttack(); //call to invoke an attack
  }
};

const init = () => {
  walkImage = document.querySelector('#walk');
  slashImage = document.querySelector('#slash');
  
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  socket = io.connect();

  socket.on('joined', setUser); //when user joins
  socket.on('updatedMovement', update); //when players move
  socket.on('left', removeUser); //when a user leaves

  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
};

window.onload = init;