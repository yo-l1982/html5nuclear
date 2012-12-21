////////////////////////////////////////////////////////////////////////////////
// Game code
////////////////////////////////////////////////////////////////////////////////

var firstTurn = true; // if set to true, dont initialize the drawing area again. Or ?
var players = new Array();
/**
 * Called when we recieve a "turn" response from server.
 */
function onTurn( message ) {
    console.log( message );
    
    players = message.data;
    if( firstTurn == true) {
	// If this is the first turn then draw game board.
	initGameArea();
	firstTurn = false;
    }
    /*
    jQuery.each( message.data, function( index ) {
	message.data[index]
    });*/
}

/**
 * Send action to server
 */
function doTurn() {
    if( ( city_focus == undefined || city_focus == 0 ) && 
	( myAction == 'PROPAGANDA' || myAction == 'WH_100' || 
	  myAction == 'WH_50' || myAction == 'WH_20' || myAction == 'WH_10') ) {
	  alert('NEED TO SELECT TARGET OMG NOOB!');
    }
    
    var packet = new Array();
    packet[0] = 'action';
    packet[1] = myGameId;
    packet[2] = myPlayerId;
    packet[3] = myAction;
    packet[4] = country_focus;
    packet[5] = city_focus;
    send( array2json( packet ) );
    myAction = 0;
    city_focus = 0;
}

//////////////////////////////////////////////////////////////////////////////////
// Network code
////////////////////////////////////////////////////////////////////////////////
var myGameId = 0; // Global variable set when server send rcv-joined. 
var myPlayerId = 0; // Global variable set when joining a lobby
var myAction;	    // What i do this turn


/*
struct packet_action {
   int turn;
   int player;	//	ignored when client sends
   int action;
   int target_player;
   int target_city;
};*/

window.onload = function () {
    connect();
    jQuery('#newGameButton').click(createNewGame);
    jQuery('#debugButton').click(sendDebugMessage);
    jQuery('#startGameButton').click(startGame);
}

/**
 * Draws the list of games
 */
function drawGameList( message ) {
    jQuery("#gameLists").empty();
    jQuery.each( message.data, function( index ) {
	jQuery("#gameLists").append( "<li> <a href='' onclick='joinGame("+index+");return false;'>" + message.data[index]['gamename'] + " - " + message.data[index]['playerCount'] + " Players - State: "+message.data[index]['state']+"</a></li>");
    });
    
}

/**
 * Sends startgame packet.
 */
function startGame() {
    var packet = new Array();
    packet[0] = "start";
    packet[1] = myGameId;
    send( array2json ( packet ) );
}

/**
 * Sends a request to start a new game
 */
function createNewGame() {
    console.log("Create New Game");
    var packet = new Array();
    packet[0] = 'newgame';
    packet[1] = jQuery('#newPlayerName').val();
    send( array2json( packet ) );
}

/**
 * Handles response for joining a game
 */
function joinedGameResponse( message ) {
    myGameId = message.data.gameId;
    myPlayerId = message.data.playerId;
    console.log("joined a game, got game id: "+myGameId+" and player id "+myPlayerId);
    var packet = new Array();
    packet[0] = "status";
    packet[1] = myGameId;
    send( array2json( packet ) );    
    jQuery('#startGameButton').show();
}

/**
 * Event used when clicking on join game button. Sends request for joining a game
 */
function joinGame( gameId ) {
    jQuery('#newGameArea').hide();
    jQuery('#gameLobbyArea').show();
    console.log("joined a game");
    // Send we want to join to server
    var packet = new Array();
    packet[0] = "join";
    packet[1] = gameId;
    packet[2] = jQuery( '#newPlayerName' ).val();
    send( array2json( packet ) );
}

/**
 * Displays all players currently in game, called when we recieve rcv-status
 */
function drawGameLobby( message ) {
    console.log("drawing players in lobby");
    jQuery('#newGameArea').hide();
    jQuery('#gameLobbyArea').show();
    
    console.log(message.data);
    jQuery("#playersList").empty();
    jQuery.each( message.data.players, function( index ) {
	jQuery("#playersList").append( "<li>" + message.data.players[index]['playerName'] + "</li>");
    });
}

/**
 * Connect to server
 */
function connect() {
    log('Connecting...');
    Server = new FancyWebSocket('ws://127.0.0.1:12345');

    $('#message').keypress(function(e) {
	if ( e.keyCode == 13 && this.value ) {
	    log( 'You: ' + this.value );
	    send( this.value );

	    $(this).val('');
	}
    });

    //Let the user know we're connected
    Server.bind('open', function() {
	log( "Connected." );
    });

    //OH NOES! Disconnection occurred.
    Server.bind('close', function( data ) {
	log( "Disconnected." );
    });

    //Log any messages sent from server
    Server.bind('message', function( message ) {
	log( "Recieved: "+message );
	recieve( message );
    });

    Server.connect();
}

function recieve( message ) {
    
    message = jQuery.parseJSON( message );
    switch( message.type ) {
	case "rcv-list" :
	    drawGameList(message);
	    break;
	case "rcv-joined":
	    joinedGameResponse(message);
	    break;
	case "rcv-status" :
	    drawGameLobby( message );
	    break;
	case "rcv-turn":
	    onTurn( message );
	    break;
	case "rcv-setup":
	    onSetup( message );
	    break;
    }
}

function log( text ) {
    $log = $('#log');
    //Add text to log
    $log.append(($log.val()?"\n":'')+text);
    //Autoscroll
    $log[0].scrollTop = $log[0].scrollHeight - $log[0].clientHeight;
}

function send( text ) {
    Server.send( 'message', text );
}

function sendDebugMessage() {
    log("Sending debug msg: "+ jQuery( '#debugMessageType' ).val() + ","+ jQuery( '#debugMessageData' ).val() );

    var packet = new Array();
    packet[0] = jQuery( '#debugMessageType' ).val();
    packet[1] = jQuery( '#debugMessageData' ).val();
    
    send( array2json( packet ) );
}

/**
 * MISC
 */
function array2json(arr) {
    var parts = [];
    var is_list = (Object.prototype.toString.apply(arr) === '[object Array]');

    for(var key in arr) {
    	var value = arr[key];
        if(typeof value == "object") { //Custom handling for arrays
            if(is_list) parts.push(array2json(value)); /* :RECURSION: */
            else parts[key] = array2json(value); /* :RECURSION: */
        } else {
            var str = "";
            if(!is_list) str = '"' + key + '":';

            //Custom handling for multiple data types
            if(typeof value == "number") str += value; //Numbers
            else if(value === false) str += 'false'; //The booleans
            else if(value === true) str += 'true';
            else str += '"' + value + '"'; //All other things
            // :TODO: Is there any more datatype we should be in the lookout for? (Functions?)

            parts.push(str);
        }
    }
    var json = parts.join(",");
    
    if(is_list) return '[' + json + ']';//Return numerical JSON
    return '{' + json + '}';//Return associative JSON
}



////////////////////////////////////////////////////////////////////////////////
// Drawing code
////////////////////////////////////////////////////////////////////////////////
var canvas;
var context;
var layer_terminal;
var layer_world;
var leaders_sprite_interval;
var country_focus = 0;
var container;

var font_settings = "15px bold arial";
var font_color = "yellow";
var city_focus = 0;

function initGameArea() {
    console.log("Should init game area!!!");
    jQuery('#gameLobbyArea').hide();
    jQuery('#newGameArea').hide();
    jQuery('#gameListArea').hide();
    jQuery('#playerNameArea').hide();
    init_terminal();
    $('#game_area').click(terminal_click_handler);
}

terminal_click_handler = function(e){
    
  var x = e.pageX - this.offsetLeft;
  var y = e.pageY - this.offsetTop;
  
  command = '';
  
  for(i = 0; i < terminal_coordinates.length; i++) {
    if ((x > terminal_coordinates[i].x1 && x < terminal_coordinates[i].x2) && (y > terminal_coordinates[i].y1 && y < terminal_coordinates[i].y2)) {
      command = terminal_areas[terminal_coordinates[i].id].function_name;
    }
  }
  
  // Have to make a better structure for this!
  if((x > city_coordinates[country_focus].city_1_x && x < city_coordinates[country_focus].city_1_x + 32) && (y > city_coordinates[country_focus].city_1_y && y < city_coordinates[country_focus].city_1_y + 32)) {
    click_city_1();
  }
  if((x > city_coordinates[country_focus].city_2_x && x < city_coordinates[country_focus].city_2_x + 32) && (y > city_coordinates[country_focus].city_2_y && y < city_coordinates[country_focus].city_2_y + 32)) {
    click_city_2();
  }
  if((x > city_coordinates[country_focus].city_3_x && x < city_coordinates[country_focus].city_3_x + 32) && (y > city_coordinates[country_focus].city_3_y && y < city_coordinates[country_focus].city_3_y + 32)) {
    click_city_3();
  }
  if((x > city_coordinates[country_focus].city_4_x && x < city_coordinates[country_focus].city_4_x + 32) && (y > city_coordinates[country_focus].city_4_y && y < city_coordinates[country_focus].city_4_y + 32)) {
    click_city_4();
  }
  if((x > city_coordinates[country_focus].city_5_x && x < city_coordinates[country_focus].city_5_x + 32) && (y > city_coordinates[country_focus].city_5_y && y < city_coordinates[country_focus].city_5_y + 32)) {
    click_city_5();
  }

  
  if(command) {
    window[command]();
  }
}

init_terminal = function() {    
  canvas = document.getElementById("game_area");
  container = new CanvasLayers.Container(canvas, true);
  
  container.onRender = render_foreground;
  
  
  layer_terminal = new CanvasLayers.Layer(0, 0, 640, 480);
  container.getChildren().add(layer_terminal);
  
  layer_terminal.onRender = render_terminal;
  
  layer_world = new CanvasLayers.Layer(0, 0, 640, 480);
  container.getChildren().add(layer_world);
  
  layer_world.onRender = render_world;
  
  container.redraw();
}

render_terminal = function(layer, rect, context) {
    var imageObj = new Image();
 
  imageObj.onload = function() {
    canvas.width = imageObj.width;
    canvas.height = imageObj.height;
    context.drawImage(imageObj, 0, 0);
  };
  imageObj.src = "gfx/terminal.bmp";
  
  /* initiate leader gfx */
  var leaders_gfx = new Image();
  leaders_gfx.onload = function() {
    leaders_sprite_interval = setInterval(function(){
      if(players[1] != undefined) {
	command = 'anim_' + leaders[players[1].leader].id;
	window[command].animate(timer.getSeconds());
	frame = window[command].getSprite();
	context.clearRect(25, 10, 64, 64);
	context.drawImage(leaders_gfx, frame.x, frame.y, 32, 32, 25, 10, 64, 64);
      }
      
      if(players[2] != undefined) {      
	command = 'anim_' + leaders[players[2].leader].id;
	window[command].animate(timer.getSeconds());
	frame = window[command].getSprite();
	context.clearRect(535, 10, 64, 64);
	context.drawImage(leaders_gfx, frame.x, frame.y, 32, 32, 535, 10, 64, 64);
      }
      
      if(players[3] != undefined) {      
	command = 'anim_' + leaders[players[3].leader].id;
	window[command].animate(timer.getSeconds());
	frame = window[command].getSprite();
	context.clearRect(25, 385, 64, 64);
	context.drawImage(leaders_gfx, frame.x, frame.y, 32, 32, 25, 385, 64, 64);
      }
      if(players[4] != undefined) {      
	command = 'anim_' + leaders[players[4].leader].id;
	window[command].animate(timer.getSeconds());
	frame = window[command].getSprite();
	context.clearRect(535, 385, 64, 64);
	context.drawImage(leaders_gfx, frame.x, frame.y, 32, 32, 535, 385, 64, 64);
      }
      timer.tick();
    }, 5);
    
    if(players[1] != undefined) {
	context.font = font_settings;
	context.fillStyle = font_color;
	context.fillText(players[1].playerName, 30, 100);
	enable_leds(players[1].inventory, context);
    }
    if(players[2] != undefined) {    
	context.font = font_settings;
	context.fillStyle = font_color;
	context.fillText(players[2].playerName, 540, 100);
	enable_leds(players[2].inventory, context);
    }
    
    if(players[3] != undefined) {
	context.font = font_settings;
	context.fillStyle = font_color;
	context.fillText(players[3].playerName, 30, 470);
	enable_leds(players[3].inventory, context);
    }
    
    if(players[4] != undefined) {
	context.font = font_settings;
	context.fillStyle = font_color;
	context.fillText(players[4].playerName, 540, 470);
	enable_leds(players[4].inventory, context);
    }
    
    
  };
  
  leaders_gfx.src = 'gfx/leaders.bmp';
}


render_foreground = function() {
// What to do here?  function is needed anyhow!
}



city_sprite_name = function(population) {
  sprite_name = '';
  
  if (population == 0) {
    sprite_name = 'city_1';
  }
  else if(population > 0 && population <= 5) {
    sprite_name = 'city_2';
  }
  else if(population > 5 && population <= 10) {
    sprite_name = 'city_3';
  }
  else if(population > 10 && population <= 20) {
    sprite_name = 'city_4';
  }
  else if(population > 20 && population <= 30) {
    sprite_name = 'city_5';
  }
  else if(population > 30) {
    sprite_name = 'city_6';
  }
  
  return sprite_name;
}

render_world = function(layer, rect, context) {
  var imageObj = new Image();
  imageObj.onload = function() {
    context.drawImage(imageObj, country_coords[country_focus].clip_start_x, country_coords[country_focus].clip_start_y, 133, 81, 200, 120, 247, 162);
  };
  imageObj.src = "gfx/world.bmp";
  
  // need all the players population here! going with only player 1 while testing **********************************************************<<<<
  
  var city_1_gfx = new Image();
  city_1_gfx.onload = function() {
    city_sprite = city_sprites.getOffset(city_sprite_name(players[1].cities[0]));
    context.drawImage(city_1_gfx, city_sprite.x, city_sprite.y, 16, 16, city_coordinates[country_focus].city_1_x, city_coordinates[country_focus].city_1_y, 32, 32);
    
    context.font = font_settings;
    context.fillStyle = font_color;
    context.fillText(players[1].cities[0], city_coordinates[country_focus].city_1_x + 10, city_coordinates[country_focus].city_1_y + 45);
  };
  
  
  city_1_gfx.src = "gfx/cities.png";  
  
  
  var city_2_gfx = new Image();
  city_2_gfx.onload = function() {
    city_sprite = city_sprites.getOffset(city_sprite_name(players[1].cities[1]));
    context.drawImage(city_2_gfx, city_sprite.x, city_sprite.y, 16, 16, city_coordinates[country_focus].city_2_x, city_coordinates[country_focus].city_2_y, 32, 32);
    
    context.font = font_settings;
    context.fillStyle = font_color;
    context.fillText(players[1].cities[1], city_coordinates[country_focus].city_2_x + 10, city_coordinates[country_focus].city_2_y + 45);
  };
  
  city_2_gfx.src = "gfx/cities.png";  
  
  var city_3_gfx = new Image();
  city_3_gfx.onload = function() {
    city_sprite = city_sprites.getOffset(city_sprite_name(players[1].cities[2]));
    context.drawImage(city_3_gfx, city_sprite.x, city_sprite.y, 16, 16, city_coordinates[country_focus].city_3_x, city_coordinates[country_focus].city_3_y, 32, 32);
    
    context.font = font_settings;
    context.fillStyle = font_color;
    context.fillText(players[1].cities[2], city_coordinates[country_focus].city_3_x + 10, city_coordinates[country_focus].city_3_y + 45);
  };
  
  city_3_gfx.src = "gfx/cities.png";  
  
  var city_4_gfx = new Image();
  city_4_gfx.onload = function() {
    city_sprite = city_sprites.getOffset(city_sprite_name(players[1].cities[3]));
    context.drawImage(city_4_gfx, city_sprite.x, city_sprite.y, 16, 16, city_coordinates[country_focus].city_4_x, city_coordinates[country_focus].city_4_y, 32, 32);
    
    context.font = font_settings;
    context.fillStyle = font_color;
    context.fillText(players[1].cities[3], city_coordinates[country_focus].city_4_x + 10, city_coordinates[country_focus].city_4_y + 45);
  };

  city_4_gfx.src = "gfx/cities.png";  
  
  var city_5_gfx = new Image();
  city_5_gfx.onload = function() {
    city_sprite = city_sprites.getOffset(city_sprite_name(players[1].cities[4]));
    context.drawImage(city_5_gfx, city_sprite.x, city_sprite.y, 16, 16, city_coordinates[country_focus].city_5_x, city_coordinates[country_focus].city_5_y, 32, 32);
    
    context.font = font_settings;
    context.fillStyle = font_color;
    context.fillText(players[1].cities[4], city_coordinates[country_focus].city_5_x + 10, city_coordinates[country_focus].city_5_y + 45);
  };
  
  city_5_gfx.src = "gfx/cities.png";  
  
  
  if (city_focus != 0) {
    var target = new Image();
    target.onload = function() {
      context.drawImage(target, 0, 0, 16, 16, city_coordinates[country_focus]['city_' + city_focus +'_x'], city_coordinates[country_focus]['city_' + city_focus +'_y'], 32, 32);
    }
    target.src = "gfx/target.png";  
  }
  
}


enable_leds = function(inventory, context) {

  for (var id in inventory) {
    if (inventory[id] > 0) {
      lit_led(id, context);
    }
  }
}

lit_led = function(id, context) {
  var led_gfx = new Image();
  led_gfx.onload = function() {
    context.drawImage(led_gfx, terminal_led_position[id].x, terminal_led_position[id].y, 10, 10);
  }
  led_gfx.src = 'gfx/led.bmp';
}

pupulate_cities = function() {
  var cities_population = [0,0,0,0,0];
  for (i = 0; i < 128; i++) {
     cities_population[Math.floor((Math.random()*5))]++;
  }
  return cities_population;
}

// send our action to server
init_world_war = function() {
    
}


clear_terminal = function() {
  clearInterval(leaders_sprite_interval);
}

/* click functions*/

click_ml_10 = function() {
  $('#sfx_fanfare').trigger("play");
  myAction = "ML_10";
}

click_ml_20 = function() {
  $('#sfx_fanfare').trigger("play");
  myAction = "ML_20";
}

click_ml_50 = function() {
  $('#sfx_fanfare').trigger("play");
  myAction = "ML_50";
}

click_ml_100 = function() {
  $('#sfx_fanfare').trigger("play");
  myAction = "ML_100";
}

click_wh_10 = function() {
  $('#sfx_fanfare').trigger("play");
  myAction = "WH_10";
}

click_wh_20 = function() {
  $('#sfx_fanfare').trigger("play");
  myAction = "WH_20";
}

click_wh_50 = function() {
  $('#sfx_fanfare').trigger("play");
  myAction = "WH_50";
}

click_wh_100 = function() {
  $('#sfx_fanfare').trigger("play");
  myAction = "WH_100";
}


click_bmbr_np1 = function() {
  $('#sfx_engine').trigger("play");
  myAction = "BMBR_NP1";
}

click_bmbr_gr2 = function() {
  $('#sfx_engine').trigger("play");
  myAction = "BMBR_GR2";
}

click_dfnce_lnds = function() {
  $('#sfx_dish').trigger("play");
  myAction = "DFNCE_LNDS";
}

click_dfnce_mage = function() {
  $('#sfx_dish').trigger("play");
  myAction = "DFNCE_MEGA";
}

click_propaganda = function() {
  $('#sfx_radio').trigger("play");
  myAction = "PROPAGANDA";
}

click_factory = function() {
  $('#sfx_build').trigger("play");
  myAction = "FACTORY";
}

click_player_space_1 = function() {
  layer_world.markRectDamaged(new CanvasLayers.Rectangle(0, 0, 640, 480));
  if (country_focus == 1){
    country_focus = 0;
  }
  else {
    country_focus = 1;
  }
  container.redraw();
}

click_player_space_2 = function() {
  layer_world.markRectDamaged(new CanvasLayers.Rectangle(0, 0, 640, 480));
  if (country_focus == 2){
    country_focus = 0;
  }
  else {
    country_focus = 2;
  }
  container.redraw();
}

click_player_space_3 = function() {
  layer_world.markRectDamaged(new CanvasLayers.Rectangle(0, 0, 640, 480));
  if (country_focus == 3){
    country_focus = 0;
  }
  else {
    country_focus = 3;
  }
  container.redraw();
}

click_player_space_4 = function() {
  layer_world.markRectDamaged(new CanvasLayers.Rectangle(0, 0, 640, 480));
  if (country_focus == 4){
    country_focus = 0;
  }
  else {
    country_focus = 4;
  }
  container.redraw();
}

click_ready = function() {
  console.log("WE ARE READY");  
  clear_terminal();
  doTurn();
}



click_city_1 = function() {
  layer_world.markRectDamaged(new CanvasLayers.Rectangle(0, 0, 640, 480));
  console.log('City 1 clicked!')
  city_focus = 1;
  container.redraw();
}

click_city_2 = function() {
  layer_world.markRectDamaged(new CanvasLayers.Rectangle(0, 0, 640, 480));
  console.log('City 2 clicked!')
  city_focus = 2;
  container.redraw();
}

click_city_3 = function() {
  layer_world.markRectDamaged(new CanvasLayers.Rectangle(0, 0, 640, 480));
  console.log('City 3 clicked!')
  city_focus = 3;
  container.redraw();
}

click_city_4 = function() {
  layer_world.markRectDamaged(new CanvasLayers.Rectangle(0, 0, 640, 480));
  console.log('City 4 clicked!')
  city_focus = 4;
  container.redraw();
}

click_city_5 = function() {
  layer_world.markRectDamaged(new CanvasLayers.Rectangle(0, 0, 640, 480));
  console.log('City 5 clicked!')
  city_focus = 5;
  container.redraw();
}