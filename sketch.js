/*

 Game Project 8: Game Submission.
 - extensions: p5.sound.min.js.
 - It was difficult to create a proper gravity implementation. The code for that portion could be better with more tweeking and finetuning.
 - Please make sure to hit "space" when you reach the flag. Also, click the screen to redeem your reward.
 - I learn't about using objects, arrays, and forloops. These were useful in creating the aesthetic components of the game.
*/

let gameChar_x;
let gameChar_y;
let floorPos_y;
let scrollPos;
let gameChar_world_x;

let isLeft;
let isRight;
let isFalling;
let isPlummeting;
let isRising;


//letiable to introduce smooth transistions.
let easing;        
let alpha;
let acceleration;

//scoring
let game_score;
let flagpole;

//number of lives
let lives;

//object variables
let collectable;
let character;
let tree;
let cloud;
let mountain;
let canyon;

// Array variables.
let clouds;
let mountains;
let trees_x;
let canyons;

//Background variables
let arr;            // arr is the colour array for the background of the game.
let triangleWidth;  // triangleWidth determines the width of the patterns for the repeated shape in the background
let count;          // For iterating through background.

//sound effect variables and other celebtation variables
let jumpSound;
let song;
let fft; // fast fourier transform for signal processing.
let rewardClaimed;
let state;
let danceArr;
let displayDanceStage;

function preload()
{
    soundFormats('mp3','wav');
    
    //load your sounds here
    jumpSound = loadSound('Assets/SoundEffects/NinjaSoundEffect.mp3');
    song =  loadSound('Assets/SoundEffects/allthat.mp3');
    collectedSound = loadSound('Assets/SoundEffects/biting-an-apple.mp3');
    fallingSound = loadSound('Assets/SoundEffects/falling-screams-goofy.mp3');
    backgroundMusic = loadSound('Assets/SoundEffects/gamemusic-6082.mp3');
    
    //set volume
    jumpSound.setVolume(0.5);
}
function setup()
{
	createCanvas(1024, 576);
	floorPos_y = height * 3/4;
    lives = 3;
    
    // Initializing variables for Celebtation
    state = 0;
    danceArr = [];
    rewardClaimed = false;
    fft = new p5.FFT();
    populateDanceArray();
    displayDanceStage = false;
    
    startGame();
   
}

function draw()
{
    startGameMusic();
    drawBackground(triangleWidth,0,0);
    
	noStroke();
	fill(0,155,0);
    
    // Draw mountains.
    drawMountains(); 
    
    // Draw some green ground
    drawGrass();

	// Draw clouds.
    drawClouds();
    
	// Draw trees.
    drawTrees(); 
    
	// Draw canyons.
    for(let i = 0; i < canyons.length; i++)
    {
        drawCanyon(canyons[i]);
        checkCanyon(canyons[i]);
    }
	// Draw collectable items.
    for(let i = 0; i < collectables.length; i++)
        { 
            if(collectables[i].isFound == false)
            {
                drawCollectable(collectables[i]);
                checkCollectable(collectables[i]); 
              
            } 
        } 
    
    // Draw FlagPole
    push();
    translate(scrollPos,0); 
    renderFlagpole();
    pop();
    
	// Draw game character.
	drawGameChar();
    
    //Drawing score counter for character
    fill(255);
    noStroke();
    text("score: " + game_score, 20,20);
    
  
    
    
    //checking if player died
    checkPlayerDie();
    
    //conditionals for game over and level complete
    if(lives < 1){
        text("GAME OVER, no more lives :(, Refresh the page", width/2 - 100 ,height/2);
        return 0;
    }
    if(flagpole.isReached){
        text("Level complete press space to continue", width/2, height/2);
        if(displayDanceStage){
            drawDanceFloor();
            drawText();
            createWaveForm();
            if(rewardClaimed && song.isPlaying()){
                prepCharacter();
                startDancing();
            } 
        }
        return 0; 
    }
    
	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}

	// Logic to make the game character rise and fall.
    
    
    //GRAVITY (RISING)Section
    alpha= min(alpha+15,90); // required so that speed of jumping slows down at the top  and speeds up near the bottom
    if(floorPos_y-100 < gameChar_y && !isFalling && isRising && !isPlummeting) 
        {
            
            acceleration = 1/(Math.abs(floorPos_y+100-gameChar_y)*sin(alpha)*easing);
            gameChar_y -= 5 + acceleration
        }
    // GRAVITY (FALLING)Section
    else if(gameChar_y < floorPos_y && !isPlummeting)    
        {
            isRising = false;
            isFalling = true;
            acceleration = 1/(Math.abs(floorPos_y+2-gameChar_y)*sin(alpha)*easing); // incrementing till floorPos (added 2 so that it will overshoot and end exactly at floorPos_y)
            gameChar_y += 5 + acceleration;
        }
    //TOUCHING GROUND
    else if(gameChar_y >= floorPos_y && !isPlummeting) 
        {
            isFalling = false;
            gameChar_y = floorPos_y;
        }
    
    if(flagpole.isReached == false){
         checkFlagpole();
    }
	// Update real position of gameChar for collision detection.
    gameChar_world_x = gameChar_x - scrollPos;    
	
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed(){

    if(!flagpole.isReached)
    {
       if(key == 'A' || keyCode == 37)
        {
            isLeft = true;  
        }

        else if(key == 'D' || keyCode == 39)
        {
            isRight = true;
        }
    }
    
    if(keyCode == 32)
    {
        if(!flagpole.isReached && lives > 0 && !isPlummeting)
        {
            alpha = 0; // alpha resets acceleration used for gravity   
            if(gameChar_y == floorPos_y && !isPlummeting){
                isRising = true;
            }
            jumpSound.play();   
        }
        else if(lives > 0)  
        {                
            displayDanceStage = true;
        }

    } 
    
	
}
function keyReleased()
{
	if(key == 'A' || keyCode == 37)
	{
		isLeft = false;
	}

	if(key == 'D' || keyCode == 39)
	{
		isRight = false;
	}
} 

// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar()
{
    push();
    angleMode(DEGREES);
   
    character.pos(gameChar_x,gameChar_y);
    
    if(flagpole.isReached){
        character.jumpRight();
        return;
    }
    
	if(isLeft && (isFalling || isRising))
        {
            character.jumpLeft();
        }
	else if(isRight && (isFalling || isRising))
        {
            character.jumpRight();
        }
	else if(isLeft)
        {
            character.walkLeft();
        }
	else if(isRight)
        {
            character.walkRight();
        }
	else if((isFalling || isRising) || isPlummeting)
        {
            character.jumpFoward();
        }
	else
        {
            character.stand();
        }
    pop();
    
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawClouds(){
    push();
    translate(scrollPos*0.2,0);    // clouds move 20 percent of scrolling speed
    for(let i = 0; i < clouds.length; i++)
        {
            cloud.pos(clouds[i].pos_x,clouds[i].pos_y);
            cloud.showUp();
        }
    pop();
}

// Function to draw mountains objects.
function drawMountains(){
    push();
    angleMode(RADIANS);            // Rock levitation works in radians.
    translate(scrollPos*0.05,0);   // mountain scrolls 5 percent of scrolling speed instead.
    for(let i = 0; i < mountains.length; i++)
        {
            mountain.pos(mountains[i].pos_x,mountains[i].pos_y);
            mountain.showUp();
            mountain.size = 120;
            mountain.setLev(-0.05,0.1,-0.03,0.2);
        }
    pop();
}

// Function to draw trees objects.
function drawTrees(){
     push();
     translate(scrollPos,0);
     for(let i = 0; i < trees_x.length; i++)
            {          
                tree.pos(trees_x[i],floorPos_y);
                tree.showUp();
            }
    pop();
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon){
    push();
    translate(scrollPos,0);
    canyon.pos_x = t_canyon.pos_x;
    canyon.width = t_canyon.width;
    canyon.showUp();    
    pop();
}

// Function to check character is over a canyon.

function checkCanyon(t_canyon){
  let midpoint = t_canyon.pos_x + t_canyon.width/2;
  if(gameChar_world_x > t_canyon.pos_x && gameChar_world_x < (t_canyon.pos_x + t_canyon.width) && !(gameChar_y < floorPos_y)) 
      {
          gameChar_y += 8 ;
          gameChar_x = midpoint + scrollPos;
          isLeft = isRight = false;
          if(!isPlummeting){
            fallingSound.play(); // playing falling sound effect just once.
            isPlummeting = true;
          }          
      }
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.

function drawCollectable(t_collectable)
{
    push();
    translate(scrollPos,0);
    collectable.pos(t_collectable.pos_x,t_collectable.pos_y);
    collectable.size = 70;
    collectable.showUp();
    pop();
            
}

// Function to check character has collected an item.
function checkCollectable(t_collectable){
    // Interaction with the collectable. Character has "touched" a collectable if it is within 30 pixels.
    if(dist(gameChar_world_x,gameChar_y,t_collectable.pos_x, t_collectable.pos_y) < 30) 
        {
            t_collectable.isFound = true;
            game_score += 1;                // increasing score.
            collectedSound.play();
        }
}

// Function to draw ground/grass.
function drawGrass(){
	rect(0, floorPos_y, width, height/4); 
}

//-----------------------------------------------
// SKY Pattern function for colour assignment
//------------------------------------------------

// Function to display background colours (for the sky)
function drawBackground(baseWidth,startX,startY){
   count = 0;
   push();
   /* 
    For each repeated square pattern (2 triangles) we need 2 colours to fill the square.
    rowStatus tells us if the row is even or odd. Squares are mirrored from even rows to odd rows.
   */
   for(let j = startY; j < baseWidth*4; j+= baseWidth){
        let y = j;
        let rowStatus = y/baseWidth; 
       
        for (let i = startX; i < baseWidth*8; i+= baseWidth) {
            let x = i;
            let index = count;
            /* 
            If there are still colors available in our array for more triangles. Then we assign colour1 and colour2
            Colour in each triangle for every row (for a pair within the repeated square we have 2 colors).
            
            arr[] is our array of colours.
            */ 
            if(arr.length > count){ 
            
                let colour_1 = arr[count];
                let colour_2 = arr[++count];

                // EVEN ROW of background.
                if(rowStatus%2 == 0){
                    // triangle 1
                    stroke(colour_1);
                    fill(colour_1);
                    triangle(0+x,y,0+x,baseWidth+y,baseWidth+x,y); 
                    // triangle 2
                    stroke(colour_2);
                    fill(colour_2);                  
                    triangle(0+x,baseWidth+y,baseWidth+x,baseWidth+y,baseWidth+x,y);
                }
                
                // ODD row of background.
               else
                {
                    //triangle 1
                    stroke(colour_1);
                    fill(colour_1);
                    triangle(x,baseWidth+y,baseWidth+x,baseWidth+y,x,y);
                    //triangle 2
                    stroke(colour_2);
                    fill(colour_2);
                    triangle(0+x,y,baseWidth+x,baseWidth+y,baseWidth+x,y); 

                }
                count++;
            }
        }
    }
    pop();
}
function renderFlagpole(){
    push();
    strokeWeight(5);
    fill(255, 0, 0);
    stroke(255,0,0);
    if(flagpole.isReached){
        rect(flagpole.pos_x, floorPos_y - 250, 50, 50);
    }
    else{
        rect(flagpole.pos_x, floorPos_y - 50, 50, 50);
    }
    stroke(100);
    line(flagpole.pos_x, floorPos_y, flagpole.pos_x,floorPos_y - 250);
    pop();
}
function checkFlagpole(){
    let d = abs(gameChar_world_x - flagpole.pos_x);
    if(d < 15){
        flagpole.isReached = true;
        backgroundMusic.pause();
    }
}
function checkPlayerDie(){
     // Drawing number of lives left
     for(let i = 0; i < lives; i++){
            push();
            fill(255,0,0);
            ellipse(32+ (i*33),40 ,23);
            fill(255);
            ellipse(37+ (i*33),36 , 7 );
            ellipse(40 + (i*33),38, 4);
            pop();
        }
    
    //Decrementing number of lives if character has fallen through a canyon
    if(gameChar_y > floorPos_y+200 && !fallingSound.isPlaying()){
        lives = Math.max(lives-1, 0);
        if(lives > 0){
            startGame();
        }
    }
}
function startGame(){ 
        
    gameChar_x = width/2;
	gameChar_y = floorPos_y;
    
    //Initializing Objects of the game world
    
    initializeObjects();
    
	//Initializing letiable to control background scrolling of game world (exluding the sky)
	scrollPos = 0;

    /*
	Initializing letiable to store the real position of the gameChar in the game world. 
    Needed for collision detection.
    */
    
	gameChar_world_x = gameChar_x - scrollPos;

	/*
    ----------------------------------------------------------------
    Initializing Boolean variables to control the movement of the game character.
    ----------------------------------------------------------------
    */
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
    isRising = false; 
    
    // Initializing variables for acceleration. 
    easing = 0.009;
    alpha = 0;
 
	/*
    --------------------------------------------------------------
    Initialize arrays of scenery objects.
    --------------------------------------------------------------
    */
    
    // Initializing trees_x array
    trees_x =[100,400,700, 790,900, 1300, 1450,1700, 2000];
    
    // Initializing clouds array
    clouds = [
                {pos_x: 100, pos_y:80},
                {pos_x: 600, pos_y: 100},
                {pos_x: 800, pos_y: 50}
             ];
    // Initializing mountains array
    mountains = [
                    {pos_x: width/2+100,pos_y:floorPos_y}, 
                    {pos_x:1200, pos_y:floorPos_y}, 
                    {pos_x:5000,pos_y:floorPos_y}
                ];
    // Initializing canyon array
    canyons = [
                {pos_x: 250, width:100}, 
                {pos_x: 570, width:100},
                {pos_x: 1500,width:100},
                {pos_x:2135, width:100},
                {pos_x:2345, width:100},
                {pos_x:2500, width:100}
              ];
    // Initializing collectables array
    collectables = [
                    {pos_x: 110, pos_y:floorPos_y, isFound:false}, 
                    {pos_x:705, pos_y:floorPos_y, isFound:false}, 
                    {pos_x:1310, pos_y:floorPos_y,isFound:false}, 
                    {pos_x:2300, pos_y:floorPos_y, isFound:false}
                   ];

    
    //Initializing variables for the sky (triangular patterns with different colours)
    initializeSkyVariables(); 
    
    // Initializing game score counter and flagpole object.
    game_score = 0;
    flagpole = {isReached: false, pos_x: 3000};   
    
}

/**
-------------------------------------------------------------------------------------------------------------------------------
********************************* Clean up functions (Helper functions) *******************************************************
-------------------------------------------------------------------------------------------------------------------------------
**/

function initializeObjects(){
/**
--------------------------------
Initializing collectable object:

----------------------------
**/
collectable = {
                   pos_x: 0,
                   pos_y: 100,
                   size: 50,
                   pos: function(x,y){
                           this.pos_x = x;
                           this.pos_y = y;
                        },
                    /**
                    ----------------------------------------------------------------------------------
                    collectable : showUp is a function that draws a collectable at the preset coordinates
                    ----------------------------------------------------------------------------------
                    **/
                   showUp: function (){
                            let x = this.pos_x;
                            let y = this.pos_y;
                            push();
                            translate(-12,10); // ensuring that collectable is anchored to the center.
                            fill(255,0,0);
                            stroke(255,0,0);
                            translate(x,y);
                            scale(this.size/100)
                            beginShape();
                            vertex(6,0);
                            vertex(0,-21);
                            vertex(18,-33);
                            vertex(35,-20);
                            vertex(27,0);
                            endShape(CLOSE);

                            fill(255,255,0);
                            stroke(255,255,0);
                            beginShape();
                            vertex(16,-25);
                            vertex(24,-42);
                            vertex(31,-39);
                            endShape(CLOSE);
                            pop();
                    }
              };
    
/**
--------------------------------
Initializing character object:
-------------------------------
**/
character = {
    x:0,
    y:0,
    headColour:[225,136,81],
    bodyColour:[224,36,36],
    legColour:[0],
    outline:[0],
    
    /**
    ----------------------------------------------------------------------------------
    Character : pos is a function that sets the character's coordinates
    ----------------------------------------------------------------------------------
    **/
    
    pos: function(x,y){
        this.x = x;
        this.y = y;
    },
    
    /**
    ----------------------------------------------------------------------------------
    Character : stand is a function that draws the character in the "standing" position
    ----------------------------------------------------------------------------------
    **/
     stand : function(){
                //body
                push()
                stroke(this.outline);
                fill(this.bodyColour);
                ellipse(this.x ,this.y-26,38,52);
                //head
                fill(this.headColour);
                ellipse(this.x,this.y-50,26);
                //legs
                fill(this.legColour);
//                console.log(this.x);
                ellipse(this.x-12,this.y-9,19,26);
                ellipse(this.x+12,this.y-9,19,26);
                pop();
            },
    /**
    ----------------------------------------------------------------------------------
    Character : jumpForward is a function that draws the character in the "jump forward" position
    ----------------------------------------------------------------------------------
    **/
    jumpFoward: function(){
            //body
            push();
            stroke(this.outline);
            fill(this.bodyColour);
            ellipse(this.x,this.y-32,45,22);
            //head
            fill(this.headColour);
            ellipse(this.x,this.y-50,23,28);
            //legs
            fill(this.legColour);
            ellipse(this.x-12,this.y-20,19,23);
            ellipse(this.x+12,this.y-20,19,23);
            pop();
            },
    /**
    ----------------------------------------------------------------------------------
    Character : jumpLeft is a function that draws the character in the "jump left" position
    ----------------------------------------------------------------------------------
    **/
    jumpLeft: function(){
            //back leg
            stroke(this.outline);
            fill(this.legColour);
            push();
            translate(this.x-12,this.y-20);
            rotate(-25);
            ellipse(0,0,20,20);
            pop();


            push();
            //body
            fill(this.bodyColour);
            translate(this.x,this.y-30);
            rotate(-20);
            ellipse(0,0,38,40);
            pop();
            //head
            fill(this.headColour);
            ellipse(this.x-10,this.y-55,26);

            //front leg
            fill(this.legColour);
            push();
            translate(this.x+8,this.y-14);
            rotate(-25);
            ellipse(0,0,19,24);
            pop();
            },
    /**
    ----------------------------------------------------------------------------------
    Character : walkRight is a function that draws the character in the "walk right" position
    ----------------------------------------------------------------------------------
    **/
    jumpRight: function(){
            //back leg
            stroke(this.outline);
            fill(this.legColour);
            push();
            translate(this.x+12,this.y-20);
            rotate(25);
            ellipse(0,0,20,20);
            pop();


            //body
            push();
            fill(this.bodyColour);
            translate(this.x,this.y-30);
            rotate(20);
            ellipse(0,0,38,40);
            pop();
            //head
            fill(this.headColour);
            ellipse(this.x+10,this.y-55,26);

            //front leg
            fill(this.legColour);
            push();
            translate(this.x-12,this.y-14);
            rotate(25);
            ellipse(0,0,19,24);
            pop();
            },
     /**
    ----------------------------------------------------------------------------------
     Character : walkLeft is a function that draws the character in the "walk left" position
    ----------------------------------------------------------------------------------
    **/
    walkLeft:function(){
            //back leg
            stroke(this.outline);
          
            push();
            fill(this.legColour);
            translate(this.x-12,this.y-9);
            rotate(-25);
            ellipse(0,0,19,26);
            pop();

            //body
            push();
            fill(this.bodyColour);
            translate(this.x,this.y-26);
            rotate(-20);
            ellipse(0,0,38,52);
            pop();
        
            //head
            fill(this.headColour);
            ellipse(this.x-10,this.y-50,26);

            //front leg
            push();
            fill(this.legColour);
            translate(this.x+12,this.y-9);
            rotate(-25);
            ellipse(0,0,19,26);
            pop(); 
            }, 
    
    /**
    ----------------------------------------------------------------------------------
     Character : walkRight is a function that draws the character in the "walk right" position
    ----------------------------------------------------------------------------------
    **/
    walkRight: function(){
            stroke(this.outline);
            //back leg
            fill(this.legColour);
            push();
            translate(this.x+12,this.y-9);
            rotate(25);
            ellipse(0,0,19,26);
            pop();


            push();
            //body
            fill(this.bodyColour);
            translate(this.x,this.y-26);
            rotate(20);
            ellipse(0,0,38,52);
            pop();
            //head
            fill(this.headColour);
            ellipse(this.x+10,this.y-50,26);

            //front leg

             fill(this.legColour);
            push();
            translate(this.x-12,this.y-9);
            rotate(25);
            ellipse(0,0,19,26);
            pop();
            }
};
/**
--------------------------------
Initializing tree object:
--------------------------------
**/
tree ={
    x:938,
    y:380,
    /**
    ----------------------------------------------------------------------------------
    tree : pos is a function that sets the tree's coordinates
    ----------------------------------------------------------------------------------
    **/
    pos: function(xPos,yPos){
        this.x = xPos-6;
        this.y = yPos-50;     },
    /**
    ----------------------------------------------------------------------------------
    tree : showUp is a function that draws the tree at preset coordinates
    ----------------------------------------------------------------------------------
    **/
    showUp: function displayTree(){
            push();
            fill(41,36,17);
            noStroke();
            rect(this.x,this.y,12,58);
            stroke(43,127,87);
            fill(43,127,87);
            triangle(this.x-30,this.y+13,this.x+41,this.y+13,this.x+6,this.y-33);
            fill(16,151,20);
            stroke(16,151,20);
            triangle(this.x-21,this.y-12,this.x+33,this.y-12 ,this.x+6,this.y-59);
            fill(31,175,12);
            stroke(31,175,12);
            triangle(this.x-13,this.y-38,this.x+25,this.y-38,this.x+6,this.y-84);
            pop();
        }
};  
/**
--------------------------------
Initializing cloud object:

----------------------------
**/
cloud ={
    x:40,
    y:200,
    size:70,
    pos: function(pos_x,pos_y)
                {
                this.x = pos_x-37;
                this.y = pos_y+35;   
                },
    showUp: function (){
                push();
                    translate(this.x,this.y);
                    scale(this.size/100);
                    noStroke();
                    fill(255,255,255);
                    triangle(-23,-52, 10,-33,10,-72);
                    beginShape();
                    vertex(0, -53);
                    vertex(52, -106);
                    vertex(106, -53);
                    vertex(52, 0);
                    endShape(CLOSE);
                    triangle(96,-72, 96, -33,129,-52);
                pop();
            }
};
/**
--------------------------------
Initializing canyon object:

----------------------------
**/
canyon = { 
               pos_x: 50,
               width: 100,
                /**
                -------------------------------------------------------------------------------------------
                canyon: showUp is a function that draws a canyon. A canyon only needs the width and position along the x axis. The y axis is not included (initially hard coded).
                -------------------------------------------------------------------------------------------
                **/
               showUp : function (){
                            push();
                            translate(0,-1);
                            fill(0);
                            stroke(0);
                            beginShape();
                            vertex(this.pos_x,433);
                            vertex(this.pos_x+9,502);
                            vertex(this.pos_x,576);
                            vertex(this.pos_x+15+ this.width,576);
                            vertex(this.pos_x+6 + this.width,502);
                            vertex(this.pos_x+15 +this.width,433);
                            endShape(CLOSE);
                            pop();
                        }
        };


/**
--------------------------------
Initializing mountain object:
-------------------------------
**/
mountain = {
        x: 300,
        y: 450,
        inc1X: 0,
        inc1Y: 0,
        inc2X: 0,
        inc2Y: 0,
        size: 70,
        /** 
        ----------------------------------------------------------------------------------------------------------------------------------
        mountain: pos is a function used to set the  mountains cordinates. the offset is to ensure the coordinate represents the mountains "base" center
        ----------------------------------------------------------------------------------------------------------------------------------
        **/
        pos: function(x,y){
            this.x = x-200;
            this.y = y+100;
        },
        /**
        -------------------------------------------------------------------------------------------
        mountain: showUp is a function that draws the mountain. A mountain is split into dark shades and light shades. Each mountain has 2 rocks that can levitate.
        -------------------------------------------------------------------------------------------
        **/
        showUp : function(){
                            push();
                            startX = this.x;
                            startY = this.y;

                            // Draw Mountain

                            /**
                            ----------------------------------------------------------------------------------
                            mountain : Below is the "dark coloured" region of the mountain. Custom shapes made with vertex will be coloured in with (41, 26, 17) rgb colour.
                            ----------------------------------------------------------------------------------
                            **/
                            arrColor = [41, 26, 17];
                            fill(arrColor); 
                            stroke(arrColor);
                            translate(startX,startY);
                            scale(this.size/100);

                            beginShape(); 
                            vertex(0, -83);
                            vertex(22, -109);
                            vertex(68, -126);
                            vertex(71, -138);
                            vertex(89, -150);
                            vertex(100, -194);
                            vertex(112, -247);
                            vertex(153, -237);
                            vertex(165, -306);
                            vertex(186, -302);
                            vertex(202, -270);
                            vertex(207, -278);
                            vertex(217, -302);
                            vertex(266, -225);
                            vertex(287, -206);
                            vertex(291, -189);
                            vertex(295, -151);
                            vertex(304, -158);
                            vertex(321, -107);
                            vertex(281, -22);
                            vertex(243, -37);
                            vertex(208, -26);
                            vertex(169, 0);
                            vertex(121, -28);
                            vertex(49, -31);
                            endShape(CLOSE); 

                            /**
                            ----------------------------------------------------------------------------------
                            mountain : Below is the "light coloured" region of the mountain. Custom shapes made with vertex will be coloured in with (154,131,111) rgb colour.
                            ----------------------------------------------------------------------------------
                            **/
                            arrColor = [154, 131, 111];
                            fill(arrColor); 
                            stroke(arrColor);

                            beginShape(); 
                            vertex(22, -109);
                            vertex(41, -154);
                            vertex(79, -181);
                            vertex(90, -201);
                            vertex(100, -194);
                            vertex(89, -150);
                            vertex(71, -137);
                            vertex(68, -126);
                            endShape(CLOSE); 

                            beginShape(); 
                            vertex(116, -143);
                            vertex(100, -152);
                            vertex(101, -161);
                            vertex(107, -184);
                            vertex(116, -177);
                            vertex(107, -158);
                            vertex(114, -150);
                            endShape(CLOSE); 

                            beginShape(); 
                            vertex(100, -195);
                            vertex(112, -247);
                            vertex(149, -214);
                            vertex(142, -197);
                            vertex(144, -180);
                            vertex(140, -171);
                            endShape(CLOSE); 

                            beginShape(); 
                            vertex(143, -171);
                            vertex(148, -181);
                            vertex(148, -196);
                            vertex(155, -210);
                            vertex(163, -199);
                            vertex(153, -178);
                            endShape(CLOSE); 

                            beginShape(); 
                            vertex(154, -237);
                            vertex(154, -242);
                            vertex(171, -247);
                            vertex(181, -282);
                            vertex(164, -306);
                            vertex(154, -282);
                            endShape(CLOSE); 

                            beginShape(); 
                            vertex(217, -302);
                            vertex(206, -278);
                            vertex(216, -248);
                            vertex(210, -228);
                            vertex(233, -195);
                            endShape(CLOSE); 

                            beginShape(); 
                            vertex(225, -189);
                            vertex(204, -198);
                            vertex(198, -182);
                            vertex(171, -184);
                            vertex(161, -158);
                            vertex(176, -149);
                            endShape(CLOSE); 

                            beginShape(); 
                            vertex(270, -229);
                            vertex(287, -206);
                            vertex(277, -182);
                            vertex(261, -168);
                            vertex(238, -185);
                            vertex(207, -133);
                            vertex(179, -148);
                            vertex(247, -205);
                            endShape(CLOSE); 

                            beginShape(); 
                            vertex(291, -188);
                            vertex(295, -151);
                            vertex(285, -143);
                            vertex(270, -141);
                            vertex(283, -150);
                            vertex(287, -164);
                            vertex(281, -172);
                            endShape(CLOSE); 

                            beginShape(); 
                            vertex(217, -87);
                            vertex(185, -117);
                            vertex(146, -95);
                            vertex(141, -134);
                            vertex(153, -148);
                            vertex(219, -121);
                            endShape(CLOSE); 
                            pop();
                            /**
                            -------------------------------------------------------------------------------------------------------------
                            mountain: showLevitation1 and showLeviation2 are functions that draw the rocks that float next to the mountain
                            --------------------------------------------------------------------------------------------------------------
                            **/
                            this.showLevitation1();
                            this.showLevitation2();
                    },
        /**
        -------------------------------------------------------------------------------------------
        mountain: showLevitation1 is a function that draws the first rock that levitates around the mountain
        -------------------------------------------------------------------------------------------
        **/
        showLevitation1 : function()
                             {
                                push();
                                translate(this.x+(300*this.size/100) + this.inc1X,this.y -(190*this.size/100) + this.inc1Y);
                                scale(this.size/100);
                                arrColor = [41, 26, 17];
                                fill(arrColor); 
                                stroke(arrColor);

                                beginShape();
                                vertex(23, -48);
                                vertex(7, -58);
                                vertex(9, -71);
                                vertex(0, -94);
                                vertex(7, -115);
                                vertex(27, -126);
                                vertex(50, -76);
                                endShape(CLOSE);

                                //light shade
                                arrColor = [154, 131, 111];
                                fill(arrColor); 
                                stroke(arrColor);
                                beginShape();
                                vertex(23, -48);
                                vertex(32, -57);
                                vertex(34, -84);
                                vertex(25, -99);
                                vertex(27, -126);
                                vertex(46, -107);
                                vertex(50, -76);
                                vertex(42, -59);
                                endShape(CLOSE);

                                beginShape();
                                vertex(60, -58);
                                vertex(65, -52);
                                vertex(59, -42);
                                vertex(44, -39);
                                vertex(54, -46);
                                endShape(CLOSE);

                                beginShape();
                                vertex(29, -28);
                                vertex(34, -23);
                                vertex(32, -16);
                                vertex(25, -22);
                                endShape(close);

                                beginShape();
                                vertex(32, -12);
                                vertex(37, -7);
                                vertex(35, 0);
                                vertex(28, -6);
                                endShape(CLOSE);                                                        
                                pop();
                            },
        /**
        -------------------------------------------------------------------------------------------
        mountain: showLevitation2 is a function that draws the second rock that levitates around the mountain
        -------------------------------------------------------------------------------------------
        **/
        showLevitation2: function()
                            {
                                push();
                                translate(this.x+(30*this.size/100) + this.inc2X,this.y - (200*this.size/100) + this.inc2Y);
                                scale(this.size/100);
                                arrColor = [41, 26, 17];
                                fill(arrColor); 
                                stroke(arrColor);    
                                beginShape();
                                vertex(26, -7);
                                vertex(31, -20);
                                vertex(30, -38);
                                vertex(9, -54);
                                vertex(0, -30);
                                vertex(6, -17);
                                endShape(CLOSE);

                                //light shade
                                arrColor = [154, 131, 111];
                                fill(arrColor); 
                                stroke(arrColor);
                                beginShape();
                                vertex(9, -54);
                                vertex(30, -38);
                                vertex(31, -24);
                                vertex(24, -35);
                                endShape(CLOSE);

                                beginShape();
                                vertex(38, -40);
                                vertex(48, -33);
                                vertex(42, -20);
                                endShape(CLOSE);

                                beginShape();
                                vertex(35, -11);
                                vertex(36, -3);
                                vertex(30, 0);
                                vertex(30, -7);
                                endShape(CLOSE);
                                pop();
                            },
        /**
        -------------------------------------------------------------------------------------------
        mountain: setLev is a function that controls the levitation (the amount/amplitude of levitation) of each rock on the mountain
        - x1 and  y1 for horizontal and vertical levitation(oscilation) of rock 1, and x2 and y2 for rock 2
        -------------------------------------------------------------------------------------------
        **/
        setLev: function(x1,y1,x2,y2)
                {
                    this.inc1X += x1*sin(frameCount/20 + 90);
                    this.inc1Y += y1*sin(frameCount/20 + 90);
                    this.inc2X += x2*sin(frameCount/20 + 90);
                    this.inc2Y += y2*sin(frameCount/20);           
                }
    };
} 
function initializeSkyVariables()
{
     /*
    
       variables added for improved scenery (Background) ****
       
       triangleWidth: This is the basewidth of each triangle in the background. 
                      - We can scale the background by dividing the width from 1 to 8 
                      (There are not enough colours in arr to scale beyond a factor of 8)
                      
       arr: This is an array that holds all the colours for our background. Colours could have been generated with an algorithm but I had design the background already on Inkscape and creating an algorithm for this exact pattern would not be easy.
    */
    
    triangleWidth = width/8; 
    arr = [
            [145,154,255],[129,159,254],[134,158,254],[118,169,251],[117,168,251], [98,196,242], [98,187,245],[97,192,241],[100,177,245],   [105,179,241],[114,149,248],[116,157,243],[128,121,250],[134,113,249],[148,79,254],[153,69,255], [117,160,254],[122,163,253], [112,172,250], [111,177,248],[90,225,234],[90,223,234],[90,232,229],[95,211,234],[98,215,231],[105,189,237],[109,186,235],[116,163,240],[122,163,240],[133,122,246],[144,103,250],[152,71,254],[106,165,253], [97,179,248],[101,185,246],[92,209,237],
            [88,229,231],[89,224,233],[88,239,227],[93,225,231],[99,213,232],[104,204,235],[108,195,235],[126,170,242],[129,157,242],[156,135,249],[159,104,251],[159,72,255],[109,154,249],[99,175,247],[103,175,244],[97,193,240],[100,187,241],[94,204,237],[93,208,238],[94,214,236],[110,186,243],[106,200,238],[134,169,246],[128,173,243],[167,151,251],[168,145,250],[206,135,254],[192,115,254]
          ];
    
} 


/*
--------------------------------------------
Functions for celebration !!! Let's PARDDDY!
--------------------------------------------
*/
function populateDanceArray(){
    let i = 0;
    while(i <= 600){
        danceArr.push(i*50);
        i++;
    }
}

// Function to create "dance floor" at the end of the game (After you hit space and click on the screen).
function createWaveForm(){
    push();
    stroke(255);
    noFill();
    translate(width/2, height/2,)
    var wave = fft.waveform();      // using the fast fourier transform function from p5 library to analyse loaded sound from extension. 
   
    /*
        t is a variable that mirrors the semicircle-shaped waveform
        The semicirle was drawn using polar coordinates.
    */
    for(var t = -1; t <= 1; t += 2){
        beginShape();
        for(var i = 0; i <= 180; i += 0.5){
            var index = floor(map(i, 0, 180, 0, wave.length-1))
            var r = map(wave[index], -1, 1, 150, 350) 
            var x = r * sin(i) * t;
            var y = r * cos(i)
            vertex(x,y);
        }
        endShape();  
    }
    pop();
    
}
// Function to explain how to claim reward.
function drawText(){
    if(!rewardClaimed){
     text("Congratulations. Now it's time to PARDDDY!!! Yeah... Click for your reward", width/2 -200, height/2);
     return "writing";
    } 
    else{
        text("Music provided by https://www.bensound.com", width/2 - 100, height - 100);
    }
}

//Function to re-align character to the center of the "dance floor"
function prepCharacter(){
        character.pos(width/2, height/2);        
}

function startDancing(){
   let nature = 0;
    // for loop to know what the nature of the charater's next move should be.
    
    for(let i = 0; i < danceArr.length; i++){
        if(state <= danceArr[i]){
            nature = danceArr[i]/50; // dance array is shared into multiples of 50;
            break;
        }
    }
    if(nature % 2 == 0){
        character.walkLeft();
    }

    else if(nature % 2 != 0){
        character.walkRight(); 
    }
    
    state++; // character has moved to another state of his available dance moves.
    if(state > 3000){
        state = 0;
    }
    
}

function drawDanceFloor(){
    push();
    fill(194,78,172);
    rect(0,0, width,height);
    pop();
}

//Enable mouse clicking to pause and play celebration.
function mouseClicked(){
    if(flagpole.isReached && displayDanceStage){
        rewardClaimed = true;
        if(song.isPlaying()){

            song.pause();
            noLoop();
        }
        else
        {
            song.play();
            loop();
        } 
    }
    
}


/*
-------------------------------------------------------------------------------------------------------------------------------------
    Function to play background music of game.
    
    Note that if the err variable is logged to the console we get a buffer error message. This is because the user (the player) has not
    initiated the buffer by playing moving the game character (either by jumping or falling down the canyon). 
    
    The try catch statement allows the program to run, unhindered, untill the buffer is initiated.
-------------------------------------------------------------------------------------------------------------------------------------
*/
function startGameMusic(){
    try{
       if(!backgroundMusic.isPlaying() && !flagpole.isReached){
        backgroundMusic.play();
        }
    } catch(err){
      
    }  
}

