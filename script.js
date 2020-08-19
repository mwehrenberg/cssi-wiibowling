/* global stroke, noStroke, text, time, deltaTime, floor, pmouseX, pmouseY, mouseIsPressed, collidePointCircle, mouseX, mouseY, circle, width, height, 
background, createCanvas, colorMode, HSB,  fill, rect, stroke, line, collideLineCircle, collideCircleCircle, millis */

let ball, readyToRoll;
let pinArray;
let leftWall, rightWall;
let walls;
let score = 0, round = 0;

//variables for time
let pickUp = true;
let startTime, endTime, deltaTime;

//variables for ball position
let startx, starty, endx, endy, deltax, deltay;

let gameStarted;

function setup(){
  createCanvas(400, 500);
  colorMode(HSB, 360, 100, 100);
  
  ball = new BowlingBall();
  readyToRoll = false;
  
  pinArray = new PinArray();
  pinArray.makeArray();
  
  leftWall = new Wall(width/4, 0, width/4, height);
  rightWall = new Wall(3*width/4, 0, 3*width/4, height);
  walls = [leftWall, rightWall];
  
  gameStarted = false;
}

function draw(){
  drawBackground();
  noStroke();
  fill(0);
  // text(`Round: ${round}`, 10, 20);
  text(`Score: ${score}`, 10, 20);
  stroke(0);
  
  //wall functions
  leftWall.showSelf();  
  rightWall.showSelf();
  
  //ball functions
  ball.show();
  ball.move();
  ball.checkPos();
  ball.checkWallCollision(walls);
  if (readyToRoll) {
    ball.roll();
  }
  ball.reachEnd();
  
  //pinarray functions (called for each pin)
  pinArray.showSelf();
  pinArray.doBallCollisions(ball);  
  pinArray.doWallCollisions(walls);
  pinArray.doPinCollisions();
  pinArray.moveAll();
  pinArray.reachEnd();
}

class BowlingBall {
  constructor(){
    this.x = width/2;
    this.y = height - 50;
    this.size = 12;
    this.xVelocity = 5;
    this.yVelocity = -5;
    this.weight = 8;
  }
  
  checkPos(){
    if (ball.y < 0){
      readyToRoll = false;
    }
  }
  
  //draws the ball onto the canvas
  show() {
    fill(0, 50, 50);
    circle(this.x, this.y, this.size);
  }
  
  //Handles the throwing of the ball
  move() {
    if (mouseIsPressed && this.y > height - 100) {
      //update time and starting position
      if (pickUp) {
        startTime = millis();
        startx = this.x;
        starty = this.y;
        console.log(`Start time here: ${startTime}`)
      }
      pickUp = false;
      
      //update ball position
      this.x += (mouseX - pmouseX);
      this.y += (mouseY - pmouseY);
      
      //make sure ball is stays in lane
      if(this.x - this.size < width/4){
        this.x = width/4 + this.size;
      }
      if(this.x + this.size > 3*width/4){
        this.x = 3*width/4 - this.size;
      }
      if(this.y + this.size > height){
        this.y = height - this.size;
      }
      if(this.y - this.size < height - 100){
        this.y = height - 100 + this.size;
      }
    }
  }
  
  //moves the ball every frame
  roll(){
    this.x += this.xVelocity;
    this.y += this.yVelocity;
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
    if (this.xVelocity == 0 && this.yVelocity == 0) {
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
    round++;
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

//handles the release part of the throwing of the ball
function mouseReleased() {
  if(ball.y > height - 100){
    endTime = millis();
    deltaTime = endTime - startTime;

    endx = ball.x;
    deltax = endx - startx;

    endy = ball.y;
    deltay = endy - starty;

    //calculate ball speed based on throw
    ball.xVelocity = 20 * (deltax / deltaTime);
    ball.yVelocity = 20 * (deltay / deltaTime);

    readyToRoll = true;
    startTime = 0;
    endTime = 0;
    deltaTime = 0;
    startx = 0;
    endx = 0;
    deltax = 0;
    starty = 0;
    endy = 0;
    deltay = 0;
  }
}

//runs at start of game, chooses angle for ball throw
function throwBall() {
  
  
  
  ball.xVelocity = 
  ball.yVelocity = 
  gameStarted = true;
}
