"use strict";

const io = require('console-read-write');
//const config = require('./config/config');
var brain = require("./brain/brain")

var _brain = null

// Reading the input from the user that initiated the process.
let WWidth  = process.argv[2] || 60;    // Reading the 3rd argument as the World width
let WHeight = process.argv[3] || 30;    // Reading the 3rd argument as the World height

let SHx = process.argv[4] || 15;   //Snake head X coordinate
let SHy = process.argv[5] || 30;   //Snake head Y coordinate
let Sl  = process.argv[6] || 3;   // Snake length in segments including the head
let Sd  = process.argv[7] || 'N'; // Snake movement direction [N,S,E,W]
let lastSd = Sd;
let SdNumber = 0 // S

// Constants defined that render the world.
const WC = '+'; // world corner
const WV = '|'; // world vertical wall (edge)
const WH = '-'; // world horizontal wall (edge)
const WS = ' '; // world space (a space character)
const SH = 'O'; // snake head
const SB = 'o'; // snake body
const SF = '$'; // snake food
const SC = '*'; // snake collision

const SCORE_SURVIVED = 0//-1
const SCORE_RIGHT_DIRECTION =1
const SCORE_DEATH = -1000
const SCORE_EAT = 5000
const SCORE_ACTIVATION = 0.3

let FAST = false
let DISABLE_IA = false
let timering = 1;
let sleepTime = 1;
let fType = 0 // 0 -> random , 1 -> defined

let interactions = 0;
let score = 0;
let eats = 0;
let steps = 0;
let steps2 = 0;
let max_steps = 3000;
let max_value = 1;
let best_score = 0;
let act = 0;
let food = {
  x:0,
  y:0
}
let lastDistance = 0

let readedSignals = []

let dFromFood = 0;
let foodPositions =  [[4,5],[10,10],[20,10],[11,2],[7,7],[5,4]]
let fpCount = 0
let actValue = 0;

let snake = [[SHx, SHy]];
let Br         = SHx;
let Bc         = SHy;
let hasExceded = false;

// Define the World
let world = []; // A 2 dimensional matrix (Array of Arrays => Array of rows which is an array of row cells)
let timer = null;

function initGame() {
  SHx = process.argv[4] || 15;   //Snake head X coordinate
  SHy = process.argv[5] || 30;   //Snake head Y coordinate
  Sl  = process.argv[6] || 3;   // Snake length in segments including the head
  Sd  = process.argv[7] || 'N'; // Snake movement direction [N,S,E,W]
  lastSd = Sd;
  SdNumber = 1 // N
  fpCount = 0
  actValue = 0;

  interactions++
  score = 0;
  steps = max_steps;
  steps2 = 0;
  act = 0;
  food.x = 0
  food.y = 0
  lastDistance = 0
  eats = 0

  for (let row = 0; row < WHeight; row++) {
    world[row] = [];
    for (let col = 0; col < WWidth; col++) {
      world[row][col] = WS;
    }
  }  

  // Set the world corners
  world[0][0]                    = WC; // Top Left cell
  world[WHeight - 1][0]          = WC; // Bottom Left cell
  world[0][WWidth - 1]           = WC; // Top Right cell
  world[WHeight - 1][WWidth - 1] = WC; // Bottom Right cell

    // Set the world Vertical Walls (edges)
  for (let row = 1; row < WHeight - 1; row++) {
    world[row][0] = world[row][WWidth - 1] = WV;
  }
  // Set the world Horizontal Walls (edges)
  for (let col = 1; col < WWidth - 1; col++) {
    world[0][col] = world[WHeight - 1][col] = WH;
  }

  snake = [[SHx, SHy]];
  Br         = SHx;
  Bc         = SHy;
  hasExceded = false;

  for (let body = 0; body < Sl; body++) {
    hasExceded = move(Sd.toUpperCase())
    if(hasExceded) {
      break;
    }
  }

  // Obstaculos
  world[10][10] = WC
  world[10][11] = WH
  world[10][12] = WH
  world[10][13] = WH
  world[10][14] = WH
  world[10][15] = WH
  world[10][16] = WC

  world[20][20] = WC
  world[20][21] = WH
  world[20][22] = WH
  world[20][23] = WH
  world[20][24] = WH
  world[20][25] = WH
  world[20][26] = WC

  world[15][45] = WC
  world[16][45] = WV
  world[17][45] = WV
  world[18][45] = WV
  world[19][45] = WV
  world[20][45] = WV
  world[21][45] = WC
}

function move(command){
  hasExceded = false
  switch (command) {
    // Column movement
    case 'W':
      SdNumber = 2
      Bc--;
      break;
    case 'E':
      SdNumber = 3
      Bc++;
      break;
    // Row movement
    case 'N':
      SdNumber = 1
      Br++;
      break;
    case 'S':
      SdNumber = 0
      Br--;
      break;
  }
  if ((0 < Br) && (Br < WHeight - 1) && (0 < Bc) && (Bc < WWidth - 1)) {
    snake.push([Br, Bc]);
    // world[Br][Bc] = SB;
  } else {
    hasExceded = true;
  }
  return hasExceded
}

function _inSnake(r, c, snakeArray) {
  for (let snakeSegmentIndex = 0; snakeSegmentIndex < snakeArray.length; snakeSegmentIndex++) {
    let snakeSegmentCoordinates = snakeArray[snakeSegmentIndex];
    if (snakeSegmentCoordinates[0] === r && snakeSegmentCoordinates[1] === c) {
      return snakeSegmentIndex;
    }
  }
  return -1;
}

/**
 * Serializes the world matrix into an ASCII string
 * @param {string[][]} worldMatrix
 * @param {string[]} snakeArray
 * @returns {string}
 */
function world2string(worldMatrix, snakeArray) {
  let s = ""; // Accumulator|Aggregator (this value accumulates the result of the following loops.
  if(!FAST)
  for (let row = 0; row < worldMatrix.length; row++) {
    for (let col = 0; col < worldMatrix[row].length; col++) {
      // if the coordinates (row, col) are present in the snake draw the corresponding character otherwise draw what
      // ever is in the World.
      let snakeSegmentIndex = _inSnake(row, col, snakeArray);
      if (snakeSegmentIndex < 0 || worldMatrix[row][col] === SC) {
        s += worldMatrix[row][col];
      } else {
        if (snakeSegmentIndex === 0) {
          s += SH;
        } else {
          s += SB;
        }
      }
    }
    s += '\n';
  }
  s+= `Eats ${eats} | Score: ${score} | Steps Left: ${steps} | Decision: ${Sd} | AFF: ${angleFromFood(snake,food,Sd)}
Readed: ${readedSignals} | Food: ${JSON.stringify(food)} | Snake: ${snake[0]} | Interactions: ${interactions} | Best: ${best_score}
\nState:${ JSON.stringify(_brain.memory)} \n`
  return s;
}

/**
 * Draws the world to the screen
 * @param {string[][]} worldMatrix
 * @param {number[]} snakeArray
 */
function drawWorld(worldMatrix, snakeArray) {
  // console.log(WWidth, WHeight);
  if (hasExceded) {
    console.warn('Snake body exceeded world');
  }
  // console.log(world2string(worldMatrix, snakeArray));
  process.stdout.write('\x1Bc'); //Reset the caret position
  process.stdout.write(world2string(worldMatrix, snakeArray));
}

function snakeMovement(snake, direction) {
  direction = direction || Sd;
  let head  = snake[0];
  steps--;
  direction = direction.toUpperCase()
  switch (direction) {
    // Column movement
    case 'N':
      SdNumber = 1  
      SHx = head[0] - 1;
      SHy = head[1];
      break;
    case 'S':
      SdNumber = 0
      SHx = head[0] + 1;
      SHy = head[1];
      break;
    // Row movement
    case 'W':
      SdNumber = 2
      SHx = head[0];
      SHy = head[1] - 1;
      break;
    case 'E':
      SdNumber = 3
      SHx = head[0];
      SHy = head[1] + 1;
      break;
  }
// if is NOT valid (SHx, SHy) Game over
  if (isTheFieldEmpty(SHx, SHy)) {
    if (_inSnake(SHx, SHy, snake) < 0) {
      snake.unshift([SHx, SHy]);
      snake.pop();
      //brain.learn(_brain,readedSignals,lastSd,direction,SCORE_DEATH)
    } else if(checkBackDirection(direction)){
     //snakeMovement(snake,lastSd)
    }else {
      world[SHx][SHy] = SC;
      drawWorld(world, snake);
      //console.log();
      brain.learn(_brain,readedSignals,lastSd,direction,SCORE_DEATH)
      endGame('Game Over! The snake had hit itself in the body!')
    }
  } else if (isFood(SHx, SHy)) {
    score+= SCORE_EAT;
    eats++;
    steps +=max_steps;
    world[SHx][SHy] = WS;
    snake.unshift([SHx, SHy]);
    spawnFood();
    brain.learn(_brain,readedSignals,lastSd,direction,SCORE_EAT)
  } else {
    world[SHx][SHy] = SC;
    drawWorld(world, snake);
    //console.log();
    endGame('Game Over! The snake had hit a wall!')
  }
  lastSd = direction
}

function checkBackDirection(direction){
  return (direction == 'S' && lastSd == 'N') || (direction == 'N' && lastSd == 'S') || (direction == 'W' && lastSd == 'E') || (direction == 'E' && lastSd == 'W')
}

function isTheFieldEmpty(r, c) {
  return world[r][c] === WS;
}

function isFood(r, c) {
  return (world[r][c] === SF)
}

function getRandomNumber(min, max) {
  // Nice copy-paste, except that max is not the maximum but the supremum
  return Math.floor(Math.random() * (max - min) + min);
}

function spawnFood(r, c) {
  if (!r || !c) {
    do {
      if(fType == 0){
        r = getRandomNumber(1, WHeight - 2);
        c = getRandomNumber(1, WWidth - 2);
      }else{
        if(fpCount>= foodPositions.length) fpCount= 0
        r = foodPositions[fpCount][0]
        c = foodPositions[fpCount][1]
        fpCount++
      }
    } while (isTheFieldEmpty(r, c) && !_inSnake(r, c, snake));
  } // TODO: Verify that the input is sane (0<r<H-1 && 0<c<W-1)
  food.x= r
  food.y = c
  world[r][c] = SF;
}

function getColisionY(head,mult,balance){
  let result = 0
  if((head[0]+(1*mult))<0 || (head[0]+(1*mult))>=WHeight || head[1]<0 || head[1]>= WWidth)
    return 1
  let elem = world[head[0] +(1*mult) ][head[1]]
  if(elem != WS){
    result = elem == SF? 2:1 // 2 -> comida 1 -> obstaculo
  }
  result = (_inSnake(head[0]+(balance*mult),head[1],snake) == -1 && result == 0)?0:result
  return result // Nothing
}

function getColisionX(head,mult,balance){
  let result = 0
  if(head[0]<0 || head[0]>=WHeight || (head[1]+(1*mult))<0 || (head[1]+(1*mult))>= WWidth)
    return 1
  let elem = world[head[0]][head[1]+(1*mult)]
  if(elem != WS){
    result = elem == SF? 2:1 // 2 -> comida 1 -> obstaculo
  }

  result = (_inSnake(head[0],head[1]+(balance*mult),snake) == -1 && result == 0 )?0:result

return result // Nothing
}


function getColisionY_old(head,mult){
    for(let i=head[0] ; i < WWidth && i> 0; i +=1*mult){
      let elem = world[i][head[1]]
      if(elem != WS){
        if(elem == SF) return [i,10] // Comida
        return [i,-10]
      }
    }
    return [WWidth,0]
}

function getColisionX_old(head,mult){
  for(let i=head[1] ; i < WHeight && i> 0; i += 1*mult){
    let elem = world[head[0]][i]
    if(elem != WS){
      if(elem == SF) return [i,10] // Comida
      return [i,-10]
    }
  }
  return [WWidth,0]
}


function ColisionFrontDistance(snake,directionTaked){
    let head = snake[0] // x,y
    let front = []
    let left = []
    let right = []
    switch(directionTaked){
      case 'N':
        front = getColisionY(head,-2,0.5)
        left = getColisionX(head,-2,0.5)
        right = getColisionX(head,2,0.5)
      break;
      case 'S':
        front =  getColisionY(head,2,0.5)
        left = getColisionX(head,2,0.5)
        right = getColisionX(head,-2),0.5
      break;
      case 'W':
        front = getColisionX(head,-2)
        left = getColisionY(head,1,1)
        right = getColisionY(head,-1,1)
      break;
      case 'E':
        front = getColisionX(head,2)
        left = getColisionY(head,-1,1)
        right = getColisionY(head,1,1)
      break;
    }
    
    return [left,front,right]//[left[0],front[0],right[0],left[1],front[1],right[1]]
}

// f.x = 
function angleFromFood(snake,f,direction){
  let head = snake[0]
  let angle = 0;
  let mult = 1;
  switch(direction){
    case 'W': // Esquerda
      if(f.x>head[0]) angle = -1
      else if(f.x<head[0]) angle = 1
      else if(f.y > head[1]) angle = 2
     break;

    case 'E': // Direita
      if(f.x<head[0]) angle = -1 
      else if(f.x>head[0]) angle = 1
      else if(f.y < head[1]) angle = 2
      break;
    
    case 'N': // Cima
      if(f.y<head[1]) angle = -1
      else if(f.y>head[1]) angle = 1
      else if(f.x < head[0]) angle = 2
      break;
    case 'S': // Baixo
      if(f.y>head[1]) angle = -1
      else if(f.y<head[1]) angle = 1
      else if(f.x > head[0]) angle = 2
      break;
    }
    return angle//*mult
}

function distanceFromFood(snake,f){
  let head = snake[0]
  let a = head[1] - f.x;
  let b = head[0] - f.y;
  let d = Math.abs(Math.sqrt( a*a + b*b )/1000)
  dFromFood = d
  //console.log(snake[0],f,1-d)
  return 1 - d
}

// ================== IA

function arrayToSignal(readed_signal) {
  let signal = ""
  readed_signal.map((s) => {
    signal += `${s};`
  })
  return signal
}


function IA(snake){
  if(steps <= 0){
    endGame('GAME OVER: End steps')
  }
  //Get params
  let colision = ColisionFrontDistance(snake,Sd)
  let signals = [angleFromFood(snake,food,Sd)]
  readedSignals = colision.concat(signals)
  readedSignals = arrayToSignal(readedSignals)
  let decision = brain.takeDecision(_brain,readedSignals,Sd)
  if(decision != Sd) {steps--; steps2++;}
  if(!DISABLE_IA)
    Sd = decision
  return decision
}

//Start the game
initGame();
//spawnFood(4, 5);
spawnFood();
brain.load((b) =>{
  //process.exit()
  _brain = b
  drawWorld(world, snake);
  loop(timering)
})
//spawnFood();


// Reading CLI input
const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', function (s, key) {
  switch (key.name) {
    case "up":
      Sd = 'N';
      break;
    case "down":
      Sd = 'S';
      break;
    case "left":
      Sd = 'W';
      break;
    case "right":
      Sd = 'E';
      break;
    case "c": // CTRL+C exit the game
      if (key.ctrl) {
        process.exit();
      }
      break;
  }
});

function loop(time){
  timer = setInterval(function () {
    IA(snake);
    computeScore()
    snakeMovement(snake);
    if(!FAST) drawWorld(world, snake);
  }, time);  
}

function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

function computeScore(){
  let dist = distanceFromFood(snake,food)
  let score = SCORE_SURVIVED
  if(dist < lastDistance)
    score = SCORE_RIGHT_DIRECTION
  
  //score += Math.round(dist)
  lastDistance = dist

  brain.learn(_brain,readedSignals,lastSd,Sd,score)

  return score
}

async function endGame(message){
  await clearInterval(timer)
  //brain.learn(_brain,readedSignals,lastSd,Sd,computeScore() + SCORE_DEATH)
  brain.saveState(_brain)

  if (eats > best_score) {
    best_score = eats
    brain.saveBestState(_brain,eats)
  }

  await sleep(sleepTime)
  initGame()
  //spawnFood(4, 5);
  spawnFood();
  drawWorld(world, snake);
  loop(timering)
}