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
var segment = 0;
var seg_int = 0;
var floor_height = 40;
var fuel_on = 1;

const MAX_FUEL = 100;
const FPS = 30; // frames per second
const FRICTION = 0.7; // friction coefficient of space (0 = no friction, 1 = lots of friction)
const SHIP_SIZE = 10; // ship height in pixels
const SHIP_THRUST_MAX = 2;
const TURN_SPEED = 1.5;
const MAX_THRUST_VECTOR = 20; // thrust vector for the fire triangle
const max_landing_speed = 2.5;
const angle_lim = 0.15;
const debug = 0;

var fuel = MAX_FUEL;

// @note Floor generation variables

var floor_units = 20;
const floor_tile_size = cvs.width/floor_units;
const rnd_floor_height = 100;
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
            if (fuel>0)
            {
                if (fuel_on == 1)
                {
                ship.thrusting = true;
                }
                else
                break;
            }   
            else
                ship.thrusting = false;
            break;
        case 87: // w pressed
            if (fuel<=0)
            {
                ship.thrusting = false;   
                return;
            }   
            else
            {
                ship.thrusting = true;
            }
        break;
        case 37: // left pressed
            ship.rot = TURN_SPEED / 180 * Math.PI;
        break;
        case 65: // a pressed
            ship.rot = TURN_SPEED / 180 * Math.PI;
        break;
        case 39: // right pressed
            ship.rot = -TURN_SPEED / 180 * Math.PI;
        break;
        case 68: // d pressed
            ship.rot = -TURN_SPEED / 180 * Math.PI;
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

    // ctx.font = 15+"px Verdana";
    // ctx.fillText("Land on the          landing pad",cvs.width/2-110,20);
    
    // ctx.fillStyle = "white";
    // ctx.fillText("white",cvs.width/2-15,20);

    ctx.fillStyle = "lightsteelblue";
    const controls_height=40;
    ctx.font = (15+cvs.width/500)+"px Verdana";
    var padding_from_right = 270;
    ctx.fillText("Controls:",cvs.width-padding_from_right,controls_height+10);
    ctx.fillText("Up/W: Activate thrusters",cvs.width-padding_from_right,controls_height+30);
    ctx.fillText("Shift: Increase power",cvs.width-padding_from_right,controls_height+50);
    ctx.fillText("Ctrl: Decrease power",cvs.width-padding_from_right,controls_height+70);
    ctx.fillText("Left/A and Right/D: Rotation",cvs.width-padding_from_right,controls_height+90);
    ctx.fillText("Space: Pause",cvs.width-padding_from_right,controls_height+110);
    
    ctx.fillText("Fuel: "+parseFloat((fuel*100/MAX_FUEL).toFixed(1))+"%",10,controls_height+10);
    ctx.fillText("Altitude: "+parseFloat(altitude.toFixed(0)),10,controls_height+30);
    ctx.fillText("Vertical velocity: "+parseFloat(vel_y.toFixed(1)),10,controls_height+50);
    ctx.fillText("Horizontal velocity: "+parseFloat(vel_x.toFixed(1)),10,controls_height+70);
    ctx.fillText("Thrusters: "+parseFloat((SHIP_THRUST*100/SHIP_THRUST_MAX).toFixed(0))+"%",10,controls_height+90);
    ctx.fillText("Rotation: "+parseFloat(radians_to_degrees(ship.a).toFixed(0)-90)+"º",10,controls_height+110);
    
    if (debug == 1)
    {
        ctx.fillStyle = "#507080";
        ctx.font = (10+cvs.width/500)+"px Verdana";
        const debug_height=170;
        ctx.fillText("Debug:",10,debug_height);
        ctx.fillText("ship.thrust.y: "+parseFloat(ship.thrust.y.toFixed(1)),10,debug_height+15);
        ctx.fillText("ship.thrust.x: "+parseFloat(ship.thrust.x.toFixed(1)),10,debug_height+30);
        ctx.fillText("ship angle: "+parseFloat(ship.a.toFixed(3)),10,debug_height+45);
        ctx.fillText("ship thrust: "+parseFloat(SHIP_THRUST.toFixed(1)),10,debug_height+60);
        ctx.fillText("vel x: "+parseFloat(vel_x.toFixed(1)),10,debug_height+75);
        ctx.fillText("ship.x "+parseFloat(ship.x.toFixed(1)),10,debug_height+90);
        ctx.fillText("vel y "+parseFloat(vel_y.toFixed(1)),10,debug_height+105);
        ctx.fillText("floor units: "+parseFloat(floor_units.toFixed(1)),10,debug_height+120);
        ctx.fillText("flat = "+flat,10,debug_height+135);
        ctx.fillText("floor size "+parseFloat(floor_tile_size.toFixed(1)),10,debug_height+150);

        // collision detection
        ctx.fillStyle = "yellowgreen";
        ctx.font = "16px Verdana";
        ctx.fillText("Over the segment: "+seg_int+"-"+(seg_int+1),cvs.width/2-100,200);
        ctx.fillText("Floor height from "+parseFloat(floor_heights[seg_int].toFixed(2))+" to "+parseFloat(floor_heights[seg_int+1].toFixed(2)),cvs.width/2-140,230);

        //to do list
        const todo_height = cvs.height-240;
        ctx.fillStyle = "#507080";
        ctx.font = (10+cvs.width/500)+"px Verdana";
        ctx.fillText("To do list:",10,todo_height);
        ctx.fillText("• Stop thrusting even if key is pressed when fuel is depleted",10,todo_height+20);
        ctx.fillText("• Implement collision with the floor",10,todo_height+40);
        ctx.fillText("• Bar to indicate fuel",10,todo_height+60);
        ctx.fillText("• Better graphics",10,todo_height+80);

        //floor heights and labels
        ctx.fillStyle = "white";
        ctx.font = "10px Verdana";
        ctx.fillText(""+parseFloat(floor_heights[0].toFixed(2)),5,cvs.height-floor_heights[0]-15);
        ctx.fillText(""+parseFloat(floor_heights[1].toFixed(2)),1*floor_tile_size,cvs.height-floor_heights[1]-15);
        ctx.fillText(""+parseFloat(floor_heights[2].toFixed(2)),2*floor_tile_size,cvs.height-floor_heights[2]-15);
        ctx.fillText(""+parseFloat(floor_heights[3].toFixed(2)),3*floor_tile_size,cvs.height-floor_heights[3]-15);
        ctx.fillText(""+parseFloat(floor_heights[4].toFixed(2)),4*floor_tile_size,cvs.height-floor_heights[4]-15);
        ctx.fillText(""+parseFloat(floor_heights[5].toFixed(2)),5*floor_tile_size,cvs.height-floor_heights[5]-15);
        ctx.fillText(""+parseFloat(floor_heights[6].toFixed(2)),6*floor_tile_size,cvs.height-floor_heights[6]-15);
        ctx.fillText(""+parseFloat(floor_heights[7].toFixed(2)),7*floor_tile_size,cvs.height-floor_heights[7]-15);
        ctx.fillText(""+parseFloat(floor_heights[8].toFixed(2)),8*floor_tile_size-30,cvs.height-floor_heights[8]-15);

        ctx.font = "15px Verdana";
        ctx.fillText("0",10,cvs.height-floor_heights[0]-25);
        ctx.fillText("1",1*floor_tile_size,cvs.height-floor_heights[1]-25);
        ctx.fillText("2",2*floor_tile_size,cvs.height-floor_heights[2]-25);
        ctx.fillText("3",3*floor_tile_size,cvs.height-floor_heights[3]-25);
        ctx.fillText("4",4*floor_tile_size,cvs.height-floor_heights[4]-25);
        ctx.fillText("5",5*floor_tile_size,cvs.height-floor_heights[5]-25);
        ctx.fillText("6",6*floor_tile_size,cvs.height-floor_heights[6]-25);
        ctx.fillText("7",7*floor_tile_size,cvs.height-floor_heights[7]-25);
        ctx.fillText("8",8*floor_tile_size-20,cvs.height-floor_heights[8]-25);
        
    }

}

var flat = 0;
var aux = 0;
var aux2 = 0;
//@note Floor generation
function drawFloor()
{
        // procedural floor generation
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo( 
            0,
            cvs.height-Math.random()*rnd_floor_height
        );
        for (n=0;n<=floor_units;n++)
        {
            if (floor_gen == 0)
            {
                floor_heights[n] = Math.random()*rnd_floor_height+cvs.height/14;
            }
            if (n>0)
            {
                if (Math.abs(floor_heights[n]-floor_heights[n-1]) < min_floor_diff && flat<floor_units)    
                {
                    flat += 1;
                    aux = n-1;
                    aux = n;
                }
                else if (Math.abs(floor_heights[n]-floor_heights[n-1]) >= 5 && flat == 0)  
                {
                    ctx.fillStyle = "yellowgreen";
                        ctx.font = "20px Verdana";
                        ctx.fillText("Not a flat area",cvs.width/2-60,cvs.height/2+90);
                }

            } 
            // after generating entire floor there's no flat segment
            if (n == floor_units && flat == 0)
            {
                n = 0;
            }
            else
            {
                ctx.lineTo(
                    0+n*floor_tile_size,
                    cvs.height-floor_heights[n]
                );
            }
        }
        ctx.lineTo(
            cvs.width,
            cvs.height
        );
        ctx.lineTo(
            0,
            cvs.height
        );
        ctx.lineWidth = 2;
        ctx.strokeStyle = "lightsteelblue";
        ctx.fillStyle = "lightsteelblue";
        ctx.closePath();
        ctx.fill(); 
        ctx.stroke(); 
        floor_gen = 1;  
    
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
        //floor segment detection
        segment = ship.x/floor_tile_size;
        seg_int = Math.floor(ship.x/floor_tile_size);
        floor_height = (floor_heights[seg_int]+floor_heights[seg_int+1])/2;


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
        
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle="#ffffff";
        ctx.strokeRect(0, 0, cvs.width, cvs.height);//for white background
        
        drawFloor();        

        drawtexts();

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
        if(fuel == 0)
        {
            fuel_on = 0;
            ctx.fillStyle = "red";
            ctx.font = "20px Trebuchet MS";
            ctx.fillText("Out of fuel!",cvs.width/2-60,cvs.height/2-40);
            ship.thrusting == false;
        }

        //@note Win/lose detection
        if((altitude <= floor_height+ship.r*2+8) 
        && (ship.a >= 1.571-angle_lim && ship.a <= 1.571+angle_lim) 
        && (ship.x>=seg_int*floor_tile_size && ship.x<=(seg_int+1)*floor_tile_size) 
        && (vel_y <= 1.2))
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
        else if(altitude <= floor_height+ship.r*2+8 &&
            !(ship.x>=seg_int*floor_tile_size && (seg_int+1)*floor_tile_size<=580))
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