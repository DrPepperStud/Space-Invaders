//gl vars
var canvas;
var gl;
var vPosition;
var pPosition;

//# of aliens
var squaresPerRow = 12;
var topSquares = squaresPerRow;
var bottomSquares = squaresPerRow;

//square 
var height = 0.95; 
var TxPos = [];
var BxPos = [];

//random movement
var TdirectionChange = [];
var BdirectionChange = [];
var Tchanged = [];
var Bchanged = [];
var maxRandomMove = 150;
var minRandomMove = 20;

//square properties
var squareWidth = .06;
var squareHeight = squareWidth * 2;
var dif = squareHeight + 0.01;

//player
var playerHeight = - 1 + squareHeight;
var playerX = 0;
var alive = 1;
var gameOver = 0;

//enemy bullets
var enBullets = [];
var enBulletX = [];
var enBulletY = [];

//player bullets
var plBullets = [];
var plBulletX = [];
var plBulletY = [];

//speeds
var ySpeed = 0.0012;
var bulSpeed = 0.015;
var TxSpeed = [];
var BxSpeed = [];
var playerSpeed = 0.01;
var baseXSpeed = 0.002;
var speedFactor = 1.0018;

//listener trackers
var Lpressed = 0;
var Rpressed = 0;
var Cpressed = 0;
var keyRPressed = 0;
var count = 0;

//attack wait
var maxAttackWait = 8;
var attackWait = maxAttackWait;

//color array
var color = [vec4(1.0, 0.0, 0.0, 1.0),
             vec4(0.0, 1.0, 0.0, 1.0)];




//listeners

window.addEventListener("keydown", function(event) {

  switch(event.code) {
    case "ArrowLeft":
        Lpressed = 1;
        break;
    case "ArrowRight":
        Rpressed = 1;
        break;
    case "KeyR":
        window.location.reload();
        break;
    case "KeyQ":
        alert("You pressed 'q'. The window will now close.")
        window.close();
  }
}, false);

window.addEventListener("keyup", function(event) {

  switch(event.code) {
    case "ArrowLeft":
        Lpressed = 0;
        break;
    case "ArrowRight":
        Rpressed = 0;
        break;
  }
}, false);

window.addEventListener("click", function(event) {
    Cpressed = 1;
}, false);


window.onload = function init() {
    
    

    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
     if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    vBuffer = gl.createBuffer();
    pBuffer = gl.createBuffer();

     // Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    program1 = initShaders( gl, "vertex-shader", "fragment-shader" );

    
    // Binding the vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);

    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    pPosition = gl.getAttribLocation( program1, "pPosition" );
     
    //set up game before starting 
    setUp();

    render();
}



function setUp(){

    //set initial position of squares
    //top row
    for(var i = 0; i < squaresPerRow; i++){
        do{
            rn = Math.random() * 2 / squaresPerRow;
        }while(rn < squareWidth || rn > 2 / squaresPerRow - squareWidth)
        TxPos[i] = -1 + 2 / squaresPerRow * (i % squaresPerRow) + rn;
    }

    //bottom row
    for(var i = 0; i < squaresPerRow; i++){
        do{
            rn = Math.random() * 2 / squaresPerRow;
        }while(rn < squareWidth || rn > 2 / squaresPerRow - squareWidth)
        BxPos[i] = -1 + 2 / squaresPerRow * (i % squaresPerRow) + rn;
    }

    //set speed for each square
    //top row
    for(var i = 0; i < squaresPerRow; i++){
        Tchanged[i] = 0;
        if (Math.random() > .5){
            TxSpeed[i] = baseXSpeed;
        }
        else{
            TxSpeed[i] = -baseXSpeed;
        }
    }

    //bottom row
    for(var i = 0; i < squaresPerRow; i++){
        Bchanged[i] = 0;
        if (Math.random() > .5){
            BxSpeed[i] = baseXSpeed;
        }
        else{
            BxSpeed[i] = -baseXSpeed;
        }
    }

    //set random direction buffer
    for(var i = 0; i < squaresPerRow; i++){
        do{
            TdirectionChange[i] = Math.random() * maxRandomMove;
        }while(TdirectionChange[i] < minRandomMove)
    }

    for(var i = 0; i < squaresPerRow; i++){
        do{
            BdirectionChange[i] = Math.random() * maxRandomMove;
        }while(BdirectionChange[i] < minRandomMove)
    }

}



//add object to vertices for drawArrays
function addSquare(vertices, square){
    for (var i = 0; i < square.length; i++) {
        vertices[vertices.length] = square[i];
    }
}

//add square to Tsquares[];
function moveTopSquare(i){
        return [
            vec2( TxPos[i] - squareWidth / 2, height),
            vec2( TxPos[i] + squareWidth / 2, height),
            vec2( TxPos[i] + squareWidth / 2, height - squareHeight ),
            vec2( TxPos[i] - squareWidth / 2, height),
            vec2( TxPos[i] + squareWidth / 2, height - squareHeight ),
            vec2( TxPos[i] - squareWidth / 2, height - squareHeight ),
        ];  
}

//add square to Bsquares[];
function moveBotSquare(i){
        return [
            vec2( BxPos[i] - squareWidth / 2, height - dif),
            vec2( BxPos[i] + squareWidth / 2, height - dif ),
            vec2( BxPos[i] + squareWidth / 2, height - dif - squareHeight ),
            vec2( BxPos[i] - squareWidth / 2, height - dif),
            vec2( BxPos[i] + squareWidth / 2, height - dif - squareHeight ),
            vec2( BxPos[i] - squareWidth / 2, height - dif - squareHeight ),
        ];  
}

//return verts for player
function movePlayerSquare(){
    return[
            vec2( playerX - squareWidth / 2 , playerHeight),
            vec2( playerX + squareWidth / 2 , playerHeight ),
            vec2( playerX + squareWidth / 2 , playerHeight - squareHeight ),
            vec2( playerX - squareWidth / 2 , playerHeight),
            vec2( playerX + squareWidth / 2 , playerHeight - squareHeight ),
            vec2( playerX - squareWidth / 2 , playerHeight - squareHeight ),
        ];   
}


function adjustPos(){

    //change bullet/alien height
    height = height - ySpeed;
    
    addSpeed();
    //randomMove();
    detectCollision();
    

}

function gameOver(){
    //make things stop moving
    gameOver = 1;
    for(var i = 0; i < topSquares; i++){
        TxSpeed[i] = 0;
        ySpeed = 0;
    } 
    for(var i = 0; i < bottomSquares; i++){
        BxSpeed[i] = 0;
        ySpeed = 0;
    } 
    bulSpeed = 0
    playerSpeed = 0

}

function addSpeed(){
    for(var i = 0; i < topSquares; i++){
        TxSpeed[i] *= speedFactor;
    } 
    for(var i = 0; i < bottomSquares; i++){
        BxSpeed[i] *= speedFactor;
    } 
}

function randomMove(){
    for(var i = 0; i < topSquares; i++){
        TdirectionChange[i]--;
        if (TdirectionChange[i] <= 0){
            TxSpeed[i] = TxSpeed[i] * -1;
            do{
                TdirectionChange[i] = Math.random() * maxRandomMove;
            } while(TdirectionChange[i] < minRandomMove)
        }
    }

    for(var i = 0; i < bottomSquares; i++){
        BdirectionChange[i]--;
        if (BdirectionChange[i] <= 0){
            BxSpeed[i] = BxSpeed[i] * -1;
            do{
                BdirectionChange[i] = Math.random() * maxRandomMove;
            } while(BdirectionChange[i] < minRandomMove)
        }
    }
}

function detectCollision(){
    //track collisions with other squares
    var noRan = 0;
    for(var i = 0; i <= topSquares - 1; i++){

        if(Math.abs(TxPos[i] - TxPos[i+1]) <= squareWidth * 1.1){
            TxSpeed[i] = TxSpeed[i] * -1;
            TxSpeed[i+1] = TxSpeed[i+ 1] * -1;
            noRan = 1;
            TdirectionChange[i] += 5;
            TdirectionChange[i+1] += 5;
            continue;
         }

        TdirectionChange[i]--;
        if (TdirectionChange[i] <= 0 && noRan == 0){
            TxSpeed[i] = TxSpeed[i] * -1;
            do{
                TdirectionChange[i] = Math.random() * maxRandomMove;
            } while(TdirectionChange[i] < minRandomMove)
        }
        noRan = 0;
    }

    for(var i = 0; i <= bottomSquares - 1; i++){

        if(Math.abs(BxPos[i] - BxPos[i+1]) <= squareWidth * 1.1){
            BxSpeed[i] = BxSpeed[i] * -1;
            BxSpeed[i+1] = BxSpeed[i+ 1] * -1;
            noRan = 1;
            BdirectionChange[i] += 5;
            BdirectionChange[i+1] += 5;
            continue;
        }

        BdirectionChange[i]--;
        if (BdirectionChange[i] <= 0){
            BxSpeed[i] = BxSpeed[i] * -1;
            do{
                BdirectionChange[i] = Math.random() * maxRandomMove;
            } while(BdirectionChange[i] < minRandomMove)
        }
    }

    //see if bullet is about to hit wall
    for(var i = 0; i < topSquares; i++){
        TxPos[i] = TxPos[i] + TxSpeed[i];
        if(TxPos[i] >= 1 - squareWidth / 2 || TxPos[i] <= -1 + squareWidth / 2){
            TxSpeed[i] = TxSpeed[i] * -1;
            Tchanged[i] = 1;
            TdirectionChange[i] += 5;
        }
    } 

    for(var i = 0; i < bottomSquares; i++){
        BxPos[i] = BxPos[i] + BxSpeed[i];
        if(BxPos[i] >= 1 - squareWidth / 2 || BxPos[i] <= -1 + squareWidth / 2){
            BxSpeed[i] = BxSpeed[i] * -1;
            Bchanged[i] = 1;
            BdirectionChange[i] += 5;
        }
    } 
}

function enemyAttack(row, squares, enBullets){

    for(var i = 0; i < squares; i++){
        if(Math.random() > .6){
            if(row == 1){
                enBulletY[enBullets.length] = height - dif - squareHeight;
                enBulletX[enBullets.length] = BxPos[i];

            }
            else{
                enBulletY[enBullets.length] = height - squareHeight;
                enBulletX[enBullets.length] = TxPos[i];
            }
            enBullets[enBullets.length] = moveEnBullet(enBullets.length);
        }
    }
}

function adjustEnBullets(){
    for(var i = 0; i < enBullets.length; i++){
        if(enBulletY[i] < -1.1){
            enBulletY.splice(i,1);
            enBulletX.splice(i,1);
            enBullets.splice(i,1);
        }
    }
    for(var i = 0; i < enBullets.length; i++){
        enBulletY[i] -= bulSpeed;
        enBullets[i] =  moveEnBullet(i);
    }
}

function moveEnBullet(i){
            return [
            vec2( enBulletX[i] - squareWidth / 20, enBulletY[i]),
            vec2( enBulletX[i] + squareWidth / 20, enBulletY[i]),
            vec2( enBulletX[i] + squareWidth / 20, enBulletY[i] + squareHeight * 0.3),
            vec2( enBulletX[i] - squareWidth / 20, enBulletY[i]),
            vec2( enBulletX[i] + squareWidth / 20, enBulletY[i] + squareHeight * 0.3),
            vec2( enBulletX[i] - squareWidth / 20, enBulletY[i] + squareHeight * 0.3),
            ];  
        
}

function adjustPlBullets(){
    for(var i = 0; i < plBullets.length; i++){
        plBulletY[i] += bulSpeed;
        if(plBulletY[i] > 1.1){
            plBulletY.splice(i,1);
            plBulletX.splice(i,1);
            plBullets.splice(i,1);
        }
        else{
            plBullets[i] = movePlBullet(i);
        }
    }

    if(Cpressed == 1 && alive == 1){
        makePlBullet();
    }
}

function makePlBullet(){
    plBulletX[plBullets.length] = playerX;
    plBulletY[plBullets.length] = playerHeight;        
    plBullets[plBullets.length] = movePlBullet(plBullets.length);
    Cpressed = 0;
}

function movePlBullet(i){
            return [
            vec2( plBulletX[i] - squareWidth / 20, plBulletY[i]),
            vec2( plBulletX[i] + squareWidth / 20, plBulletY[i]),
            vec2( plBulletX[i] + squareWidth / 20, plBulletY[i] + squareHeight * .3),
            vec2( plBulletX[i] - squareWidth / 20, plBulletY[i]),
            vec2( plBulletX[i] + squareWidth / 20, plBulletY[i] + squareHeight * .3),
            vec2( plBulletX[i] - squareWidth / 20, plBulletY[i] + squareHeight * .3),
            ];  
        
}

function hitDetection(){
    for(var i = 0; i < plBullets.length; i++){
        if (plBulletY[i] >= height - squareHeight && plBulletY[i] <= height ){
            for(var j = 0; j < topSquares; j++){
                if(plBulletX[i] >= TxPos[j] - squareWidth / 2 && plBulletX[i] <= TxPos[j] + squareWidth / 2  ){
                    topSquares--;
                    TxPos.splice(j,1);
                    TdirectionChange.splice(j,1);
                    Tchanged.slice(j,1);
                    TxSpeed.splice(j,1);
                    plBulletX.splice(i,1);
                    plBulletY.splice(i,1);
                }
            }
        } 
        else if(plBulletY[i] >= height - dif - squareHeight && plBulletY[i] <= height - dif ){
            for(var j = 0; j < bottomSquares; j++){
                if(plBulletX[i] >= BxPos[j] - squareWidth / 2 && plBulletX[i] <= BxPos[j] + squareWidth / 2  ){
                    bottomSquares--;
                    BxPos.splice(j,1);
                    BdirectionChange.splice(j,1);
                    Bchanged.slice(j,1);
                    BxSpeed.splice(j,1);
                    plBulletX.splice(i,1);
                    plBulletY.splice(i,1);
                }
            }

        }
    }

    for(var i = 0; i < enBullets.length; i++){
        if(enBulletY[i] <= playerHeight && enBulletY[i] >= -1){
            if(enBulletX[i] >= playerX - squareWidth / 2 && enBulletX[i] <= playerX + squareWidth / 2 ){
                alive = 0;
            }
        }
    }
}

function checkGame(){
    if(bottomSquares > 0 && height < -1 + dif + squareHeight){
        alert("Aliens have reached the ground! You lose! Press 'r' to restart or 'q' to quit.");
        gameOver();
    }
    else if(topSquares > 0 && height < -1 + squareHeight){
        alert("Aliens have reached the ground! You lose! Press 'r' to restart or 'q' to quit.");
        gameOver();
    }
    else if(topSquares == 0 && bottomSquares == 0){
        alert("You killed all the aliens! You win! Press 'r' to restart or 'q' to quit.")
        gameOver();
    }
    else if(alive == 0){
        alert("You got hit by a bullet! You lose! Press 'r' to restart or 'q' to quit.");
        gameOver();
    } 
}

function render() {


    // move top row squares
    
    if(Lpressed > 0 && playerX - squareWidth / 2 > -1){
        playerX -= playerSpeed;
    }
    else if(Rpressed > 0 && playerX + squareWidth / 2 < 1){
        playerX += playerSpeed;
    }
   




    var Tsquares = [];
    var Bsquares = [];
    var vertices = [];
    var playerObjs = [];
    

    var colorLoc = gl.getUniformLocation( program, "color" );
    gl.uniform4fv( colorLoc, color[0]);


    hitDetection();

    for(var i = 0; i < topSquares; i++){
        Tsquares[i] = moveTopSquare(i);
    } 

    for(var i = 0; i < bottomSquares; i++){
        Bsquares[i] = moveBotSquare(i);
    }

    adjustEnBullets();

    attackWait--;
    if (attackWait == 0){
        attackWait = maxAttackWait;
        if (bottomSquares > 0){
            enemyAttack(1, bottomSquares, enBullets);
        }
        else{
            enemyAttack(0, topSquares, enBullets)
        }
        
    }
    
    adjustPlBullets();

    //add squares to vertices, playerObjs
    for(var i = 0; i < topSquares; i++){
        addSquare(vertices, Tsquares[i]);
    } 

    for(var i = 0; i < bottomSquares; i++){
        addSquare(vertices, Bsquares[i]);
    } 

    for(var i = 0; i < enBullets.length; i++){
        addSquare(vertices, enBullets[i]);
    }

    if(alive == 1){
        addSquare(playerObjs, movePlayerSquare());
    }
    
    for(var i = 0; i < plBullets.length; i++){
        addSquare(playerObjs, plBullets[i]);
    }

    adjustPos();
    checkGame();
    

    

    
    
    // For debugging
    
    //console.log(squares[i]);
    
    
    document.getElementById("height").innerHTML = count;
    
    

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.useProgram( program );

    gl.enableVertexAttribArray(vPosition); 
    
    // Binding the vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    // Clearing the buffer and drawing the square
    var colorLoc = gl.getUniformLocation( program, "color" );
    gl.uniform4fv( colorLoc, color[0]);
    
    
    gl.drawArrays( gl.TRIANGLES, 0, topSquares * 6 + bottomSquares * 6 + enBullets.length * 6);

    gl.useProgram(program1);
    
    gl.enableVertexAttribArray( playerObjs );
    // Binding the vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.vertexAttribPointer( playerObjs, 2, gl.FLOAT, false, 0, 0 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(playerObjs), gl.STATIC_DRAW );
    // Clearing the buffer and drawing the square

    var colorLoc = gl.getUniformLocation( program1, "color" );
    gl.uniform4fv( colorLoc, color[1]);

    gl.drawArrays( gl.TRIANGLES, 0, 6 * alive + plBullets.length * 6);

    if(gameOver != 1){
       window.requestAnimFrame(render);
    }
}

