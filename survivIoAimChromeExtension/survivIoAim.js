var aimInit = function(game, exports, interactionEmitter, emitActionCb) {

	if(!exports) return;
	emitActionCb.scope = function() {};

	// setInterval(function(){if(game.scope && game.scope.activePlayer){
	// 	console.log(game.scope);console.log(exports);
	// }}, 2000);

	var interactionTypes = {
        Obstacle: 2,
        Loot: 3,
        // DeadBody: 5,
	};

	function findVariable(name, exports) {
		var keys = Object.keys(exports);
		for(var i = 0; i < keys.length; i++) {
			if(exports[keys[i]].exports[name]) {
				return exports[keys[i]].exports[name];
			}
		}

		return null;
	};

	var pressF = function() {
		if(!game.scope.input.keys["70"]) {
			setTimeout(function() {
				game.scope.input.keys["70"] = true;
				setTimeout(function() {
					delete game.scope.input.keys["70"]
				}, 50);
			}, 50);
		}
	}

	// Auto-opening doors
	emitActionCb.scope = function() {
		if(interactionEmitter.scope) {
			switch(interactionEmitter.scope.__type) {
				case interactionTypes.Obstacle:
					if(interactionEmitter.scope.hasOwnProperty('door')) {
						pressF();
					}
				break;
			}
		}
	};

	// Bullets properties
	var bullets = findVariable("bullets", exports);

	// Gernage size and color
	var items = findVariable("items", exports);
	if(items) {
		items.frag.worldImg.tint = 16711680;
		items.frag.worldImg.scale = 0.31;
	} else {
		console.log("Gernage size and color not patched");
	}

	var bagSizes = findVariable("bagSizes", exports);
	if(!bagSizes) {
		bagSizes = {
        	"9mm": 			[120, 240, 330, 420],
            "762mm": 		[90, 180, 240, 300],
            "556mm": 		[90, 180, 240, 300],
            "12gauge": 		[15, 30, 60, 90],
            "50AE": 		[42, 84, 126, 168],
            "frag": 		[3, 6, 9, 12],
            "smoke": 		[3, 6, 9, 12],
            "bandage": 		[5, 10, 15, 30],
            "healthkit": 	[1, 2, 3, 4],
            "soda": 		[2, 5, 10, 15],
            "painkiller": 	[1, 2, 3, 4]
        }
	}

	// Scope zoom radius
	var scopeZoomRadius = findVariable("scopeZoomRadius", exports);
	var setZoomRadius = function(radius) {
		if(scopeZoomRadius) {
			scopeZoomRadius["1xscope"] = radius;
			scopeZoomRadius["2xscope"] = radius;
			scopeZoomRadius["4xscope"] = radius;
			scopeZoomRadius["8xscope"] = radius;
			scopeZoomRadius["15xscope"] = radius;
		} else {
			console.log("Scope zoom and radius not patched");
		}
	};
	setZoomRadius(68);

	// Ceiling alpha
	var defsParticles = findVariable("Defs", exports);
	if(defsParticles) {
		Object.keys(defsParticles).forEach(function(key) {
			if(defsParticles[key].ceiling) {
				defsParticles[key].ceiling.imgs.forEach(function(item) {
					item.alpha = 0.5;
				});
			}
		});

		defsParticles["bush_01"].img.alpha = 0.5;
		defsParticles["bush_02"].img.alpha = 0.5;
		defsParticles["bush_03"].img.alpha = 0.5;

		defsParticles["tree_01"].img.alpha = 0.5;
		defsParticles["tree_02"].img.alpha = 0.5;
		
		defsParticles["table_01"].img.alpha = 0.5;
		defsParticles["table_02"].img.alpha = 0.5;
	} else {
		console.log("Ceiling alpha not patched")
	}

	var playerBarn = findVariable("PlayerBarn", exports);
	var lootBarn = findVariable("LootBarn", exports);

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
		if(game.scope && game.scope.activePlayer) {
			return game.scope.activePlayer.pos;
		} else {
			return null;
		}
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

	var calculateHornerPoly = function(distance, coeffs) {
		var result = distance * coeffs[coeffs.length - 1];

		for(var i = coeffs.length - 2; i > 0; i--) {
			result = distance * (coeffs[i] + result);
		}

		result += coeffs[0];
		return result;
	}

	var getMinimalDistanceIndex = function(enemyDistances) {
		return enemyDistances.indexOf(Math.min.apply(null, enemyDistances));
	}

	var gunCorrectionFactors = {
		default: {
			polyDividerFactor: 3,
			bulletSpeedFactor: 90,
			polyCoeffs: [ 0, 1, 1/100, 1/10000, 1/1000000, 1/100000000 ]
		}
	};

	var calculateTargetMousePosition = function(enemyPos, enemyPosTimestamp,  prevEnemyPos, prevEnemyPosTimestamp, distance) {
		var bulletSpeed = 0;
		var bulletApproachTime = Infinity;
		// Check if you not have a bullets
		
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
			// distance = predictionEnemyDistance; // cycle
		}

		var halfScreenWidth = game.scope.camera.screenWidth/2;
		var halfScreenHeight = game.scope.camera.screenHeight/2;

		var minScreenCircleRadius = halfScreenHeight > halfScreenWidth ? halfScreenWidth : halfScreenHeight;
		minScreenCircleRadius = Math.floor(minScreenCircleRadius - 1);		

		var predictionRadianAngle = calculateRadianAngle(selfPos.x, selfPos.y, predictionEnemyPos.x, predictionEnemyPos.y);

		return {
			x: halfScreenWidth + minScreenCircleRadius * Math.cos(predictionRadianAngle),
			y: halfScreenHeight - minScreenCircleRadius * Math.sin(predictionRadianAngle),
		}		
	}

	var getNewState = function() {
		var state = [];
		// for(var i = 0; i < )
		return {
			playerId: null, // Enemy id
			distance: null,
			radianAngle: null,
			prevRadianAngle: null,
			pos: null,
			prevPos: null,
			new: null,
			timestamp: null,
			prevTimestamp: null,
			targetMousePosition: null,
			captureEnemyMode: false
		}	
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
			if(state.captureEnemyMode) {				
				if(detectedEnemies[state.playerId]) {
					var enemyPos = detectedEnemies[state.playerId].netData.pos;
					var distance = calculateDistance(selfPos.x, selfPos.y, enemyPos.x, enemyPos.y);
					var radianAngle = calculateRadianAngle(selfPos.x, selfPos.y, enemyPos.x, enemyPos.y);

					if(state.new) {
						state.prevRadianAngle = state.radianAngle;
						state.prevPos = state.pos;
						state.prevTimestamp = state.timestamp;
						state.timestamp = Date.now();
					} else {
						state.prevRadianAngle = radianAngle;
						state.prevPos = enemyPos;
						state.timestamp = Date.now();
						state.prevTimestamp = state.timestamp;
					}

					state.new = true;
					state.distance = distance;
					state.radianAngle = radianAngle;
					state.pos = enemyPos;

					state.targetMousePosition = calculateTargetMousePosition(state.pos, state.timestamp, state.prevPos, state.prevTimestamp, state.distance);

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
			if(state.playerId != detectedEnemies[detectedEnemiesKeys[minimalDistanceEnemyIndex]].__id) {
				state.playerId = detectedEnemies[detectedEnemiesKeys[minimalDistanceEnemyIndex]].__id;
				state.distance = enemyDistances[minimalDistanceEnemyIndex];
				state.prevRadianAngle = enemyRadianAngles[minimalDistanceEnemyIndex];
				state.radianAngle = enemyRadianAngles[minimalDistanceEnemyIndex];
				state.prevPos = detectedEnemies[detectedEnemiesKeys[minimalDistanceEnemyIndex]].netData.pos;
				state.pos = detectedEnemies[detectedEnemiesKeys[minimalDistanceEnemyIndex]].netData.pos;
				state.new = true;
				state.timestamp = Date.now();
				state.prevTimestamp = state.timestamp;

				state.targetMousePosition = calculateTargetMousePosition(state.pos, state.timestamp, state.prevPos, state.prevTimestamp, state.distance);
			} else {
				state.distance = enemyDistances[minimalDistanceEnemyIndex];
				state.prevRadianAngle = state.radianAngle;
				state.radianAngle = enemyRadianAngles[minimalDistanceEnemyIndex];
				state.prevPos = state.pos;
				state.pos = detectedEnemies[detectedEnemiesKeys[minimalDistanceEnemyIndex]].netData.pos;
				state.new = true;
				state.prevTimestamp = state.timestamp;
				state.timestamp = Date.now();

				state.targetMousePosition = calculateTargetMousePosition(state.pos, state.timestamp, state.prevPos, state.prevTimestamp, state.distance);
			}
		}
	}

	var pickupLoot = function() {
		if(game.scope.lootBarn.closestLoot && game.scope.lootBarn.closestLoot.active) {
			if(	/mm/.test(game.scope.lootBarn.closestLoot.name) ||
				/12gauge/.test(game.scope.lootBarn.closestLoot.name) ||
				/50AE/.test(game.scope.lootBarn.closestLoot.name) ||
				/bandage/.test(game.scope.lootBarn.closestLoot.name) ||
				/soda/.test(game.scope.lootBarn.closestLoot.name) ||
				/painkiller/.test(game.scope.lootBarn.closestLoot.name) ||
				/smoke/.test(game.scope.lootBarn.closestLoot.name) ||
				/frag/.test(game.scope.lootBarn.closestLoot.name) ||
				/healthkit/.test(game.scope.lootBarn.closestLoot.name)) {

				var ownBagIndex = !!game.scope.activePlayer.netData.backpack ? parseInt(game.scope.activePlayer.netData.backpack.slice(-2), 10) : 0;
				var bagSize = bagSizes[game.scope.lootBarn.closestLoot.name][ownBagIndex];

				if(game.scope.activePlayer.localData.inventory[game.scope.lootBarn.closestLoot.name] === bagSize) {
					return;
				} else {
					pressF();
				}
			}

			if(/scope/.test(game.scope.lootBarn.closestLoot.name)) {
				var scopeLevel = parseInt(game.scope.lootBarn.closestLoot.name.slice(0, -6), 10);
				if(game.scope.activePlayer.localData.inventory[game.scope.lootBarn.closestLoot.name]) {
					return;
				} else {
					pressF();
				}
			};

			/*
				helmet01
				chest01
				backpack01
			*/
			if(	/helmet/.test(game.scope.lootBarn.closestLoot.name) ||
				/chest/.test(game.scope.lootBarn.closestLoot.name) ||
				/backpack/.test(game.scope.lootBarn.closestLoot.name)) {

				var lootname = game.scope.lootBarn.closestLoot.name.slice(0, -2);
				var lootLevel = parseInt(game.scope.lootBarn.closestLoot.name.slice(-2), 10);

				if(!game.scope.activePlayer.netData[lootname]) {
					pressF();
					return;
				};

				var ownLootLevel = parseInt(game.scope.activePlayer.netData[lootname].slice(-2), 10);
				if( ownLootLevel >= lootLevel) {
					return;
				} else {
					pressF();
				}
			};

			/*
				Guns
			*/
			if(game.scope.activePlayer.localData.weapons[0].name == "" ||
			   game.scope.activePlayer.localData.weapons[1].name == "") {
				pressF();
			}
		}
	}

	var gameOver = function() {
		return !!game.scope.gameOver;
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
	};

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
				state.captureEnemyMode = !state.captureEnemyMode;
			}
		}
	};

	var addOKeyListener = function() {
		window.addEventListener("keyup", oKeyListener.keyup);
	}

	var removeOKeyListener = function() {
		window.removeEventListener("keyup", oKeyListener.keyup);
	}

	var defaultBOnMouseDown = function(event) {};
	var defaultBOnMouseMove = function(event) {};

	var mouseListener = {
		mousedown: function(event) {
			if(!event.button && state.new) {
				game.scope.input.mousePos = state.targetMousePosition;
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
	};

	var defaultPlayerBarnRenderFunction = function(e) {};
	var defaultLootBarnUpdateFunction = function(e, t, a) {};

	var playerBarnRenderContext = {};
	var lootBarnUpdateContext = {};

	var bindCheatListeners = function() {
		defaultBOnMouseDown = game.scope.input.bOnMouseDown;
		defaultBOnMouseMove = game.scope.input.bOnMouseMove;

		defaultPlayerBarnRenderFunction = playerBarn.prototype.render;
		playerBarn.prototype.render = function(e) {
			renderContext = this;
			defaultPlayerBarnRenderFunction.call(renderContext, e);

			updateState(detectEnemies());
			if(state.new) {
				game.scope.input.mousePos = state.targetMousePosition;
			}
		};

		defaultLootBarnUpdateFunction = lootBarn.prototype.update
		lootBarn.prototype.update = function(e, t, a) {
			lootBarnUpdateContext = this;
			defaultLootBarnUpdateFunction.call(lootBarnUpdateContext, e, t, a);
			// console.log("Pickup loot");
			pickupLoot();
		}

		window.removeEventListener("mousedown", game.scope.input.bOnMouseDown);
		window.removeEventListener("mousemove", game.scope.input.bOnMouseMove);

		window.addEventListener("mousedown", mouseListener.mousedown);
		window.addEventListener("mousemove", mouseListener.mousemove);

		removeSpaceKeyListener();
		addSpaceKeyListener();

		removeOKeyListener();
		addOKeyListener();
	}

	var unbindCheatListeners = function() {
		playerBarn.prototype.render = defaultPlayerBarnRenderFunction; // is this works?
		defaultPlayerBarnRenderFunction = function(e) {};

		lootBarn.prototype.update = defaultLootBarnUpdateFunction;
		defaultLootBarnUpdateFunction = function(e, t, a) {};

		window.removeEventListener("mousedown", mouseListener.mousedown);
		window.removeEventListener("mousemove", mouseListener.mousemove);

		window.addEventListener("mousedown", defaultBOnMouseDown);
		window.addEventListener("mousemove", defaultBOnMouseMove);

		removeSpaceKeyListener();
		removeOKeyListener();
	}

	var cheatEnabled = false;
	function enableCheat() {
		if(game.scope && !gameOver()) {			
			bindCheatListeners();

			cheatEnabled = true;
		}
	}
  
	function disableCheat() {
		unbindCheatListeners();
		cheatEnabled = false;
		state.captureEnemyMode = false;
	}

	var openCheatMenu = function() {
		console.log("Cheat menu");
	}

	var zKeyListener = {
		keyup: function(event) {
			if(event.which == 90) {
				if(cheatEnabled) {
					disableCheat();
				} else {
					enableCheat();
				}
			}
		}
	}
	var addZKeyListener = function() {
		var zKeyDowned = false;
		var cheatMenuTimer = null;

		window.addEventListener("keyup", zKeyListener.keyup);
	}

	var removeZKeyListener = function() {
		var zKeyDowned = false;
		var cheatMenuTimer = null;

		window.removeEventListener("keyup", zKeyListener.keyup);
	}

	removeZKeyListener();
	addZKeyListener();
}
