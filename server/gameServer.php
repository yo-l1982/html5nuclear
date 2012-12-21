<?php

/* functions FROM netnuclear */
/*
  void read_buffered_packets();
  int get_packet(struct socket_node *socket, char *data, int size);
  void do_packet_version(struct packet_version *packet);
  void do_packet_welcome(struct packet_welcome *packet);
  void do_packet_disconnect(struct packet_disconnect *packet);
  void do_packet_player(struct packet_player *packet);
  void do_packet_name(struct socket_node *socket, struct packet_name *packet);
  void do_packet_message(struct socket_node *socket, struct packet_message *packet);
  void do_packet_start();
  void do_packet_action(struct socket_node *socket, struct packet_action *packet);
  void do_packet_result(struct packet_result *packet);
  void send_player_info(struct socket_node *socket, int player, int announce);
  void send_action(struct socket_node *socket, int player, int turn);
 */

class gameServer {

    static private $instance;
    static private $games; // array containing all rooms
    static private $server; // instance to the server
    static private $weapons = array(
	1 => 'ML_10',
	2 => 'ML_20',
	3 => 'ML_50',
	4 => 'ML_100',
	5 => 'WH_10',
	6 => 'WH_20',
	7 => 'WH_50',
	8 => 'WH_100',
	9 => 'BMBR_NP1',
	10 => 'BMBR_GR2',
	11 => 'DFNCE_LNDS',
	12 => 'DFNCE_MEGA'
    );
    // Weapon damage
    static private $weaponDamage = array(
	'WH_10' => array('min' => 2, 'max' => 12), // 10 mt
	'WH_20' => array('min' => 5, 'max' => 19), // 20 mt
	'WH_50' => array('min' => 10, 'max' => 24), // 50 mt
	'WH_100' => array('min' => 25, 'max' => 36), // 100 mt
    );
    static private $citySize = array(
	'min' => 10,
	'max' => 35
    );
    // City size
    // 
    private static $startWeapons = array(
	'ML_10' => 1, // 1 10 mt missile
	'WH_10' => 1, // 1 10 mt warhead
	'DFNCE_LNDS' => 1 // 1 lnds 
    );

    /**
     * Create cities and start weapons for all players
     * 
     * @param type $gameId 
     */
    static private function setupGame($gameId) {
	foreach (self::$games[$gameId]['players'] as $playerId => $player) {

	    // First create cities
	    for ($x = 1; $x < 6; $x++) {
		self::$games[$gameId]['players'][$playerId]['cities'][$x] = rand(self::$citySize['min'], self::$citySize['max']);
	    }

	    // Set default weapons, set 0 to rest to avoid php warnings.
	    foreach (self::$weapons as $weaponKey => $weapon) {
		if (isset(self::$startWeapons[$weapon]))
		    self::$games[$gameId]['players'][$playerId]['inventory'][$weapon] = self::$startWeapons[$weapon];
		else
		    self::$games[$gameId]['players'][$playerId]['inventory'][$weapon] = 0;
	    }
	    
	    self::$games[$gameId]['players'][$playerId]['inventory']['readyWeapon'] = 0; // No weapons are ready at start.
	    
	    // Create random leaders, this should probably be sent to us from client but we do like this for now.
	    self::$games[$gameId]['players'][$playerId]['leader'] = rand(1, 9);
	}
	echo "finished set up game $gameId\r\n";
    }

    /**
     * Creates game array and inserts into the global array of games
     * 
     * @param type $playerName
     * @param type $clientId
     * @return type 
     */
    static public function createGame($playerName, $clientId) {
	$gameId = count(self::$games) + 1;
	$playerId = 1;
	$game = array(
	    'gameId' => $gameId,
	    'gamename' => $playerName . "s game",
	    'players' => array(
		$playerId => array(
		    'playerName' => $playerName,
		    'clientId' => $clientId,
		    'playerId' => $playerId
		)
	    ),
	    'state' => 'pregame'
	);

	self::$games[$gameId] = $game;
	echo "Created game with id: $gameId. Total number of games: " . count(self::$games) . "\r\n";

	self::$games[$gameId]['playerCount'] = count(self::$games[$gameId]['players']);

	return $gameId;
    }

    /**
     * Add player to a game. Called in response to client "join" packet.
     * 
     * @param type $playerName
     * @param type $gameId
     * @param type $clientId
     * @return boolean 
     */
    static public function joinGame($playerName, $gameId, $clientId) {

	if (count(self::$games[$gameId]['players']) >= 5) {
	    echo "Player $clientId tried to join game $gameId but it was full\r\n";
	    return false;
	}

	echo "New player: $playerName is joining game: $gameId\r\n";

	$playerId = count(self::$games[$gameId]['players']) + 1;

	self::$games[$gameId]['players'][$playerId] = array(
	    'playerName' => $playerName,
	    'clientId' => $clientId,
	    'playerId' => $playerId
	);

	self::$games[$gameId]['playerCount'] = count(self::$games[$gameId]['players']);

	return $playerId;
    }

    /**
     * Unset player from game if he leaves.
     * Since this is called from server when socks server looses connection, we only know client id so find game id where the 
     * player is located.
     * 
     * @param type $clientId
     * @return type 
     */
    static public function leaveGame($clientId) {
	if (!isset($clientId))
	    return;

	if (count(self::$games) > 0) {
	    // Loop through all games and find where the clientId is 
	    foreach (self::$games as $gameKey => &$game) {
		foreach ($game['players'] as $playerKey => $player) {
		    if ($player['clientId'] == $clientId) {
			echo "Player: $clientId left game " . $game['gameId'] . "\r\n";
			unset(self::$games[$gameKey]['players'][$playerKey]);
			self::$games[$gameKey]['playerCount'] = count(self::$games[$gameKey]['players']);
		    }
		}
	    }
	}
    }

    /**
     * Broadcast a message to all players in a game.
     * 
     * @param type $gameId
     * @param type $message 
     */
    static public function broadcastGameMessage($gameId, $message) {
	echo "Should broadcase to game: $gameId, " . print_R($message, 1);
	foreach (self::$games[$gameId]['players'] as $player) {
	    self::$server->wsSend($player['clientId'], $message);
	}
    }

    /**
     * Called when a client sends "start game". 
     * Sets state to ingame, create basic game init and sends "turn" message
     * 
     * @param type $gameId
     * @return boolean 
     */
    static public function startGame($gameId) {

	if (!isset(self::$games[$gameId])) {
	    echo "Invalid gameid on startGame: $gameId\r\n";
	    return false;
	}
	self::setupGame($gameId);

	self::$games[$gameId]['state'] = "ingame";

	// send cities and items to clients
	self::broadcastGameMessage($gameId, self::createMessage('rcv-turn', self::$games[$gameId]['players']));
    }

    /**
     * Handle a player action. 
     * Stores the action in game array for the player.
     * 
     * @param type $playerId
     * @param type $message 
     */
    static public function playerAction($clientId, $message) {
	$gameId = $message[1];
	$playerId = $message[2];
	$action = $message[3];
	$targetPlayer = $message[4];
	$targetCity = $message[4];
	echo "Should store player $playerId, action $action for game, $gameId\r\n";

	self::$games[$gameId]['players'][$playerId]['actions'] = array(
	    'action' => $action,
	    'targetPlayer' => $targetPlayer,
	    'targetCity' => $targetCity,
	);

	$readyPlayers = 0;

	// If all players have completed their actions, then doGameTurn
	foreach (self::$games[$gameId]['players'] as $player) {
	    if (isset($player['actions']))
		$readyPlayers++;
	}

	echo "$readyPlayers of " . count(self::$games[$gameId]['players']) . " are ready in game $gameId\r\n";

	if ($readyPlayers == count(self::$games[$gameId]['players'])) {
	    self::doGameTurn($gameId);
	}
    }

    /**
     * Handles "factory" action from a client. Randomize what is to be build for that player
     * 
     * @param type $gameId
     * @param type $playerId 
     */
    static private function doFactory($gameId, $playerId) {
	$maxItems = rand(3, 4); // Det skall byggas rand(3,4) vapen
	$toBuild = array();

	// Loop through the number of weapons we should give player
	for ($x = 0; $x < $maxItems; $x++) {
	    $weapon = rand(1, count(self::$weapons));
	    // Inga dubletter 
	    while (in_array($weapon, $toBuild)) {
		$weapon = rand(1, count(self::$weapons));
	    }
	    $toBuild[$x] = $weapon;
	    $amount = rand(1, 3);
	    self::addTelegraphText($gameId, $playerId, "You build $amount of $weapon" );
	    
	    // Här skall vi inte ha dubleter på randomizade vapen
	    // @todo alla vapen skall inte ha lika random + chans. Småvapen skall ha 1-3, stora vapen 1-2
	    self::$games[$gameId]['players'][$playerId]['inventory'][self::$weapons[$weapon]] += $amount;
	}
    }

    /**
     * Returns the numerical index for the weapon name
     * @param type $weaponName 
     */
    private static function getWeaponIndex($weaponName) {
	echo "should find index for $weaponName\r\n";
	for ($x = 1; $x < count(self::$weapons); $x++) {
	    if (self::$weapons[$x] == $weaponName)
		return $x;
	}
	die("BAD ERROR, BAD, BAD ERROR! Weaponname dont exist!");
	return false;
    }

    /**
     * Create the outcome of this turn
     * 
     * @param type $gameId 
     */
    static private function doGameTurn($gameId) {
	echo "Starting game turn for game: $gameId\r\n";
	foreach (self::$games[$gameId]['players'] as $playerId => $player) {
	    echo "Doing action {$player['actions']['action']} for player $playerId\r\n";
	    switch ($player['actions']['action']) {
		case "FACTORY":
		    self::doFactory($gameId, $playerId);
		    break;
		case "PROPAGANDA":
		    break;
		case "DFNCE_MEGA":
		    self::doDefence($gameId, $playerId, $player['actions']['action'] );		    
		    break;
		case "DFNCE_LNDS":
		    self::doDefence($gameId, $playerId, $player['actions']['action'] );
		    break;
		case "BMBR_GR2":
		    self::doDamage($gameId, $playerId, $player['actions']['targetPlayer'], $player['actions']['targetCity'], $player['actions']['action']);
		    break;
		case "BMBR_NP1":
		    self::doDamage($gameId, $playerId, $player['actions']['targetPlayer'], $player['actions']['targetCity'], $player['actions']['action']);
		    break;
		case "WH_100":
		    self::doDamage($gameId, $playerId, $player['actions']['targetPlayer'], $player['actions']['targetCity'], $player['actions']['action']);
		break;
		case "WH_50":
		    self::doDamage($gameId, $playerId, $player['actions']['targetPlayer'], $player['actions']['targetCity'], $player['actions']['action']);
		break;
		case "WH_20":
		    self::doDamage($gameId, $playerId, $player['actions']['targetPlayer'], $player['actions']['targetCity'], $player['actions']['action']);
		break;
		case "WH_10":
		    self::doDamage($gameId, $playerId, $player['actions']['targetPlayer'], $player['actions']['targetCity'], $player['actions']['action']);
		break;
		case "ML_100":
		    self::readyWeapon( $gameId, $playerId, 'ML_100' );
		break;
		case "ML_50":
		    self::readyWeapon( $gameId, $playerId, 'ML_50' );
		break;
		case "ML_20":
		    self::readyWeapon( $gameId, $playerId, 'ML_20' );
		break;
		case "ML_10":
		    self::readyWeapon( $gameId, $playerId, 'ML_10' );
		break;
		default:
		    echo "Unsupported action by player: $playerId!\r\n";
		break;
	    }
	}

	// Here turn is finished and we send new game data to all players

	self::broadcastGameMessage($gameId, self::createMessage('rcv-turn', self::$games[$gameId]['players']));
	
	self::endTurn($gameId);
    }
    
    /**
     * Append a text string to client telegraph text
     * 
     * @param type $gameId
     * @param type $playerId
     * @param type $text 
     */
    static public function addTelegraphText( $gameId, $playerId, $text ){
	self::$games[$gameId]['players'][$playerId]['telegraph'][] = $text;
    }

    /**
     * Steals population from an enemy.
     * 
     * @param type $gameId
     * @param type $playerId
     * @param type $targetPlayerId
     * @param type $targetCityId 
     */
    static private function doPropaganda( $gameId, $playerId, $targetPlayerId, $targetCityId ) {
	$peopleToSteal = rand(1,10);
	
	self::$games[$gameId]['players'][$targetPlayerId]['cities'][$targetCityId] -= $peopleToSteal;
	self::$games[$gameId]['players'][$playerId]['cities'][rand(1,5)] += $peopleToSteal;
	self::addTelegraphText( $gameId, $playerId, "$peopleToSteal has desterted from " . self::$games[$gameId]['players'][$targetPlayerId]['playerName'] . " to you" );
	self::addTelegraphText( $gameId, $targetPlayerId, "$peopleToSteal has desterted from you to " . self::$games[$gameId]['players'][$targetPlayerId]['playerName'] );
    }

    /**
     * The only thing i can remember i need to do is to remove defensive system.
     * This is done AFTER the outcome of the turn has been sent to clients.
     * 
     * @param type $gameId 
     */
    static private function endTurn( $gameId ) {
	foreach(self::$games[$gameId]['players'] as $playerKey => $player ) {
	    self::$games[$gameId]['players'][$playerKey]['defence'] = 0; // Reset player defence
	    self::$games[$gameId]['players'][$playerKey]['telegraph'] = "";
	    unset( self::$games[$gameId]['players'][$playerKey]['actions'] );
	}
    }
    
    /**
     * Sets up defence for player.
     * 
     * @param type $gameId
     * @param type $playerId
     * @param type $defence 
     */
    private static function doDefence( $gameId, $playerId, $defence ) {
	if( self::$games[$gameId]['players'][$playerId]['inventory'][$defence] >= 0 ) {
	    self::$games[$gameId]['players'][$playerId]['inventory'][$defence]--;
	    self::$games[$gameId]['players'][$playerId]['defense'] = $defence;
	    self::addTelegraphText($gameId, $playerId, "You deploy defence system $defence");
	} else {
	    // Player dont have in stock
	}
    }

    /**
     * Sets a weapon to "ready" for a player. Player can not launch warhead if weapon is not ready.
     * @param type $gameId
     * @param type $playerId
     * @param type $weapon 
     */
    private static function readyWeapon($gameId, $playerId, $weapon) {
	if(self::$games[$gameId]['players'][$playerId]['inventory'][$weapon]>0 ) {
	    self::$games[$gameId]['players'][$playerId]['inventory'][$weapon]--;
	    self::$games[$gameId]['players'][$playerId]['readyWeapon']['type'] = $weapon;
	    // Set capacity the player can deliver to opponent
	    if( $weapon == 'BMBR_NP1' ) {
		self::$games[$gameId]['players'][$playerId]['readyWeapon']['capacity'] = 50;
	    } elseif ( $weapon == 'BMBR_GR2') {
		self::$games[$gameId]['players'][$playerId]['readyWeapon']['capacity'] = 100;
	    } elseif( $weapon == 'ML_100' || $weapon == 'ML_50' || $weapon == 'ML_20' || $weapon == 'ML_10') {
		$megaTon = substr( $weapon, strlen( $weapon )-2 ); // How many megatons
		self::$games[$gameId]['players'][$playerId]['readyWeapon']['capacity'] = $megaTon;
	    }
	    self::addTelegraphText($gameId, $playerId, "You make $weapon ready for usage");
	} else {
	    // The player do not have this weapon in his inventory!
	}
    }
    
    /**
     * Does damage to a player. Also stores the amount of damage to return array.
     * 
     * @param type $gameId
     * @param type $targetPlayerId
     * @param type $cityId
     * @param type $$warheadId 
     */
    private static function doDamage($gameId, $playerId, $targetPlayerId, $cityId, $warheadId) {
	if( !isset( self::$games[$gameId]['players'][$playerId]['readyWeapon'] ) || self::$games[$gameId]['players'][$playerId]['readyWeapon'] == 0 ) return false; // No ready weapons
	if( self::$games[$gameId]['players'][$playerId]['inventory'][$warheadId] <= 0 ) {
	    echo "Player $playerId did not have $warheadId in inventory\r\n";
	    return false; // Check so player has in inventory
	}
	
	// Check so that the missile or plane has capacity.
	$megaTon = substr( $warheadId, strlen( $warheadId ) -2 );
	if(self::$games[$gameId]['players'][$playerId]['readyWeapon']['capacity'] < $megaTon) return false;
	
	self::$games[$gameId]['players'][$playerId]['readyWeapon']['capacity'] =- $megaTon;
	self::$games[$gameId]['players'][$playerId]['inventory'][$warheadId]--;

	$damage = rand(self::$weaponDamage[$warheadId]['min'], self::$weaponDamage[$warheadId]['max']);
	self::$games[$gameId]['players'][$playerId]['actions']['damage'] = $damage;
	self::$games[$gameId]['players'][$targetPlayerId]['cities'][self::$games[$gameId]['players'][$playerId]['actions']['targetCity']] -= $damage;
	
	if (self::$games[$gameId]['players'][$targetPlayerId]['cities'][self::$games[$gameId]['players'][$playerId]['actions']['targetCity']] <= 0) {
	    // City is destroyed. Maybe we dont need to do something.
	    #self::$games[ $gameId ][ 'players' ][ $targetPlayer ][ 'cities' ][ self::$games[ $gameId ][ 'players' ][ $playerId ][ 'actions' ][ 'targetCity' ] ] = "destroyed";
	}
	
	self::addTelegraphText($gameId, $playerId, "You killed $damage millions to player: ". self::$games[$gameId]['players'][$targetPlayerId]['playerName']);
		
	// Should not be cleared if the type is a bomber and has megaton left.
	if( (!self::$games[$gameId]['players'][$playerId]['readyWeapon']['type'] == 'BMBR_NP1' && 
	    !self::$games[$gameId]['players'][$playerId]['readyWeapon']['type'] == 'BMBR_GR2') ||
	    self::$games[$gameId]['players'][$playerId]['readyWeapon']['capacity'] <= 0 )
	{
	    self::$games[$gameId]['players'][$playerId]['readyWeapon'] = 0;    
	} else {
	    self::addTelegraphText($gameId, $playerId, "You killed $damage millions to player: ". self::$games[$gameId]['players'][$targetPlayerId]['playerName'] );
	}
	
	
    }

    /**
     * Handle incoming client messages, direct them to the right function.
     */
    static public function handleMessage($message, $clientId) {
	echo "Should handle message: $message for clientId: $clientId \r\n";
	$message = json_decode($message);
	switch ($message[0]) {

	    case "list": // Returns a list of all games
		return self::createMessage('rcv-list', self::$games);
		break;
	    case "newgame": // Creates a new game lobby
		$gameId = self::createGame($message[1], $clientId);
		return self::createMessage('rcv-joined', array('gameId' => $gameId, 'playerId' => 1));
		break;
	    case "status": // Returns the status for the game id supplied
		return self::createMessage('rcv-status', self::$games[$message[1]]);
		break;
	    case "join":
		$playerId = self::joinGame($message[2], $message[1], $clientId);
		if ($playerId !== false) {
		    // Send ok to client and return player id. I dont think we need to send its client id?
		    self::$server->wsSend($clientId, self::createMessage('rcv-joined', array('gameId' => $message[1],
				'playerId' => self::$games[$message[1]]['players'][$playerId]['playerId']))
		    );

		    // notify the rest
		    self::broadcastGameMessage($message[1], self::createMessage('rcv-status', self::$games[$message[1]]));
		} else {
		    echo "Game is full, rejecting player: {$message[2]} for game: {$message[1]}\r\n";
		    return self::createMessage('rcv-gamefull', 'game is full');
		}
		break;
	    case "start" : // Starts a game, sets it state to running.
		self::startGame($message[1]);
		break;
	    case "action" :
		self::playerAction($clientId, $message);
		break;
	    default:
		echo "Could not handle client message : {$message[0]}\r\n";
		break;
	}
    }

    /**
     * Clean up old lobbies 
     */
    static function cleanGames() {
	$cnt = 0;
	if (count(self::$games) < 1)
	    return;
	foreach (self::$games as $gameKey => $game) {
	    if (self::$games[$gameKey]['playerCount'] == 0) {
		unset(self::$games[$gameKey]);
		$cnt++;
	    }
	}
	echo "Cleaned $cnt games \r\n";
    }

    /**
     * Returns lobby
     * 
     * @return type 
     */
    static public function getGames() {
	return self::$games;
    }

    static public function createMessage($type, $data) {
	return json_encode(array('type' => $type, 'data' => $data));
    }

    /**
     * Singleton construct, not sure if needed
     * 
     * @return type 
     */
    private function __construct() {
	if (!isset(self::$instance))
	    self::$instance = new gameServer();
	return self::$instance;
    }

    static public function setServer(&$server) {
	self::$server = $server;
    }

}