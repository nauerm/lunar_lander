var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

// load images
var module = new Image();
var fire = new Image();
var X = new Image();

module.src="images/module.png";
fire.src="images/fire.png";
X.src="images/X.png";

var mX = 427;
var mY = 10;

var gravity = 1; // 1 equals to 1 moon gravity which is 1.62 m/s²
var grav_inc = gravity/40;
var thrust = 10;
var fuel = 100;
var keypress = 0;
var altitude;
var vel = 0;
var debug_text_height = 385;
var key;
var rotation = 90;
var rot_rad;
var turnspeed = 3;

// wait function
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

// on press key
document.addEventListener("keydown", keys);
function keys(event)
{  
    // if key is UP, activate thrusters
    if(event.keyCode == 38)
    {
        key = event.keyCode;
        keypress = 1;
        if (fuel>0)
        {
        //mY-=thrust;
        fuel-=(thrust*0.05);
        gravity -= grav_inc*thrust;
        }   
    }

    // if key is SHIFT, increase thrusters value
    if(event.keyCode == 16 && thrust <=20)
    { thrust
        thrust +=0.5;
    }
    
    // if key is ctrl, decrease thrusters value
    if(event.keyCode == 17 && thrust >=0)
    { 
        thrust -=0.5;
    }
    
    // if key is left, add rotation to left
    if(event.keyCode == 37 && rotation < 180)
    { 
        rotation += 1*turnspeed;
    }
    
    // if key is right, add rotation to right
    if(event.keyCode == 39 && rotation > 0)
    { 
        rotation -= 1*turnspeed;
    }
}

document.addEventListener("keyup", releaseKey);
function releaseKey()
{
    keypress = 0;
}
function degrees_to_radians(degrees)
{
  return degrees * (Math.PI/180);
}

function draw()
{
    if (fuel<0)
    fuel = 0;
    if (thrust>20)
    thrust = 20;
    if (thrust<0)
    thrust = 0;
    rot_rad = degrees_to_radians(rotation);
    
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle="#000000";
    ctx.strokeRect(0, 0, cvs.width, cvs.height);//for white background

    ctx.drawImage(module, mX, mY);
    
    altitude = cvs.height-(mY+module.height);
    
    // draw X
    //ctx.drawImage(X, (cvs.width/2-module.width/2), 10);

    ctx.fillStyle = "black";
    ctx.font = "20px Courier new";

    //to do list
    ctx.font = "12px Courier new";
    ctx.fillText("To do list:",10,debug_text_height);
    ctx.fillText("• Controllable rotation of the module",10,debug_text_height+15);
    ctx.fillText("• Adequate landing area",10,debug_text_height+30);
    ctx.fillText("• Win/lose condition and screen",10,debug_text_height+45);
    ctx.fillText("• Procedural ground generation",10,debug_text_height+60);
    ctx.fillText("• Bar to indicate fuel",10,debug_text_height+75);
    ctx.fillText("• Better graphics",10,debug_text_height+90);

    ctx.font = "15px Courier new";
    ctx.fillText("Controls",670,30);
    ctx.fillText("Up: Activate thrusters",670,60);
    ctx.fillText("Shift: Increase power",670,80);
    ctx.fillText("Ctrl: Decrease power",670,100);
    ctx.fillText("Left and Right: Rotation",670,120);
    
    ctx.font = "20px Courier new";
    ctx.fillText("Fuel: "+parseFloat(fuel.toFixed(1))+"%",10,30);
    ctx.fillText("Altitude: "+parseFloat(altitude.toFixed(0)),10,60);
    ctx.fillText("Velocity: "+parseFloat(-vel.toFixed(1)),10,90);
    ctx.fillText("Thrusters: "+parseFloat(thrust.toFixed(1))*100/20+"%",10,120);
    
    ctx.font = "12px Courier new";
    ctx.fillText("Debug",10,225);
    ctx.fillText("Angle in radians: "+parseFloat(rot_rad.toFixed(6)),10,240);
    ctx.fillText("Angle in degrees: "+parseFloat(rotation.toFixed(6))+"º",10,255);
    ctx.fillText("Sin: "+parseFloat(Math.sin(rot_rad).toFixed(6)),10,270);
    ctx.fillText("Cos: "+parseFloat(Math.cos(rot_rad).toFixed(6)),10,285);
    if (keypress == 1 && fuel > 0)
    {
    ctx.drawImage(fire, mX, mY);
    }
    else if (keypress == 1 && fuel <= 0)
    {
    ctx.fillStyle = "red";
    ctx.font = "30px Trebuchet MS";
    ctx.fillText("Out of fuel!",370,90);
    }

    // reload when reaches bottom of the canvas
    if (altitude <= 0 && vel >=2)
    {
        location.reload();
    }
    else if (altitude <= 0 && vel < 2)
    {
    }

    //debug
    // ctx.fillStyle = "black";
    // ctx.font = "20px Trebuchet MS";
    // ctx.fillText("Debug",10,420);
    // ctx.font = "15px Trebuchet MS";

    //add gravity
    mY += (gravity+Math.sin(rot_rad));
    mX += Math.cos(rot_rad)*keypress;
    gravity += grav_inc;
    vel = gravity;

    requestAnimationFrame(draw);

}

draw();