var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

// load images
var module = new Image();
var fire = new Image();
var X = new Image();

var mX = 427;
var mY = 10;

var gravity = 2; // 1 equals to 1 moon gravity which is 1.62 m/s²
var grav_inc = gravity/40;
var keypress = 0;
var altitude;
var vel = 0;
var debug_text_height = 460;
var key;
var rotation = 90;
var rot_rad;
var turnspeed = 3;

const MAX_FUEL = 100;
const FPS = 30; // frames per second
const FRICTION = 0.7; // friction coefficient of space (0 = no friction, 1 = lots of friction)
const SHIP_SIZE = 30; // ship height in pixels
var SHIP_THRUST = 2; // acceleration of the ship in pixels per second per second
const SHIP_THRUST_MAX = 2.5;
const TURN_SPEED = 50; // turn speed in degrees per second

var fuel = MAX_FUEL;

// set up the spaceship object
var ship = {
    x: 350,
    y: 30,
    r: SHIP_SIZE / 2,
    a: 90 / 180 * Math.PI, // convert to radians
    rot: 0,
    thrusting: false,
    thrust: {
        x: 0,
        y: 0
    }
}

// on press key
document.addEventListener("keydown", keys);
function keys(event)
{  
    switch(event.keyCode) 
    {
        case 38: // up pressed
            key = event.keyCode;
            keypress = 1;
            ship.thrusting = true;
            if (fuel>0)
            {
            //mY-=thrust;
            fuel-=(SHIP_THRUST*0.05);
            }   
            break;
        case 37: // left pressed
            if (rotation < 180)
            {
                rotation += 1*turnspeed;
                ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
            }
        case 39: // right pressed
            if(rotation > 0)
            { 
                rotation -= 1*turnspeed;
                ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
            }
    }
    // if key is UP, activate thrusters
    if(event.keyCode == 38)
    {
        key = event.keyCode;
        keypress = 1;
        if (fuel>0)
        {
            ship.thrusting = true;
            fuel-=(SHIP_THRUST*0.05);
        }   
        else
        ship.thrusting = false;
    }

    // if key is SHIFT, increase thrusters value
    if(event.keyCode == 16 && SHIP_THRUST <=SHIP_THRUST_MAX)
    { 
        SHIP_THRUST +=0.1;
    }
    
    // if key is ctrl, decrease thrusters value
    if(event.keyCode == 17 && SHIP_THRUST >=0)
    { 
        SHIP_THRUST -=0.1;
    }
    
    // if key is left, add rotation to left
    if(event.keyCode == 37 && rotation < 180)
    { 
        rotation += 1*turnspeed;
        ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
    }
    
    // if key is right, add rotation to right
    if(event.keyCode == 39 && rotation > 0)
    { 
        rotation -= 1*turnspeed;
        ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
    }
}

document.addEventListener("keyup", releaseKey);
function releaseKey(event)
{
    switch(event.keyCode) 
    {
        case 37: // left arrow (stop rotating left)
            ship.rot = 0;
            break;
        case 38: // up arrow (stop thrusting)
            ship.thrusting = false;
            break;
        case 39: // right arrow (stop rotating right)
            ship.rot = 0;
            break;
    }
    keypress = 0;
}
function degrees_to_radians(degrees)
{
  return degrees * (Math.PI/180);
}

function drawtexts()
{    
    ctx.fillStyle = "white";

    ctx.font = "15px Verdana";
    ctx.fillText("Controls",670,30);
    ctx.fillText("Up: Activate thrusters",670,60);
    ctx.fillText("Shift: Increase power",670,80);
    ctx.fillText("Ctrl: Decrease power",670,100);
    ctx.fillText("Left and Right: Rotation",670,120);
    
    ctx.font = "20px Verdana";
    ctx.fillText("Fuel: "+parseFloat((fuel*100/MAX_FUEL).toFixed(1))+"%",10,30);
    ctx.fillText("Altitude: "+parseFloat(altitude.toFixed(0)),10,60);
    ctx.fillText("Velocity: "+parseFloat(-vel.toFixed(1)),10,90);
    ctx.fillText("Thrust: "+parseFloat((SHIP_THRUST*100/SHIP_THRUST_MAX).toFixed(0))+"%",10,120);
    
    ctx.font = "12px Verdana";
    const debug_height=225;
    ctx.fillText("Debug:",10,debug_height-3);
    ctx.fillText("Old angle in radians: "+parseFloat(rot_rad.toFixed(6)),10,debug_height+15);
    ctx.fillText("Old angle in degrees: "+parseFloat(rotation.toFixed(6))+"º",10,debug_height+30);
    ctx.fillText("Old angle sin: "+parseFloat(Math.sin(rot_rad).toFixed(6)),10,debug_height+45);
    ctx.fillText("Old andle cos: "+parseFloat(Math.cos(rot_rad).toFixed(6)),10,debug_height+60);
    ctx.fillText("gravity: "+parseFloat(gravity.toFixed(1)),10,debug_height+80);
    ctx.fillText("ship.y: "+parseFloat(ship.y.toFixed(1)),10,debug_height+95);
    ctx.fillText("ship.thrust.y: "+parseFloat(ship.thrust.y.toFixed(1)),10,debug_height+110);
    ctx.fillText("ship.thrust.x: "+parseFloat(ship.thrust.x.toFixed(1)),10,debug_height+125);
    ctx.fillText("ship angle: "+(ship.a),10,debug_height+140);
    ctx.fillText("ship thrust: "+(SHIP_THRUST),10,debug_height+155);
    
    //to do list
    ctx.font = "11px Verdana";
    ctx.fillText("To do list:",10,debug_text_height);
    ctx.fillText("• Adequate landing area. Horizontal and vertical velocity indicator",10,debug_text_height+15);
    ctx.fillText("• Win/lose condition and screen",10,debug_text_height+30);
    ctx.fillText("• Controllable thrust and fire triangle that oscillates",10,debug_text_height+45);
    ctx.fillText("• Fix velocity, gravity and thrust (should not increase indefinetly)",10,debug_text_height+60);
    ctx.fillText("• Procedural ground generation",10,debug_text_height+75);
    ctx.fillText("• Bar to indicate fuel",10,debug_text_height+90);
    ctx.fillText("• Better graphics",10,debug_text_height+105);


}

function draw()
{
    if (fuel<0)
    fuel = 0;
    if (SHIP_THRUST>SHIP_THRUST_MAX)
    SHIP_THRUST = SHIP_THRUST_MAX;
    if (SHIP_THRUST<0)
    SHIP_THRUST = 0;
    rot_rad = degrees_to_radians(rotation);
    
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle="#ffffff";
    ctx.strokeRect(0, 0, cvs.width, cvs.height);//for white background

    ctx.drawImage(module, mX, mY);
    
    altitude = cvs.height-(mY+module.height);
    
    drawtexts();
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
    if ((altitude <= 0 && vel >=2)||ship.y >= cvs.height)
    {
        location.reload();
    }
    else if (altitude <= 0 && vel < 2)
    {
    }

     // thrust the ship
     if (ship.thrusting) {
        ship.thrust.x += 0.25* SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= 0.5*SHIP_THRUST * Math.sin(ship.a) / FPS;

        // draw the thruster
        if(SHIP_THRUST>0)
        {
            ctx.fillStyle = "orange";
            ctx.strokeStyle = "red";
            ctx.lineWidth = SHIP_SIZE / 10;
            ctx.beginPath();
            ctx.moveTo( // rear left
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))+1
            );
            ctx.lineTo( // rear centre (behind the ship)
                ship.x - ship.r * 5 / 3 * Math.cos(ship.a),
                ship.y + ship.r * 5 / 3 * Math.sin(ship.a)+(SHIP_THRUST*6)
            );
            ctx.lineTo( // rear right
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))+1
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
     }
     vel = gravity+ship.thrust.y;

    // draw the triangular ship
    ctx.strokeStyle = "white";
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo( // nose of the ship
        ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
        ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
    );
    ctx.lineTo( // rear left
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
    );
    ctx.lineTo( // rear right
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.stroke();

    // //trem de pouso direita
    // ctx.moveTo( // nose of the ship
    // ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a))-5,
    // ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
    // );
    // ctx.lineTo( // 
    // ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
    // ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))+20
    // );
    // ctx.stroke();

    // //trem de pouso esquerda
    // ctx.moveTo( // nose of the ship
    // ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a))+5,
    // ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
    // );
    // ctx.lineTo( // 
    // ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
    // ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))+20
    // );
    // ctx.stroke();

    // rotate the ship
    if (rotation<180 || rotation >= 0)
    {
        ship.a += ship.rot;
    }

    // action of gravity
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y+vel;
    gravity += grav_inc;

    requestAnimationFrame(draw);

}

draw();