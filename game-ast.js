var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

// load images
var module = new Image();
var fire = new Image();
var X = new Image();

var mX = 427;
var mY = 10;

var gravity = 0.5; 
var grav_inc = gravity/40;
var keypress = 0;
var altitude;
var vel = 0;
var debug_text_height = 420;
var key;
var rotation = 90;
var rot_rad;
var turnspeed = 3;

const MAX_FUEL = 100;
const FPS = 30; // frames per second
const FRICTION = 0.7; // friction coefficient of space (0 = no friction, 1 = lots of friction)
const SHIP_SIZE = 15; // ship height in pixels
var SHIP_THRUST = 0.5; // acceleration of the ship in pixels per second per second
const SHIP_THRUST_MAX = 2;
const TURN_SPEED = 50; // turn speed in degrees per second
const MAX_THRUST_VECTOR = 20; // thrust vector for the fire triangle
const max_landing_speed = 2.5;
const angle_lim = 0.15;

var fuel = MAX_FUEL;

// set up the spaceship object
var ship = {
    x: cvs.width/2,
    y: 30,
    r: SHIP_SIZE / 2,
    a: 90 / 180 * Math.PI, // convert to radians,
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
        case 87: // w pressed
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
        break;
        case 65: // a pressed
            if (rotation < 180)
            {
                rotation += 1*turnspeed;
                ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
            }
        break;
        case 39: // right pressed
            if(rotation > 0)
            { 
                rotation -= 1*turnspeed;
                ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
            }
        break;
        case 68: // d pressed
            if(rotation > 0)
            { 
                rotation -= 1*turnspeed;
                ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
            }
        break;
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
        case 65: // a (stop rotating left)
            ship.rot = 0;
            break;
        case 38: // up arrow (stop thrusting)
            ship.thrusting = false;
            break;
        case 87: // w (stop thrusting)
            ship.thrusting = false;
            break;
        case 39: // right arrow (stop rotating right)
            ship.rot = 0;
            break;
        case 68: // d (stop rotating right)
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
    ctx.fillStyle = "lightsteelblue";

    ctx.font = "15px Verdana";
    ctx.fillText("Controls",cvs.width-220,30);
    ctx.fillText("Up/W: Activate thrusters",cvs.width-220,60);
    ctx.fillText("Shift: Increase power",cvs.width-220,80);
    ctx.fillText("Ctrl: Decrease power",cvs.width-220,100);
    ctx.fillText("Left/A and Right/D: Rotation",cvs.width-220,120);
    
    ctx.font = "15px Verdana";
    ctx.fillText("Fuel: "+parseFloat((fuel*100/MAX_FUEL).toFixed(1))+"%",10,30);
    ctx.fillText("Altitude: "+parseFloat(altitude.toFixed(0)),10,50);
    ctx.fillText("Velocity: "+parseFloat(-vel.toFixed(1)),10,70);
    ctx.fillText("Relative thrust: "+parseFloat((SHIP_THRUST*100/SHIP_THRUST_MAX).toFixed(0))+"%",10,90);
    ctx.fillText("Absolute thrust: "+parseFloat(SHIP_THRUST.toFixed(1)),10,110);
    
    
    ctx.fillStyle = "#507080";
    ctx.font = "9px Verdana";
    const debug_height=170;
    ctx.fillText("Debug:",10,debug_height);
    ctx.fillText("gravity: "+parseFloat(gravity.toFixed(1)),10,debug_height+20);
    ctx.fillText("ship.y: "+parseFloat(ship.y.toFixed(1)),10,debug_height+35);
    ctx.fillText("ship.thrust.y: "+parseFloat(ship.thrust.y.toFixed(1)),10,debug_height+50);
    ctx.fillText("ship.thrust.x: "+parseFloat(ship.thrust.x.toFixed(1)),10,debug_height+65);
    ctx.fillText("ship angle: "+parseFloat(ship.a.toFixed(3)),10,debug_height+80);
    ctx.fillText("ship thrust: "+parseFloat(SHIP_THRUST.toFixed(1)),10,debug_height+95);
    ctx.fillText("Initial pos x: "+parseFloat(pos[0].toFixed(1)),10,debug_height+110);
    ctx.fillText("Current pos x: "+parseFloat(pos[1].toFixed(1)),10,debug_height+125);
    ctx.fillText("Vel x: "+parseFloat(velx.toFixed(1)),10,debug_height+140);
    ctx.fillText("ship.y "+parseFloat(ship.y.toFixed(1))+" and cvs.height: "+parseFloat(cvs.height.toFixed(1)),10,debug_height+155);
    
    //to do list
    ctx.fillStyle = "#507080";
    ctx.font = "9px Verdana";
    ctx.fillText("To do list:",10,debug_text_height);
    ctx.fillText("• Adequate landing area. Horizontal and vertical velocity indicator",10,debug_text_height+15);
    ctx.fillText("• Win/lose condition and screen",10,debug_text_height+30);
    ctx.fillText("• Controllable thrust and fire triangle that oscillates",10,debug_text_height+45);
    ctx.fillText("• Fix velocity, gravity and thrust (should not increase indefinetly)",10,debug_text_height+60);
    ctx.fillText("• Procedural ground generation",10,debug_text_height+75);
    ctx.fillText("• Bar to indicate fuel",10,debug_text_height+90);
    ctx.fillText("• Better graphics",10,debug_text_height+105);

}
function drawFloor()
{
    
    // draw the floor
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo( 0,
        cvs.height-10
    );
    ctx.lineTo(
        20,
        cvs.height-15
    );
    ctx.lineTo(
        110,
        cvs.height-20
    );
    ctx.lineTo( 
        150,
        cvs.height-35
    );
    ctx.lineTo( 
        390,
        cvs.height-60
    );
    ctx.lineTo( 
        420,
        cvs.height-75
    );
    ctx.lineTo( 
        450,
        cvs.height-75
    );
    ctx.lineTo( 
        470,
        cvs.height-90
    );
    ctx.stroke();

    
    ctx.beginPath();
    ctx.moveTo( 
        470,
        cvs.height-90
    );
    ctx.strokeStyle = "yellowgreen";
    ctx.lineTo( 
        580,
        cvs.height-90
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo( 
        580,
        cvs.height-90
    );
    ctx.strokeStyle = "white";
    ctx.lineTo( 
        cvs.width,
        cvs.height-80
    );
    ctx.stroke();
}

const pos = [];

var velx = 0;

pos[0] = ship.x;
function draw()
{
    //while(altitude<= 420+ship.r*2 && vel<=max_landing_speed)
    //{
        altitude = (cvs.height-ship.y)+ship.r;
        pos[1] = ship.x;
        velx = pos[1]-pos[0];
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
        if ((altitude <= 0)||ship.y <0 || ship.x <0 || ship.x > cvs.width)
        {
            ctx.fillStyle = "red";
            ctx.font = "20px Trebuchet MS";
            ctx.fillText("Out of game screen",cvs.width/2-75,cvs.height/2);
            ship.x = ship.x
            ship.y = ship.y
            gravity = 0;
        }
        else if (altitude >= 0)
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
                    ship.x - ship.r * 5 / 3 * Math.cos(ship.a) - ((SHIP_THRUST/SHIP_THRUST_MAX)*MAX_THRUST_VECTOR*Math.cos(ship.a)),
                    ship.y + (ship.r) * 5 / 3 * Math.sin(ship.a) + ((SHIP_THRUST/SHIP_THRUST_MAX)*MAX_THRUST_VECTOR*Math.sin(ship.a))
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
            ship.y - 5 / 3 * ship.r * Math.sin(ship.a)
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

        drawFloor();

        // rotate the ship
        if (rotation<180 || rotation >= 0)
        {
            ship.a += ship.rot;
        }

        // action of gravity
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y+vel;
        gravity += grav_inc;  
    
        if(altitude<= 90+ship.r*2 && 
            (ship.a >= 1.571-angle_lim && ship.a <= 1.571+angle_lim) &&
            (ship.x>=470 && ship.x<=580) )
        {
        ship.a = 1.571;
        ship.thrust = 0;
        ctx.fillStyle = "aqua";
        ctx.font = "20px Trebuchet MS";
        ctx.fillText("Successful landing",cvs.width/2-70,cvs.height/2);
        
        ship.x = ship.x
        ship.y = ship.y
        gravity = 0;
        }
        else if(altitude<= 90+ship.r*2 &&
            ship.a > 1.571+angle_lim)
        {
        ctx.fillStyle = "red";
        ctx.font = "20px Trebuchet MS";
        ctx.fillText("You crashed. Higher angle");
        ship.x = ship.x
        ship.y = ship.y
        gravity = 0;
        }
        else if(altitude<= 90+ship.r*2 &&
            ship.a < 1.571-angle_lim)
        {
        ctx.fillStyle = "red";
        ctx.font = "20px Trebuchet MS";
        ctx.fillText("You crashed. Lower angle");
        ship.x = ship.x
        ship.y = ship.y
        gravity = 0;
        }
        else if (altitude<= 90+ship.r*2)
        {
        ctx.fillStyle = "red";
        ctx.font = "20px Trebuchet MS";
        ctx.fillText("Outra coisa");
        ship.x = ship.x
        ship.y = ship.y
        gravity = 0;
        }
        else
    requestAnimationFrame(draw);
    }

draw();