var aimInit = function(exports, game) {

	if(!exports) return;
	
	// setInterval(function(){if(game.scope && game.scope.activePlayer){
	// 	console.log(game.scope);console.log(exports);
	// }}, 2000);
	// todo: another getting algo
	function findVariable(name, exports) {
		var keys = Object.keys(exports);
		for(var i = 0; i < keys.length; i++) {
			if(exports[keys[i]].exports[name]) {
				return exports[keys[i]].exports[name];
			}
		}

		return null;
	};
	
	var interactionTypes = {
        Obstacle: 2,
        Loot: 3,
        // DeadBody: 5,
	};

	var pressF = function() {
		if(!game.scope.input.keys["70"]) {
			setTimeout(function() {
				game.scope.input.keys["70"] = true;
				setTimeout(function() {
					console.log("deletePressF");
					console.log(game.scope.input.keys["70"]);
					delete game.scope.input.keys["70"]}, 50);
			}, 50);
		}
	}

	emitActionCb = function() {
		if(interactionEmitter) {
			console.log(interactionEmitter);
			switch(interactionEmitter.__type) {
				case interactionTypes.Obstacle:
					if(interactionEmitter.hasOwnProperty('door')) {
						pressF();
					}
				break;
				case interactionTypes.Loot:
					pickupLoot();
				break;
			}
		}
	};

	// Bullets width
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
	// var scopeZoomRadius = findVariable("scopeZoomRadius", exports);
	// if(scopeZoomRadius) {
	// 	scopeZoomRadius["1xscope"] = 68;
	// 	scopeZoomRadius["2xscope"] = 68;
	// 	scopeZoomRadius["4xscope"] = 68;
	// } else {
	// 	console.log("Scope zoom and radius not patched");
	// }

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

	var calculateRadianAngle = function(cx, cy, ex, ey) {
		var dy = ey - cy;
		var dx = ex - cx;
		var theta = Math.atan2(dy, dx); // range (-PI, PI]
		// theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
		// if (theta < 0) theta = 360 + theta; // range [0, 360)
		return theta;
	}

	var getSelfPos = function() {
		if(game.scope && game.scope.activePlayer) {
			return game.scope.activePlayer.pos;
		} else {
			return null;
		}
	}

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
	var calculateTargetMousePosition = function(radianAngle, prevRadianAngle, distance) {
		var halfScreenWidth = game.scope.camera.screenWidth/2;
		var halfScreenHeight = game.scope.camera.screenHeight/2;

		var minScreenCircleRadius = halfScreenHeight > halfScreenWidth ? halfScreenWidth : halfScreenHeight;
		minScreenCircleRadius = Math.floor(minScreenCircleRadius - 1);

		if(bullets["bullet_" + game.scope.activePlayer.weapType]) {		
			// var bulletSpeedCoeff = bulletSpeedFactor/bullets["bullet_" + game.scope.activePlayer.weapType].speed;
			// var polyDividerFactor = gunCorrectionFactors["bullet_" + game.scope.activePlayer.weapType];
			var polyDividerFactor = gunCorrectionFactors.default.polyDividerFactor;
			var bulletSpeedCoeff = gunCorrectionFactors.default.bulletSpeedFactor/bullets["bullet_" + game.scope.activePlayer.weapType].speed;
			var polyCoeffs = gunCorrectionFactors.default.polyCoeffs;
		} else {
			var polyDividerFactor = gunCorrectionFactors.default.polyDividerFactor;
			var bulletSpeedCoeff = 1;
			var polyCoeffs = gunCorrectionFactors.default.polyCoeffs;
		}

		return {
			x: halfScreenWidth + minScreenCircleRadius * Math.cos(radianAngle + bulletSpeedCoeff * calculateHornerPoly(distance, polyCoeffs)/polyDividerFactor * (radianAngle - prevRadianAngle)),
			y: halfScreenHeight - minScreenCircleRadius * Math.sin(radianAngle + bulletSpeedCoeff * calculateHornerPoly(distance, polyCoeffs)/polyDividerFactor * (radianAngle - prevRadianAngle)),
		}
	}

	var state = {
		playerId: 0,
		distance: Infinity,
		radianAngle: 0,
		prevRadianAngle: 0,
		new: false,
		timestamp: Date.now(),
		targetMousePosition: {
			x: 0,
			y: 0,
		},
		captureEnemyMode: false
	}
	var updateState = function(detectedEnemies) {
		var selfPos = getSelfPos();
		var enemyDistances = [];
		var enemyRadianAngles = [];
		var detectedEnemiesKeys = Object.keys(detectedEnemies);

		if(!detectedEnemiesKeys.length) {
			state.new = false;
			state.timestamp = Date.now();	
			return;
		} else {
			if(state.captureEnemyMode) {				
				if(detectedEnemies[state.playerId]) {
					var enemyPos = detectedEnemies[state.playerId].netData.pos;

					var distance = Math.sqrt(Math.pow(Math.abs(selfPos.x - enemyPos.x), 2) + Math.pow(Math.abs(selfPos.y - enemyPos.y), 2));
					var radianAngle = calculateRadianAngle(selfPos.x, selfPos.y, enemyPos.x, enemyPos.y);

					state.distance = Math.sqrt(Math.pow(Math.abs(selfPos.x - enemyPos.x), 2) + Math.pow(Math.abs(selfPos.y - enemyPos.y), 2));
					state.prevRadianAngle = state.radianAngle;
					state.radianAngle = radianAngle;
					state.new = true;
					state.timestamp = Date.now();
					state.targetMousePosition = calculateTargetMousePosition(state.radianAngle, state.prevRadianAngle, state.distance);

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
				state.new = true;
				state.timestamp = Date.now();
				state.targetMousePosition = calculateTargetMousePosition(state.radianAngle, state.prevRadianAngle, state.distance);
			} else {
				state.distance = enemyDistances[minimalDistanceEnemyIndex];
				state.prevRadianAngle = state.radianAngle;
				state.radianAngle = enemyRadianAngles[minimalDistanceEnemyIndex];
				state.new = true;
				state.timestamp = Date.now();
				state.targetMousePosition = calculateTargetMousePosition(state.radianAngle, state.prevRadianAngle, state.distance);
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
		}
	}

	var gameOver = function() {
		return !!game.scope.gameOver;
	}

	var iterate = function() {
		if(!gameOver()) {
			updateState(detectEnemies());	
		} else {
			disableCheat();
		}
		
		if(state.new) {
			game.scope.input.mousePos = state.targetMousePosition;
		}
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

	var timer = null;
	function ticker() {
		timer = setTimeout(ticker, 10);
		iterate();
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

	var bindCheatListeners = function() {
		defaultBOnMouseDown = game.scope.input.bOnMouseDown;
		defaultBOnMouseMove = game.scope.input.bOnMouseMove;

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

			if(timer) {
				clearTimeout(timer);
				timer = null;
			}

			ticker();
		}
	}
  
	function disableCheat() {
		if(timer) {
			clearTimeout(timer);
			timer = null;
		}

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
