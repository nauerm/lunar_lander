var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Variáveis
CHAR_WIDTH = 25;
CHAR_HEIGHT = 25;
INIT_POS_X = canvas.width/2;
INIT_POS_Y = canvas.height/2;
VEL = 3;
GRAVITY = 0.02;
THRUST = 0.04;
ANGLE_INCREMENT = 8e-5;
MOVE_INCREMENT = 1e-3;

//Valor de "offset" para o qual o personagem não segue mais o toque na tela
OFFSET = CHAR_WIDTH/2; 

let free_fall_vel = 0;
let x = INIT_POS_X;
let y = INIT_POS_Y;
let radius = CHAR_WIDTH;

let charCenterX = 0; 
let charCenterY = 0;
let angle = 0;

let move = '';
let vx = 0;
let vy = 0;

let deltaX = 0;
let deltaY = 0;
let clickX_main = 0;
let clickY_main = 0;
let x1 = 0;
let x2 = 0;
let x3 = 0;
let x4 = 0;
let y1 = 0;
let y2 = 0;
let y3 = 0;
let y4 = 0;

//Botão de tiro
const shootX = canvas.width*0.80;
const shootY = canvas.height*0.85;
let shootRadius = 40;

// flag para indicar quto track if the character is currently moving
let isMoving = false; 

TERRAIN_MAX_HEIGHT = canvas.height*0.1;
TERRAIN_MIN_HEIGHT = canvas.height*0.1;
TERRAIN_MIN_QTY = 10;
TERRAIN_MAX_QTY = 100;
TERRAIN_MIN_WIDTH = CHAR_WIDTH;
TERRAIN_MAX_WIDTH = 40;
var terrain = TERRAIN_MIN_QTY + Math.floor(Math.random() * TERRAIN_MAX_QTY);
var terrain_x = Array.from({length: terrain}, () => TERRAIN_MIN_WIDTH + Math.floor(Math.random()*TERRAIN_MAX_WIDTH));
var terrain_y = Array.from({length: terrain}, () => (canvas.height-TERRAIN_MIN_HEIGHT) - Math.floor(Math.random()*TERRAIN_MAX_HEIGHT));


function drawTerrain()
{
    var current_terrain_x = 0;
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = "lightsteelblue";
    ctx.fillStyle = "lightsteelblue";
    
    ctx.beginPath();
    
    //Começa o desenho em current_terrain_x = 0
    ctx.moveTo(
        current_terrain_x,
        terrain_y[0]
    );
    for (i = 1; i<terrain; i++)
    {
        current_terrain_x += terrain_x[i];
        ctx.lineTo(
            current_terrain_x,
            terrain_y[i]
        );
    }   
    ctx.lineTo(
        canvas.width,
        canvas.height
    );
    ctx.lineTo(
        0,
        canvas.height
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

var stars = Math.floor(Math.random() * (150)) + 50;
var star_size = Array.from({length: stars}, () => Math.floor(Math.random()*3));
var star_x = Array.from({length: stars}, () => Math.floor(Math.random()*canvas.width));
var star_y = Array.from({length: stars}, () => Math.floor(Math.random()*canvas.height));

function drawStars()
{
    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 0.5;
    
    for (i = 0; i<stars; i++)
    {
    ctx.beginPath();
    ctx.moveTo(
        star_x[i],
        star_y[i]
    );
    ctx.lineTo(
        star_x[i]+star_size[i],
        star_y[i]-star_size[i]
    );
    ctx.lineTo(
        star_x[i]+2*star_size[i],
        star_y[i]
    );
    
    ctx.lineTo(
        star_x[i]+star_size[i],
        star_y[i]+star_size[i]
    );
    ctx.fill();
    ctx.closePath();
    ctx.stroke();
    }   

}

function drawRabo()
{
        //Rabo do foguete
        // calculate the rotated points of the rectangle
        x1 = x -0.5*CHAR_WIDTH/2 * Math.cos(angle) - (-CHAR_HEIGHT/2 * Math.sin(angle)) + Math.floor(Math.random()*2);
        y1 = y -0.5*CHAR_WIDTH/2 * Math.sin(angle) + (-CHAR_HEIGHT/2 * Math.cos(angle));
    
        x5 = x - 0.5*CHAR_WIDTH*1.5 * Math.sin(angle) + 1*Math.random(); 
        y5 = y + 0.5*CHAR_HEIGHT * Math.cos(angle) + 2*Math.random();
    
        x2 = x + 0.5*CHAR_WIDTH/2 * Math.cos(angle) - (-CHAR_HEIGHT/2 * Math.sin(angle)) + Math.floor(Math.random()*2);
        y2 = y + 0.5*CHAR_WIDTH/2 * Math.sin(angle) + (-CHAR_HEIGHT/2 * Math.cos(angle));
    
        // Desenho do rabo do foguete
        ctx.fillStyle = "cyan";
        // Desenho da borda
        ctx.beginPath();
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = "#000";
        ctx.moveTo(x1, y1);
        ctx.lineTo(x5, y5);
        ctx.lineTo(x2, y2);
        // ctx.lineTo(x3, y3);
        // ctx.lineTo(x4, y4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
}

// var color1 = 000000;
// var color2 = 2898254;
// var color1hex = 0;
// var color2hex = 0;

function draw()
{ 
//     if (color2 <= 16777215){
//         color1 += 1;
//         color2 += 1;
//     }
//     color1hex = parseInt(color1, 10).toString(16);
//     color2hex = parseInt(color2, 10).toString(16);
//     canvas.style.background = "linear-gradient(0, #"+color1hex+",  #"+color2hex+")";
//     console.log(color1);

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.height);
    // calculate the direction to move the character
    deltaX = clickX_main - x;
    deltaY = clickY_main - y;

    x += vx;
    
    charCenterX = x + CHAR_WIDTH / 2;

    if(isMoving)
    {
        free_fall_vel -= THRUST; 
                
        if (charCenterX >= clickX_main)
        {
            // Só atualiza angle até 0.65
            if(angle < 0.65)
            {
                //clique foi à esquerda
                angle -= ANGLE_INCREMENT*deltaX;
            }
            //move para direita
            vx -= MOVE_INCREMENT*deltaX;
        }
        else if (charCenterX <= clickX_main)
        {
            // Só atualiza angle até 0.65
            if(angle > -0.65)
            {
                //clique foi à direita
                angle -= ANGLE_INCREMENT*deltaX;
            }
            //move para esquerda
            vx -= MOVE_INCREMENT*deltaX;
        }
    }

    // calculate the rotated points of the rectangle
    x1 = x -CHAR_WIDTH/2 * Math.cos(angle) - (-CHAR_HEIGHT/2 * Math.sin(angle));
    y1 = y -CHAR_WIDTH/2 * Math.sin(angle) + (-CHAR_HEIGHT/2 * Math.cos(angle));

    x5 = x + CHAR_WIDTH*1.5 * Math.sin(angle);;
    y5 = y - CHAR_HEIGHT*1.5 * Math.cos(angle);

    x2 = x + CHAR_WIDTH/2 * Math.cos(angle) - (-CHAR_HEIGHT/2 * Math.sin(angle));
    y2 = y + CHAR_WIDTH/2 * Math.sin(angle) + (-CHAR_HEIGHT/2 * Math.cos(angle));

    // Nave triangular, sem x3, y3 e x4, y4
    // x3 = x + CHAR_WIDTH/2 * Math.cos(angle) - (CHAR_HEIGHT/2 * Math.sin(angle));
    // y3 = y + CHAR_HEIGHT/2 * Math.sin(angle) + (CHAR_HEIGHT/2 * Math.cos(angle));

    // x4 = x -CHAR_WIDTH/2 * Math.cos(angle) - (CHAR_HEIGHT/2 * Math.sin(angle));
    // y4 = y -CHAR_HEIGHT/2 * Math.sin(angle) + (CHAR_HEIGHT/2 * Math.cos(angle));

    // Desenho do personagem
    ctx.fillStyle = "#fff";
    // Desenho da borda do personagem
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000";
    ctx.moveTo(x1, y1);
    ctx.lineTo(x5, y5);
    ctx.lineTo(x2, y2);
    // ctx.lineTo(x3, y3);
    // ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();


    drawRabo();
    
    // drawStars();
    // drawTerrain();
    requestAnimationFrame(draw);
}

draw();

// Input Handlers

document.addEventListener('contextmenu', event => event.preventDefault());

canvas.addEventListener("touchstart", function(e) {
  
    // Pega a posição relativa do canvas
    let canvasRect = canvas.getBoundingClientRect();

    // get the x and y coordinates of the mouse click event
    clickX = e.touches[0].clientX - canvasRect.left;
    clickY = e.touches[0].clientY - canvasRect.top;
    clickX_main = clickX;
    clickY_main = clickY;

    // set the flag to indicate that the character should start moving
    isMoving = true;

});

canvas.addEventListener("touchend", function(e) {
    // set the flag to indicate that the character should stop moving
    isMoving = false;
    vx = 0;
    vy = 0;
  });

addEventListener("touchmove", function(e) {
    // only move the character if the flag is set to true
    let canvasRect = canvas.getBoundingClientRect();
    if (isMoving) {
        // get the x and y coordinates of the mouse click event
        clickX = e.touches[0].clientX - canvasRect.left;
        clickY = e.touches[0].clientY - canvasRect.top;
        clickX_main = clickX;
        clickY_main = clickY;
    }

});
