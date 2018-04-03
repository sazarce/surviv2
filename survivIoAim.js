
var detectEnemies = function() {
	var result = [];
	if(!game.playerBarn.playerInfo[game.activeId]) return result;

	var selfTeamId = game.playerBarn.playerInfo[game.activeId].teamId;
	var selfId = game.activeId;
	var objectIds = Object.keys(game.objectCreator.idToObj);
	var playerIds = Object.keys(game.playerBarn.playerInfo);
	for(var i = 0; i < playerIds.length; i++) {
		if( game.objectCreator.idToObj[playerIds[i]] && 
			(!game.objectCreator.idToObj[playerIds[i]].netData.dead) && 
			game.playerBarn.playerInfo[playerIds[i]].teamId != selfTeamId) {
			if(playerIds[i] != selfId) {
				result.push(game.objectCreator.idToObj[playerIds[i]]);	
			}
		}
	}

	return result;
}

var getSelfPos = function() {
	if(game.activePlayer) {
		return game.activePlayer.pos
	} else {
		return false;
	}
}

var calculateRadianAngle = function(cx, cy, ex, ey) {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  // theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  // if (theta < 0) theta = 360 + theta; // range [0, 360)

  return theta;
}

var getMinimalDistanceIndex = function(enemyDistances) {
	return enemyDistances.indexOf(Math.min.apply(null, enemyDistances));
}

var iterate = function() {
	var enemyDistances = [];
	var enemyRadianAngles = [];
	var enemies = detectEnemies();
	var selfPos = getSelfPos();

	if(!selfPos) return;

	for(var i = 0; i < enemies.length; i++) {
		var enemyPos = enemies[i].pos;
		var distance = Math.sqrt(Math.pow(Math.abs(selfPos.x - enemyPos.x), 2) + Math.pow(Math.abs(selfPos.y - enemyPos.y), 2));
		var radianAngle = calculateRadianAngle(selfPos.x, selfPos.y, enemyPos.x, enemyPos.y);

		enemyDistances.push(distance);
		enemyRadianAngles.push(radianAngle);
	}

	var minimalDistanceIndex = getMinimalDistanceIndex(enemyDistances);

	// Delete self distance index
	// enemyDistances.splice(minimalDistanceIndex, 1);
	// enemyRadianAngles.splice(minimalDistanceIndex, 1);
	
	var minimalDistanceIndex = getMinimalDistanceIndex(enemyDistances);	
	var minimalDistance = enemyDistances[minimalDistanceIndex];
	var minimalDistanceRadianAngle = enemyRadianAngles[minimalDistanceIndex];

	var halfScreenWidth = game.camera.screenWidth/2;
	var halfScreenHeight = game.camera.screenHeight/2;

	var minScreenCircleRadius = halfScreenHeight > halfScreenWidth ? halfScreenWidth : halfScreenHeight;
	minScreenCircleRadius = Math.floor(minScreenCircleRadius - 1);

	var targetMousePosition = {};
	targetMousePosition.x = halfScreenWidth + minScreenCircleRadius * Math.cos(minimalDistanceRadianAngle);
	targetMousePosition.y = halfScreenHeight - minScreenCircleRadius * Math.sin(minimalDistanceRadianAngle);

	if(targetMousePosition.x && targetMousePosition.y) {
		game.input.mousePos = {
			x: targetMousePosition.x,
			y: targetMousePosition.y,
		}
	}

	if( !game.activePlayer.localData.inventory["4xscope"] &&
		!game.activePlayer.localData.inventory["8xscope"] &&
		!game.activePlayer.localData.inventory["15xscope"]) {

		game.activePlayer.localData.curScope = "4xscope"; //15xscope
		game.activePlayer.localData.inventory["4xscope"] = 1;	
	}
}

var addSpaceKeyListener = function() {
	document.addEventListener("keydown", function(event) {
		if(event.which == 32) {
			game.input.mouseButton = true;
		}
	});

	document.addEventListener("keyup", function(event) {
		if(event.which == 32) {
			game.input.mouseButton = false;
		}
	});
}

var removeSpaceKeyListener = function() {
	document.removeEventListener("keydown", function(event) {
		if(event.which == 32) {
			game.input.mouseButton = true;
		}
	});

	document.removeEventListener("keyup", function(event) {
		if(event.which == 32) {
			game.input.mouseButton = false;
		}
	});
}

var timer = {};
function ticker() {
	iterate();
	timer = setTimeout(ticker, 30);
}

function reload() {
	removeSpaceKeyListener();
	addSpaceKeyListener();

	if(timer) clearTimeout(timer);
	ticker();
}

function stop() {
	removeSpaceKeyListener();
	if(timer) clearTimeout(timer);
}