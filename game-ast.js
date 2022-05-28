var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

// load images
var module = new Image();
var fire = new Image();
var X = new Image();

//@note Variables
var mX = 427;
var mY = 10;

var gravity = 0.5; 
var grav_inc = gravity/40;
var keypress = 0;
var altitude;
var vel = 0;
var key;
var rotation = 90;
var rot_rad;
var turnspeed = 3;
var SHIP_THRUST = 1; // acceleration of the ship in pixels per second per second
var game_on = 0;
var floor_gen = 0;

const MAX_FUEL = 100;
const FPS = 30; // frames per second
const FRICTION = 0.7; // friction coefficient of space (0 = no friction, 1 = lots of friction)
const SHIP_SIZE = 20; // ship height in pixels
const SHIP_THRUST_MAX = 2;
const TURN_SPEED = 60; // turn speed in degrees per second
const MAX_THRUST_VECTOR = 20; // thrust vector for the fire triangle
const max_landing_speed = 2.5;
const angle_lim = 0.15;
const floor_height = 40;

var fuel = MAX_FUEL;

// @note Floor generation variables

var floor_units = 20;
const floor_tile_size = cvs.width/floor_units;
const rnd_floor_height = 50;
var floor_heights = [];
min_floor_diff= 1.5;

// set up the spaceship object
var ship = {
    x: 0,
    y: SHIP_SIZE+20,
    r: SHIP_SIZE / 2,
    a: 3,
    rot: 0.002,
    thrusting: false,
    thrust: {
        x: 2,
        y: -0.8
    }
}

//@note Key Events
document.addEventListener("keydown", keys); 
function keys(event)
{  
    switch(event.keyCode) 
    {
        case 38: // up pressed
            key = event.keyCode;
            keypress = 1;
            ship.thrusting = true;
            //if (fuel>0)
           // {
            //mY-=thrust;
            //fuel-=(SHIP_THRUST*0.05);
            //}   
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
        case 32: // space pressed
        switch(game_on)
        {
            case 0:
                game_on = 1; // pause the game
            break;
            case 1:
                game_on = 0; // unpause the game            
                draw();
            break;
            case 2:
                location.reload();
                game_on = 0; // unpause the game            
                draw();
            break;
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
function radians_to_degrees(radians)
{
  return radians/(Math.PI/180);
}
            
function drawtexts() //@note Texts
{    
    ctx.fillStyle = "lightsteelblue";

    ctx.font = "15px Verdana";
    ctx.fillText("Land on the          landing pad",cvs.width/2-110,20);
    
    ctx.fillStyle = "white";
    ctx.fillText("white",cvs.width/2-15,20);
    ctx.fillStyle = "lightsteelblue";
    const controls_height=40;
    ctx.font = "12px Verdana";
    ctx.fillText("Controls:",cvs.width-190,controls_height+10);
    ctx.fillText("Up/W: Activate thrusters",cvs.width-190,controls_height+30);
    ctx.fillText("Shift: Increase power",cvs.width-190,controls_height+50);
    ctx.fillText("Ctrl: Decrease power",cvs.width-190,controls_height+70);
    ctx.fillText("Left/A and Right/D: Rotation",cvs.width-190,controls_height+90);
    ctx.fillText("Space: Pause",cvs.width-190,controls_height+110);
    
    ctx.fillText("Fuel: "+parseFloat((fuel*100/MAX_FUEL).toFixed(1))+"%",10,controls_height+10);
    ctx.fillText("Altitude: "+parseFloat(altitude.toFixed(0)),10,controls_height+30);
    ctx.fillText("Vertical velocity: "+parseFloat(vel_y.toFixed(1)),10,controls_height+50);
    ctx.fillText("Horizontal velocity: "+parseFloat(vel_x.toFixed(1)),10,controls_height+70);
    ctx.fillText("Thrusters: "+parseFloat((SHIP_THRUST*100/SHIP_THRUST_MAX).toFixed(0))+"%",10,controls_height+90);
    ctx.fillText("Rotation: "+parseFloat(radians_to_degrees(ship.a).toFixed(0)-90)+"º",10,controls_height+110);
    
    ctx.fillStyle = "#507080";
    ctx.font = "12px Verdana";
    const debug_height=190;
    ctx.fillText("Debug:",10,debug_height);
    ctx.fillText("gravity: "+parseFloat(gravity.toFixed(1)),10,debug_height+20);
    ctx.fillText("ship.y: "+parseFloat(ship.y.toFixed(1)),10,debug_height+35);
    ctx.fillText("ship.thrust.y: "+parseFloat(ship.thrust.y.toFixed(1)),10,debug_height+50);
    ctx.fillText("ship.thrust.x: "+parseFloat(ship.thrust.x.toFixed(1)),10,debug_height+65);
    ctx.fillText("ship angle: "+parseFloat(ship.a.toFixed(3)),10,debug_height+80);
    ctx.fillText("ship thrust: "+parseFloat(SHIP_THRUST.toFixed(1)),10,debug_height+95);
    ctx.fillText("vel x: "+parseFloat(vel_x.toFixed(1)),10,debug_height+110);
    ctx.fillText("ship.x "+parseFloat(ship.x.toFixed(1)),10,debug_height+125);
    ctx.fillText("vel y "+parseFloat(vel_y.toFixed(1)),10,debug_height+140);
    ctx.fillText("floor gen: "+parseFloat(floor_gen.toFixed(1)),10,debug_height+155);
    ctx.fillText("floor units: "+parseFloat(floor_units.toFixed(1)),10,debug_height+170);
    ctx.fillText("reto: "+parseFloat(reto.toFixed(1)),10,debug_height+190);

    //altura do chão
    // ctx.fillStyle = "white";
    // ctx.font = "10px Verdana";
    // ctx.fillText(""+parseFloat(floor_heights[0].toFixed(2)),5,cvs.height-floor_heights[0]-15);
    // ctx.fillText(""+parseFloat(floor_heights[1].toFixed(2)),40,cvs.height-floor_heights[1]-15);
    // ctx.fillText(""+parseFloat(floor_heights[2].toFixed(2)),90,cvs.height-floor_heights[2]-15);
    // ctx.fillText(""+parseFloat(floor_heights[3].toFixed(2)),140,cvs.height-floor_heights[3]-15);
    // ctx.fillText(""+parseFloat(floor_heights[4].toFixed(2)),190,cvs.height-floor_heights[4]-15);
    // ctx.fillText(""+parseFloat(floor_heights[5].toFixed(2)),240,cvs.height-floor_heights[5]-15);
    // ctx.fillText(""+parseFloat(floor_heights[6].toFixed(2)),290,cvs.height-floor_heights[6]-15);
    // ctx.fillText(""+parseFloat(floor_heights[7].toFixed(2)),340,cvs.height-floor_heights[7]-15);
    // ctx.fillText(""+parseFloat(floor_heights[8].toFixed(2)),390,cvs.height-floor_heights[8]-15);
    // ctx.fillText(""+parseFloat(floor_heights[9].toFixed(2)),440,cvs.height-floor_heights[9]-15);
    // ctx.fillText(""+parseFloat(floor_heights[10].toFixed(2)),490,cvs.height-floor_heights[10]-15);
    // ctx.fillText(""+parseFloat(floor_heights[11].toFixed(2)),540,cvs.height-floor_heights[11]-15);
    // ctx.fillText(""+parseFloat(floor_heights[12].toFixed(2)),590,cvs.height-floor_heights[12]-15);
    // ctx.fillText(""+parseFloat(floor_heights[13].toFixed(2)),635,cvs.height-floor_heights[13]-15);
    // ctx.fillText(""+parseFloat(floor_heights[14].toFixed(2)),675,cvs.height-floor_heights[14]-15);


    // ctx.font = "15px Verdana";
    // ctx.fillText("0",10,cvs.height-floor_heights[0]-25);
    // ctx.fillText("1",45,cvs.height-floor_heights[1]-25);
    // ctx.fillText("2",95,cvs.height-floor_heights[2]-25);
    // ctx.fillText("3",145,cvs.height-floor_heights[3]-25);
    // ctx.fillText("4",195,cvs.height-floor_heights[4]-25);
    // ctx.fillText("5",245,cvs.height-floor_heights[5]-25);
    // ctx.fillText("6",295,cvs.height-floor_heights[6]-25);
    // ctx.fillText("7",345,cvs.height-floor_heights[7]-25);
    // ctx.fillText("8",395,cvs.height-floor_heights[8]-25);
    // ctx.fillText("9",445,cvs.height-floor_heights[9]-25);
    // ctx.fillText("10",495,cvs.height-floor_heights[10]-25);
    // ctx.fillText("11",545,cvs.height-floor_heights[11]-25);
    // ctx.fillText("12",595,cvs.height-floor_heights[12]-25);
    // ctx.fillText("13",640,cvs.height-floor_heights[13]-25);
    // ctx.fillText("14",680,cvs.height-floor_heights[14]-25);
    

    //to do list
    const todo_height = 430;
    ctx.fillStyle = "#507080";
    ctx.font = "9px Verdana";
    ctx.fillText("To do list:",10,todo_height);
    ctx.fillText("• Procedural ground generation",10,todo_height+15);
    ctx.fillText("• Bar to indicate fuel",10,todo_height+30);
    ctx.fillText("• Better graphics",10,todo_height+45);

}

var reto = 0;
var aux = 0;
var aux2 = 0;
//@note Floor generation
function drawFloor()
{
    // procedural floor generation
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo( 
        0,
        cvs.height-Math.random()*rnd_floor_height
    );

    for (n=0;n<=floor_units;n++)
    {
        if (floor_gen == 0)
        {
            floor_heights[n] = Math.random()*rnd_floor_height+cvs.height/12;
        }
        if (n>0)
        {
            if (Math.abs(floor_heights[n]-floor_heights[n-1]) < min_floor_diff)   
            {
                reto = 1;
                aux = n-1;
                aux = n;
                
            }
            else if (Math.abs(floor_heights[n]-floor_heights[n-1]) >= 5 && reto == 0)  
            {
                ctx.fillStyle = "yellowgreen";
                    ctx.font = "20px Verdana";
                    ctx.fillText("Chão torto",cvs.width/2-40,cvs.height/2+90);
            }

        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";
        ctx.lineTo(
            0+n*floor_tile_size,
            cvs.height-floor_heights[n]
        );
        
    }
    ctx.lineTo(
        cvs.width,
        cvs.height
    );
    ctx.lineTo(
        0,
        cvs.height
    );
    ctx.strokeStyle = "black";
    ctx.fillStyle = "lightsteelblue";
    ctx.closePath();
    ctx.fill(); 
    ctx.stroke(); 
    floor_gen=1;  
    // // draw the floor
    // ctx.strokeStyle = "white";
    // ctx.lineWidth = 1;
    // ctx.beginPath();

    // //regular floor
    // ctx.moveTo( 0,
    //     cvs.height-floor_height
    // );
    // ctx.lineTo(
    //     cvs.width,
    //     cvs.height-floor_height
    // );
    // irregular floor
    // ctx.moveTo( 0,
    //     cvs.height-10
    // );
    // ctx.lineTo(
    //     20,
    //     cvs.height-15
    // );
    // ctx.lineTo(
    //     110,
    //     cvs.height-20
    // );
    // ctx.lineTo( 
    //     150,
    //     cvs.height-35
    // );
    // ctx.lineTo( 
    //     390,
    //     cvs.height-60
    // );
    // ctx.lineTo( 
    //     420,
    //     cvs.height-75
    // );
    // ctx.lineTo( 
    //     450,
    //     cvs.height-75
    // );
    // ctx.lineTo( 
    //     470,
    //     cvs.height-90
    // );
    // ctx.stroke();

    // ctx.lineWidth = 3;
    // ctx.beginPath();
    // ctx.moveTo( 
    //     470,
    //     cvs.height-floor_height
    // );
    // ctx.strokeStyle = "yellowgreen";
    // ctx.lineTo( 
    //     580,
    //     cvs.height-floor_height
    // );
    // ctx.stroke();
    // ctx.beginPath();
    // ctx.moveTo( 
    //     580,
    //     cvs.height-floor_height
    // );
    // ctx.strokeStyle = "white";
    // ctx.lineTo( 
    //     600,
    //     cvs.height-65
    // );
    // ctx.lineTo( 
    //     cvs.width,
    //     cvs.height-20
    // );
    // ctx.stroke();
}

const pos = [];

var vel_x = 0;
var vel_y = 0;
var previous_x = ship.x;
var previous_y = ship.y;

//@note Game drawing
function draw()
{ 

    if (game_on == 0)
    {
        vel_x = ship.x-previous_x;
        vel_y = ship.y-previous_y;
        altitude = (cvs.height-ship.y)+ship.r;
        vel =+ gravity;

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
        
        drawFloor();        

        drawtexts();
        if (keypress == 1 && fuel > 0)
        {
        ctx.drawImage(fire, mX, mY);
        }
        else if (keypress == 1 && fuel <= 0)
        {
        ctx.fillStyle = "lightgreen";
        ctx.font = "30px Trebuchet MS";
        ctx.fillText("Out of fuel!",370,90);
        }

        // pauses when reaches bottom of the canvas
        if ((altitude <= 0)||ship.y <0 || ship.x <0 || ship.x > cvs.width)
        {
            ctx.fillStyle = "lightgreen";
            ctx.font = "20px Trebuchet MS";
            ctx.fillText("Out of game screen",cvs.width/2-75,cvs.height/2);
            ctx.fillText("Press Space to restart",cvs.width/2-83,cvs.height/2+30);
            game_on = 2; 
            ship.x = ship.x
            ship.y = ship.y
            gravity = 0;
        }


        // thrust the ship
        if (ship.thrusting) {
            ship.thrust.x += 0.25* SHIP_THRUST * Math.cos(ship.a) / FPS;
            ship.thrust.y -= 0.5*SHIP_THRUST * Math.sin(ship.a) / FPS;

            // @note Thruster drawing
            if(SHIP_THRUST>0)
            {
                ctx.fillStyle = "cyan";
                ctx.strokeStyle = "mediumspringgreen";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo( // rear left
                    ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
                    ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
                );
                ctx.lineTo( // rear centre (behind the ship)
                    ship.x - 0.8*(ship.r) * 5 / 3 * Math.cos(ship.a) - ((SHIP_THRUST/SHIP_THRUST_MAX)*MAX_THRUST_VECTOR*Math.cos(ship.a)),
                    ship.y + 0.8*(ship.r) * 5 / 3 * Math.sin(ship.a) + ((SHIP_THRUST/SHIP_THRUST_MAX)*MAX_THRUST_VECTOR*Math.sin(ship.a))
                );
                ctx.lineTo( // rear right
                    ship.x -ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
                    ship.y +ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
                );
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }

        // @note Ship drawing
        ctx.strokeStyle = "white";
        ctx.fillStyle = "black";
        ctx.lineWidth = 2;
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
        ctx.fill();
        ctx.stroke();


        // @note Draw landing gear
        var ac = 0.45;
        var size = SHIP_SIZE/2;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo( // start left
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
        );
        ctx.lineTo( // end left
            
             ship.x - (ship.r+size) * (2 / 3 * Math.cos(ship.a+ac) + Math.sin(ship.a+ac)),
             ship.y + (ship.r+size) * (2 / 3 * Math.sin(ship.a+ac) - Math.cos(ship.a+ac))
        );
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo( // start right
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
        );
        ctx.lineTo( // end right
            ship.x - (ship.r+size) * (2 / 3 * Math.cos(ship.a-ac) - Math.sin(ship.a-ac)),
            ship.y + (ship.r+size) * (2 / 3 * Math.sin(ship.a-ac) + Math.cos(ship.a-ac))
        );
        ctx.stroke();

        drawFloor();

        // @note Movement
        //rotation
        if (rotation<180 || rotation >= 0)
        {
            ship.a += ship.rot;
        }

        //thrusting and gravity
        previous_x = ship.x;
        previous_y = ship.y;
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y+vel;
        gravity += grav_inc;

        // @note Fuel consumption
        if (ship.thrusting == true)
        {
            fuel-=(SHIP_THRUST*0.01);
        }

        //@note Win/lose detection
        if((altitude<= floor_height+ship.r*2+8) 
        && (ship.a >= 1.571-angle_lim && ship.a <= 1.571+angle_lim) 
        && (ship.x>=470 && ship.x<=580) 
        && (vel_y <=1.5) )
        {
            ship.a = 1.571;
            ship.thrust = 0;
            ctx.fillStyle = "greenyellow";
            ctx.font = "20px Trebuchet MS";
            ctx.fillText("Successful landing",cvs.width/2-90,cvs.height/2);
            ctx.fillText("Press Space to restart",cvs.width/2-105,cvs.height/2+30);
            
            ship.x = ship.x
            ship.y = ship.y
            gravity = 0;       
            game_on = 2; 
        }
        else if(altitude<= floor_height+ship.r*2+8 &&
            !(ship.x>=470 && ship.x<=580))
        {
        ctx.fillStyle = "lightgreen";
        ctx.font = "20px Trebuchet MS";
        ctx.fillText("Outside of landing pad",cvs.width/2-110,cvs.height/2+30);
        ctx.fillText("Press Space to restart",cvs.width/2-105,cvs.height/2+60);
        game_on = 2; 
        ship.x = ship.x
        ship.y = ship.y
        gravity = 0;
        }
        else if(altitude<= floor_height+ship.r*2+8 &&
            ship.a > 1.571+angle_lim)
        {
        ctx.fillStyle = "lightgreen";
        ctx.font = "20px Trebuchet MS";
        ctx.fillText("Crashed",cvs.width/2-50,cvs.height/2);
        ctx.fillText("Tilted module",cvs.width/2-75,cvs.height/2+30);
        ctx.fillText("Press Space to restart",cvs.width/2-105,cvs.height/2+60);
        game_on = 2;
        ship.x = ship.x
        ship.y = ship.y
        gravity = 0;
        }
        else if(altitude<= floor_height+ship.r*2+8 &&
            ship.a < 1.571-angle_lim)
        {
        ctx.fillStyle = "lightgreen";
        ctx.font = "20px Trebuchet MS";
        ctx.fillText("Crashed",cvs.width/2-50,cvs.height/2);
        ctx.fillText("Tilted module",cvs.width/2-75,cvs.height/2+30);
        ctx.fillText("Press Space to restart",cvs.width/2-105,cvs.height/2+60);
        game_on = 2; 
        ship.x = ship.x
        ship.y = ship.y
        gravity = 0;
        }
        else if (altitude<= floor_height+ship.r*2+8)
        {
        ctx.fillStyle = "lightgreen";
        ctx.font = "20px Trebuchet MS";
        ctx.fillText("Crashed",cvs.width/2-50,cvs.height/2);
        ctx.fillText("Too fast",cvs.width/2-50,cvs.height/2+30);
        ctx.fillText("Press Space to restart",cvs.width/2-105,cvs.height/2+60);
        game_on = 2; 
        ship.x = ship.x
        ship.y = ship.y
        gravity = 0;
        }
        else
        
        ctx.strokeStyle = "white";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo( 
            (aux)*floor_tile_size,
            cvs.height-floor_heights[aux]
        );
        ctx.lineTo(
            (aux-1)*floor_tile_size,
            cvs.height-floor_heights[aux-1]
        );
        ctx.stroke(); 

        requestAnimationFrame(draw);
    }
    else if(game_on == 1)
    {
        ctx.fillStyle = "white";
        ctx.font = "25px Trebuchet MS";
        ctx.fillText("||",cvs.width/2-13,cvs.height/2);
    }
}

draw();