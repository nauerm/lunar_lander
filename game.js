var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

// load images
var bg = new Image();
var module = new Image();
var fire = new Image();
var X = new Image();

bg.src="images/bg4.png";
module.src="images/module.png";
fire.src="images/fire.png";
X.src="images/X.png";

var mX = 427;
var mY = 10;

var gravity = 1;
var thrust = 4*gravity;
var fuel = 200;
var keypress = 0;
var altitude;

// wait function
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }


// on press key
document.addEventListener("keydown", jumpUp);
function jumpUp()
{   jumpUp = jumpUp || window.event;
    keypress = 1;
    if (fuel>0)
    {
    mY-=thrust;
    fuel-=1;
    }
}
document.addEventListener("keyup", releaseKey);
function releaseKey()
{
    keypress = 0;
}


function draw()
{
    ctx.drawImage(bg, 0, 0);
    ctx.drawImage(module, mX, mY);
    
    altitude = cvs.height-(mY+module.height);
    
    // draw X
    //ctx.drawImage(X, (cvs.width/2-module.width/2), 10);

    ctx.fillStyle = "black";
    ctx.font = "20px Courier new";
    ctx.fillText("Fuel: "+fuel,10,30);
    ctx.fillText("Altitude: "+altitude,10,90);
    if (keypress == 1 && fuel > 0)
    {
    ctx.fillText("Thrust on",10,60);
    ctx.drawImage(fire, mX, mY);
    //ctx.drawImage(module, mX, mY);
    }
    else if (keypress == 1 && fuel == 0)
    {
    ctx.fillText("Thrust off",10,60);
    ctx.fillStyle = "red";
    ctx.font = "30px Trebuchet MS";
    ctx.fillText("Out of fuel!",370,40);
    }
    else if (keypress == 0)
    {
    ctx.fillText("Thrust off",10,60);
    }

    // reload when reaches bottom of the canvas
    if (altitude <= 0)
    {
        location.reload();
    }

    //debug
    // ctx.fillStyle = "black";
    // ctx.font = "20px Trebuchet MS";
    // ctx.fillText("Debug",10,420);
    // ctx.font = "15px Trebuchet MS";

    //add gravity
    mY += gravity;

    requestAnimationFrame(draw);

}

draw();