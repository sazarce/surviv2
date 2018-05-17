var autoAim = function(game, variables) {

	var bullets = variables.bullets;
	var items = variables.items;
	var playerBarn = variables.playerBarn;

	if(!!!bullets || !!!items || !!! playerBarn) {
		console.log("Cannot init autoaim");
		return;
	}

	var options = {
		captureEnemyMode: false
	}

	var calculateRadianAngle = function(cx, cy, ex, ey) {
		var dy = ey - cy;
		var dx = ex - cx;
		var theta = Math.atan2(dy, dx); // range (-PI, PI]
		// theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
		// if (theta < 0) theta = 360 + theta; // range [0, 360)
		return theta;
	}

	var calculateDistance = function(cx, cy, ex, ey) {
		return Math.sqrt(Math.pow((cx - ex), 2) + Math.pow((cy - ey), 2));
	}

	var getSelfPos = function() {
		return game.scope.activePlayer.pos;
	}

	// todo: not detect on different levels
	var detectEnemies = function() {
		var result = [];
		if(!game.scope.playerBarn.playerInfo[game.scope.activeId]) return result;

		var selfTeamId = game.scope.playerBarn.playerInfo[game.scope.activeId].teamId;
		var selfId = game.scope.activeId;
		var objectIds = Object.keys(game.scope.objectCreator.idToObj);
		var playerIds = Object.keys(game.scope.playerBarn.playerInfo);

		for(var i = 0; i < playerIds.length; i++) {
			if( game.scope.objectCreator.idToObj[playerIds[i]] && 
				(!game.scope.objectCreator.idToObj[playerIds[i]].netData.dead) && 
				(!game.scope.objectCreator.idToObj[playerIds[i]].netData.downed) &&
				game.scope.playerBarn.playerInfo[playerIds[i]].teamId != selfTeamId) {
				if(playerIds[i] != selfId) {
					result[playerIds[i]] = game.scope.objectCreator.idToObj[playerIds[i]];
				}
			}
		}

		return result;
	}

	var getMinimalDistanceIndex = function(enemyDistances) {
		return enemyDistances.indexOf(Math.min.apply(null, enemyDistances));
	}

	var calculateTargetMousePosition = function(enemyPos, enemyPosTimestamp,  prevEnemyPos, prevEnemyPosTimestamp, distance) {
		var bulletSpeed = 0;
		var bulletApproachTime = Infinity;
		
		if(items[game.scope.activePlayer.weapType].bulletType) {
			bulletSpeed = bullets[items[game.scope.activePlayer.weapType].bulletType].speed;
		} else {
			bulletSpeed = 1000;
		};

		var selfPos = getSelfPos();

		var predictionEnemyPos = {
			x: enemyPos.x,
			y: enemyPos.y
		}
		var predictionEnemyDistance = calculateDistance(selfPos.x, selfPos.y, enemyPos.x, enemyPos.y);
		
		var enemySpeed = {
			x: (enemyPos.x - prevEnemyPos.x)/((enemyPosTimestamp - prevEnemyPosTimestamp + 1)/1000.0),
			y: (enemyPos.y - prevEnemyPos.y)/((enemyPosTimestamp - prevEnemyPosTimestamp + 1)/1000.0)
		}

		for(var i = 0; i < 10; i++) {
			bulletApproachTime = predictionEnemyDistance/bulletSpeed;
			predictionEnemyPos = {
				x: enemyPos.x + enemySpeed.x * bulletApproachTime,
				y: enemyPos.y + enemySpeed.y * bulletApproachTime
			};
			predictionEnemyDistance = calculateDistance(selfPos.x, selfPos.y, predictionEnemyPos.x, predictionEnemyPos.y);
		}

		var halfScreenWidth = game.scope.camera.screenWidth/2;
		var halfScreenHeight = game.scope.camera.screenHeight/2;

		var minScreenCircleRadius = halfScreenHeight > halfScreenWidth ? halfScreenWidth : halfScreenHeight;
		minScreenCircleRadius = Math.floor(minScreenCircleRadius - 1);		

		// todo: remove angles
		var predictionRadianAngle = calculateRadianAngle(selfPos.x, selfPos.y, predictionEnemyPos.x, predictionEnemyPos.y);

		return {
			x: halfScreenWidth + minScreenCircleRadius * Math.cos(predictionRadianAngle),
			y: halfScreenHeight - minScreenCircleRadius * Math.sin(predictionRadianAngle),
		}		
	}

	var getNewState = function() {
		var state = [];
		for(var i = 0; i < 4; i++) {
			state.push({
				playerId: null, // Enemy id
				distance: null,
				radianAngle: null,
				pos: {
					x: 0,
					y: 0
				},
				timestamp: 0,
				targetMousePosition: {
					x: 0,
					y: 0
				}
			});
		}
		state.new = null;
		state.averageTargetMousePosition = null;
		return state;
	}

	var state = getNewState();
	var updateState = function(detectedEnemies) {
		var selfPos = getSelfPos();
		var enemyDistances = [];
		var enemyRadianAngles = [];
		var detectedEnemiesKeys = Object.keys(detectedEnemies);

		if(!detectedEnemiesKeys.length) {
			state.new = false;
			return;
		} else {
			state.new = true;
			if(options.captureEnemyMode) {				
				if(detectedEnemies[state[0].playerId]) {
					var enemyPos = detectedEnemies[state[0].playerId].netData.pos;
					var distance = calculateDistance(selfPos.x, selfPos.y, enemyPos.x, enemyPos.y);
					var radianAngle = calculateRadianAngle(selfPos.x, selfPos.y, enemyPos.x, enemyPos.y);

					state.unshift({
						playerId: detectedEnemies[state[0].playerId],
						distance: distance,
						radianAngle: radianAngle,
						pos: enemyPos,
						timestamp: Date.now(),
					});
					state.pop();
					state[0].targetMousePosition = calculateTargetMousePosition(state[0].pos, state[0].timestamp, state[1].pos, state[1].timestamp, state.distance);
					state.averageTargetMousePosition = {
						x: 0,
						y: 0
					};

					for(var i = 0; i < state.length; i++) {
						state.averageTargetMousePosition.x += state[i].targetMousePosition.x;
						state.averageTargetMousePosition.y += state[i].targetMousePosition.y;
					}

					state.averageTargetMousePosition.x /= state.length;
					state.averageTargetMousePosition.y /= state.length;

					return;
				}
			}

			for(var i = 0; i < detectedEnemiesKeys.length; i++) {
				var enemyPos = detectedEnemies[detectedEnemiesKeys[i]].netData.pos;
				var distance = Math.sqrt(Math.pow(Math.abs(selfPos.x - enemyPos.x), 2) + Math.pow(Math.abs(selfPos.y - enemyPos.y), 2));
				var radianAngle = calculateRadianAngle(selfPos.x, selfPos.y, enemyPos.x, enemyPos.y);

				enemyDistances.push(distance);
				enemyRadianAngles.push(radianAngle);	
			}

			var minimalDistanceEnemyIndex = getMinimalDistanceIndex(enemyDistances);

			state.unshift({
				playerId: detectedEnemies[detectedEnemiesKeys[minimalDistanceEnemyIndex]].__id,
				distance: enemyDistances[minimalDistanceEnemyIndex],
				radianAngle: enemyRadianAngles[minimalDistanceEnemyIndex],
				pos: detectedEnemies[detectedEnemiesKeys[minimalDistanceEnemyIndex]].netData.pos,
				timestamp: Date.now(),
			});
			state.pop();
			state[0].targetMousePosition = calculateTargetMousePosition(state[0].pos, state[0].timestamp, state[1].pos, state[1].timestamp, state.distance);
			state.averageTargetMousePosition = {
				x: 0,
				y: 0
			};

			for(var i = 0; i < state.length; i++) {
				state.averageTargetMousePosition.x += state[i].targetMousePosition.x;
				state.averageTargetMousePosition.y += state[i].targetMousePosition.y;
			}

			state.averageTargetMousePosition.x /= state.length;
			state.averageTargetMousePosition.y /= state.length;
			
			return;
			// todo: check equals playerId in all items of array
		}
	}

	var defaultPlayerBarnRenderFunction = function(e) {};
	var playerBarnRenderContext = {};

	var defaultBOnMouseDown = function(event) {};
	var defaultBOnMouseMove = function(event) {};

	var mouseListener = {
		mousedown: function(event) {
			if(!event.button && state.new) {
				game.scope.input.mousePos = state.averageTargetMousePosition;
				// ???
				game.scope.input.mouseButtonOld = false;
				game.scope.input.mouseButton = true;
			} else {
				defaultBOnMouseDown(event);
			}
		},
		mousemove: function(event) {
			if(!state.new) {
				defaultBOnMouseMove(event);
			}
		}
	}

	var addMouseListener = function() {
		window.addEventListener("mousedown", mouseListener.mousedown);
		window.addEventListener("mousemove", mouseListener.mousemove);
	}

	var removeMouseListener = function() {
		window.removeEventListener("mousedown", mouseListener.mousedown);
		window.removeEventListener("mousemove", mouseListener.mousemove);
	}

	var spaceKeyListeners = {
		keydown: function(event) {
			if(event.which == 32) {
				game.scope.input.mouseButton = true;
			}
		},
		keyup: function(event) {
			if(event.which == 32) {
				game.scope.input.mouseButton = false;
			}
		}
	}

	var addSpaceKeyListener = function() {
		window.addEventListener("keydown", spaceKeyListeners.keydown);
		window.addEventListener("keyup", spaceKeyListeners.keyup);
	}

	var removeSpaceKeyListener = function() {
		window.removeEventListener("keydown", spaceKeyListeners.keydown);
		window.removeEventListener("keyup", spaceKeyListeners.keyup);
	}

	var oKeyListener = {
		keyup: function(event) {
			if(event.which == 79) {
				options.captureEnemyMode = !options.captureEnemyMode;
			}
		}
	}

	var addOKeyListener = function() {
		window.addEventListener("keyup", oKeyListener.keyup);
	}

	var removeOKeyListener = function() {
		window.removeEventListener("keyup", oKeyListener.keyup);
	}

	var bind = function() {
		defaultBOnMouseDown = game.scope.input.bOnMouseDown;
		defaultBOnMouseMove = game.scope.input.bOnMouseMove;

		defaultPlayerBarnRenderFunction = playerBarn.prototype.render;
		playerBarn.prototype.render = function(e) {
			playerBarnRenderContext = this;
			defaultPlayerBarnRenderFunction.call(playerBarnRenderContext, e);

			updateState(detectEnemies());
			if(state.new) {
				game.scope.input.mousePos = state.averageTargetMousePosition;
			}
		};

		window.removeEventListener("mousedown", game.scope.input.bOnMouseDown);
		window.removeEventListener("mousemove", game.scope.input.bOnMouseMove);

		addMouseListener();
		addSpaceKeyListener();
		addOKeyListener();
	}

	var unbind = function() {
		removeMouseListener();
		removeSpaceKeyListener();
		removeOKeyListener();

		window.addEventListener("mousedown", defaultBOnMouseDown);
		window.addEventListener("mousemove", defaultBOnMouseMove);

		playerBarn.prototype.render = defaultPlayerBarnRenderFunction;
		defaultPlayerBarnRenderFunction = function(e) {};
	}

	return {
		bind: bind,
		unbind: unbind
	}
}