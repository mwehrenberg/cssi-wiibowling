/* global stroke, noStroke, strokeWeight, text, time, deltaTime, floor, pmouseX, pmouseY, mouseIsPressed, collidePointCircle, mouseX, mouseY, circle, width, height, 
background, createCanvas, colorMode, HSB,  fill, rect, stroke, line, collideLineCircle, collideCircleCircle, millis */

let ball;
let pinArray;
let leftWall, rightWall;
let walls;
let score = 0, round = 1;
let ballThrows = 0;
let gameDone = false;
let gameStarted;

function setup(){
  createCanvas(400, 500);
  colorMode(HSB, 360, 100, 100);
  
  ball = new BowlingBall();
  //readyToRoll = false;
  
  pinArray = new PinArray();
  pinArray.makeArray();
  
  leftWall = new Wall(width/4, 0, width/4, height);
  rightWall = new Wall(3*width/4, 0, 3*width/4, height);
  walls = [leftWall, rightWall];
  
  gameStarted = false;
}

function draw(){
  drawBackground();
  if (round > 3) {
    gameOver();
  } 
  if (!gameDone){
    noStroke();
    fill(0);
    text(`Round: ${round}`, 10, 20);
    text(`Score: ${score}`, 10, 40);
  }
  stroke(0);
  
  throwBall(); 
  
  strokeWeight(1);
  
  //wall functions
  leftWall.showSelf();  
  rightWall.showSelf();
  
  //make the ball and pins show up
  ball.show();
  pinArray.showSelf();
  
  if(gameStarted){
    //ball functions
    ball.checkWallCollision(walls);
    ball.roll();
    ball.reachEnd();

    //pinarray functions (called for each pin)
    pinArray.doBallCollisions(ball);  
    pinArray.doWallCollisions(walls);
    pinArray.doPinCollisions();
    pinArray.moveAll();
    pinArray.reachEnd();
  }
}

class BowlingBall {
  constructor(){
    this.x = width/2;
    this.y = height - 50;
    this.size = 12;
    this.xVelocity = 0;
    this.yVelocity = 0;
    this.weight = 8;
    
    // positions of the finger holes
    this.dot1x = this.x+2;
    this.dot1y = this.y+2;
    this.dot2x = this.x-2;
    this.dot2y = this.y+2;
    this.dot3x = this.x;
    this.dot3y = this.y+6;
    
    this.dot1offset = 2;
    this.dot2offset = 2;
    this.dot3offset = 6;
    
    this.dot1hidden = false;
    this.dot2hidden = false;
    this.dot3hidden = false;
  }
  
  //draws the ball onto the canvas
  show() {
    fill(0, 50, 100);
    circle(this.x, this.y, this.size);
    fill(0);
    
    this.dot1x = this.x+2;
    this.dot1y = this.y+this.dot1offset;
    this.dot2x = this.x-2;
    this.dot2y = this.y+this.dot2offset;
    this.dot3x = this.x;
    this.dot3y = this.y+this.dot3offset;
    
    if(!this.dot1hidden){
      circle(this.dot1x, this.dot1y, 1);
    }
    
    if(!this.dot2hidden){
      circle(this.dot2x, this.dot2y, 1);
    }
    
    if(!this.dot3hidden){
      circle(this.dot3x, this.dot3y, 1);
    }
    
  }
  
  //moves the ball every frame
  roll(){
    this.x += this.xVelocity;
    this.y += this.yVelocity;
    
    //dot rolling animation
    this.dot1offset += this.yVelocity * 0.2;
    this.dot2offset += this.yVelocity * 0.2;
    this.dot3offset += this.yVelocity * 0.2;

    if(this.dot1y <= this.y - this.size + 2){
      this.dot1hidden = true;
      this.dot1offset = this.size * 2;
    }
    if(this.dot1y >= this.y + this.size - 1) {
      this.dot1hidden = true;
    }
    if(this.dot1y < this.y + this.size - 1 && this.dot1y > this.y - this.size + 2){
      this.dot1hidden = false;
    }
    
    if(this.dot2y <= this.y - this.size + 2){
      this.dot2hidden = true;
      this.dot2offset = this.size * 2;
    }
    if(this.dot2y >= this.y + this.size - 1) {
      this.dot2hidden = true;
    }
    if(this.dot2y < this.y + this.size - 1 && this.dot2y > this.y - this.size + 2){
      this.dot2hidden = false;
    }
    
    if(this.dot3y <= this.y - this.size + 2){
      this.dot3hidden = true;
      this.dot3offset = this.size * 2;
    } 
    if(this.dot3y >= this.y + this.size - 1) {
      this.dot3hidden = true;
    }
    if(this.dot3y < this.y + this.size - 1 && this.dot3y > this.y - this.size + 2){
      this.dot3hidden = false;
    }
  }
  
  //figures out if the ball is hitting a wall and bounces off of wall
  checkWallCollision(wallArray){
    for(let i = 0; i < wallArray.length; i++){
      if(wallArray[i].checkBallCollision(this)){
        this.xVelocity = -this.xVelocity;
      }
    }
  }
  
  // if ball has stopped or reached end zone, return ball to starting pos
  reachEnd() {
    if (Math.abs(this.xVelocity) < 0.05 && Math.abs(this.yVelocity) < 0.05) {
      this.returnBall();
    }
    if (this.y < this.size) {
      this.returnBall();
    }    
  }
  
  //resets ball position after round ends
  returnBall() {
    this.x = width/2;
    this.y = height - 50;
    this.xVelocity = 0;
    this.yVelocity = 0;
    ballThrows++;
    if (ballThrows == 2){
      roundReset();
      //round++;
      ballThrows = 0;
    }
    pinArray.resetVelocities();
    gameStarted = false;
  }
}

class Pin {
  constructor(x, y, index) {
    this.x = x;
    this.y = y;
    this.size = 10; 
    this.xVelocity = 0;
    this.yVelocity = 0;
    this.index = index;
    this.weight = 3;
  }
  
  //draws the pin every frame
  show() {
    fill(0, 0, 100);
    circle(this.x, this.y, this.size);
  }
  
  //moves the pin every frame
  move() {
    this.y += this.yVelocity;
    this.x += this.xVelocity;
  }
  
  //returns true if this pin has run into the ball
  checkBallCollision(ball) {
    var distance = Math.sqrt((ball.x - this.x)**2 + (ball.y - this.y)**2);
    return distance < (ball.size+this.size);
  }
  
  //keeps pin within lane when collided with walls
  checkWallCollision(wallArray){
    for(let i = 0; i < wallArray.length; i++){
      if(wallArray[i].checkPinCollision(this)){
        this.xVelocity = -this.xVelocity;
      }
    }
  }
  
  //returns true if this pin has run into the pin passed as an argument
  checkPinPinCollision(pin){
    var distance = Math.sqrt((pin.x - this.x)**2 + (pin.y - this.y)**2);
    return distance < (pin.size+this.size);
  }
  
  // check if the pin has reached the end zone
  atEnd() {
    if (this.y <= 0) {
     return true;
    }
    return false;
  }
  
  //assigns the xvelocity of the pin and ball once they collide 
  //(handles collisions for different masses)
  calculateCollisionX(obj){
    let pinAfterVelocity = 0;
    pinAfterVelocity = 2 * (obj.weight * obj.xVelocity)/(obj.weight + this.weight);
    this.xVelocity = pinAfterVelocity;
    
    let objAfterVelocity = 0;
    objAfterVelocity = ((obj.weight - this.weight) * obj.xVelocity)/(obj.weight + this.weight)
    obj.xVelocity = objAfterVelocity;
  }
  //assigns the yvelocity of the pin once they collide
  //(handles collisions for different masses)
  calculateCollisionY(obj){
    let pinAfterVelocity = 0;
    pinAfterVelocity = 2 * (obj.weight * obj.yVelocity)/(obj.weight + this.weight);
    this.yVelocity = pinAfterVelocity;
    
    let objAfterVelocity = 0;
    objAfterVelocity = ((obj.weight - this.weight) * obj.yVelocity)/(obj.weight + this.weight)
    obj.yVelocity = objAfterVelocity;
  }
  
  //sets pins' x velocities after collision (same mass collision)
  calculatePinCollisionX(pin){
    let tempV = this.xVelocity;
    this.xVelocity = pin.xVelocity;
    pin.xVelocity = tempV;
  }
  
  //sets pins' y velocities after collision (same mass collision)
  calculatePinCollisionY(pin){
    let tempV = this.yVelocity;
    this.yVelocity = pin.yVelocity;
    pin.yVelocity = tempV;
  }
}

class PinArray {
  constructor(){
    this.pins = [];
  }
  
  // initialize the array of pins with their positions
  makeArray() {
    let index = 0;
    for (let i = 0; i < 10; i++) {
      let x, y;
      if (i < 4) {
        x = (i + 1) * 40 + 100;
        y = 20;
      } else if (i < 7) {
        x = i * 40;
        y = 50;
      } else if (i < 9) {
        x = (i - 2) * 40 - 20;
        y = 80;
      } else {
        x = 200;
        y = 110;
      }
      this.pins.push(new Pin(x, y, index));
      index++;
    }
  }
  
  //called in draw() every frame: updates the position of every pin
  moveAll() {
    for (let i = 0; i < this.pins.length; i++){
      this.pins[i].move();
    }
  }
  
  //called in draw() every frame: puts the pins on the canvas
  showSelf(){
    for(let i = 0; i < this.pins.length; i++){
      fill(0, 0, 100);
      this.pins[i].show();
    }
  }
  
  // if a pin reaches the end zone, hide it and increment score by 1
  reachEnd() {
    for (let i = 0; i < this.pins.length; i++) {
      if (this.pins[i].atEnd()) {
        this.hidePin(i);
        score++;
      }
    }
  }
  
  // removes pin at given index from array
  hidePin(index) {
    this.pins.splice(index, 1); 
  }
  
  // check if any pins have collided with the wall
  doWallCollisions(wallArray){
    for(let i = 0; i < this.pins.length; i++){
      this.pins[i].checkWallCollision(wallArray);
    }
  }
  
  //checks if any pins have collided with the ball and changes the velocity of the pins accordingly
  doBallCollisions(ball){
    for(let i = 0; i < this.pins.length; i++){
      if(this.pins[i].checkBallCollision(ball)){        
        this.pins[i].calculateCollisionX(ball);
        this.pins[i].calculateCollisionY(ball);
      }
    }
  }
  
  //checks if any pins have collided with each other
  doPinCollisions() {
    for (let i = 0; i < this.pins.length; i++) {
      for (let j = i+1; j < this.pins.length; j++) {  //ensures each collision is only handled once
        if(this.pins[i].checkPinPinCollision(this.pins[j])){
          this.pins[j].calculatePinCollisionX(this.pins[i]);
          this.pins[j].calculatePinCollisionY(this.pins[i]);
        }
      }
    }
  }
  
  //removes all the pins from the array for reset purposes
  removeAll(){
    this.pins = [];
  }
  
  //sets all the speeds back to zero for reset purposes
  resetVelocities() {
    for(let i = 0; i < this.pins.length; i++){
      this.pins[i].xVelocity = 0;
      this.pins[i].yVelocity = 0;
    }
  }
}

class Wall{
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
  }
  
  //draws the wall on the canvas
  showSelf() {
    stroke('black');
    line(this.x1, this.y1, this.x2, this.y2);
  }
  
  checkBallCollision(ball){
    // returns true if if ball collides with wall
    if (this.x1 === width/4 && ball.x - ball.size < this.x1) {  
      return true;
    } else if (this.x1 === width/4*3 && ball.x + ball.size > this.x1){ 
      return true;
    }
    return false;
  }
  
  //returns true if pin collides with wall
  checkPinCollision(pin){
    if (this.x1 === width/4 && pin.x - pin.size < this.x1) {  
      return true;
    } else if (this.x1 === width/4*3 && pin.x + pin.size > this.x1){ 
      return true;
    }
    return false;
  }
  
}

//puts the brown rectangle for the alley
function drawBackground() {
  background(0, 0, 80);
  fill(30, 80, 80);
  rect(width/4, 0, width/2, height);
}

//runs at start of game, chooses angle for ball throw
function throwBall() {
  if(!gameStarted){
    
    let lineEndx = mouseX;
    let lineEndy = mouseY;
    if(lineEndy < height/2){
      lineEndy = height/2;
    }
    
    let lineLength = Math.sqrt((ball.x - lineEndx) ** 2 + (ball.y - lineEndy) ** 2);
    let hue = 150 - (lineLength / 1.5);
    stroke(hue, 100, 100);
    strokeWeight(5);
    line(ball.x, ball.y, lineEndx, lineEndy)
    
  
    if(mouseIsPressed){
      ball.xVelocity = (lineEndx - ball.x)/10;
      ball.yVelocity = (lineEndy - ball.y)/10;
      
      gameStarted = true;
    }
  }
}

function gameOver(){
  gameDone = true;
  gameStarted = false;
  fill(0);
  //strokeWeight(1);
  text("Game Over", width/2 - 30, height/2);
  text(`Final Score: ${score}`, width/2 - 35, height/2+20);
}

function roundReset(){
  round++;
  pinArray.resetVelocities();
  pinArray.removeAll();
  pinArray.makeArray();
}