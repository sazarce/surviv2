
(function() {

	var bullets = {
		bullet_mp5: {
			speed: 85
		},
		bullet_ak47: {
			speed: 100
		},
		bullet_scar: {
			speed: 108
		},
		bullet_mosin: {
			speed: 178
		},
		bullet_m39: {
			speed: 125
		},
		bullet_m870: {
			speed: 66
		},
		bullet_mp220: {
			speed: 66
		},
		bullet_m9: {
			speed: 85
		},
		bullet_ot38: {
			speed: 112
		},
		bullet_mac10: {
			speed: 75
		},
		bullet_ump9: {
			speed: 100
		},
		bullet_dp28: {
			speed: 110
		},
		bullet_glock: {
			speed: 70
		},
		bullet_famas: {
			speed: 110
		},
		bullet_hk416: {
			speed: 105
		},
		bullet_mk12: {
			speed: 132
		},
		bullet_m249: {
			speed: 125
		},
		bullet_deagle: {
			speed: 112
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

	var getSelfPos = function() {
		if(game.activePlayer) {
			return game.activePlayer.pos
		} else {
			return false;
		}
	}

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
				(!game.objectCreator.idToObj[playerIds[i]].netData.downed) &&
				game.playerBarn.playerInfo[playerIds[i]].teamId != selfTeamId) {
				if(playerIds[i] != selfId) {
					result[playerIds[i]] = game.objectCreator.idToObj[playerIds[i]];
				}
			}
		}

		return result;
	}

	// six coeffs
	var a = [
		0,
		1,
		1/100,
		1/10000,
		1/1000000,
		1/100000000
	];
	var calculateHornerPoly = function(distance) {
		var result = distance * a[a.length - 1];

		for(var i = a.length - 2; i > 0; i--) {
			result = distance * (a[i] + result);
		}

		result += a[0];

		return result;
	}

	var getMinimalDistanceIndex = function(enemyDistances) {
		return enemyDistances.indexOf(Math.min.apply(null, enemyDistances));
	}

	var bulletCoeff = 1;
	var calculateTargetMousePosition = function(radianAngle, prevRadianAngle, distance) {
		var halfScreenWidth = game.camera.screenWidth/2;
		var halfScreenHeight = game.camera.screenHeight/2;

		var minScreenCircleRadius = halfScreenHeight > halfScreenWidth ? halfScreenWidth : halfScreenHeight;
		minScreenCircleRadius = Math.floor(minScreenCircleRadius - 1);

		if(bullets["bullet_" + game.activePlayer.weapType]) {
			bulletCoeff = 90/bullets["bullet_" + game.activePlayer.weapType].speed; // 50
		} else {
			bulletCoeff = 1;
		}

		return {
			x: halfScreenWidth + minScreenCircleRadius * Math.cos(radianAngle + bulletCoeff * calculateHornerPoly(distance)/3.5 * (radianAngle - prevRadianAngle)),
			y: halfScreenHeight - minScreenCircleRadius * Math.sin(radianAngle + bulletCoeff * calculateHornerPoly(distance)/3.5 * (radianAngle - prevRadianAngle)),
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
		}
	}
	var captureEnemyMode = false;
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
			if(captureEnemyMode) {				
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
				state = {
					playerId: detectedEnemies[detectedEnemiesKeys[minimalDistanceEnemyIndex]].__id,
					distance: enemyDistances[minimalDistanceEnemyIndex],
					radianAngle: enemyRadianAngles[minimalDistanceEnemyIndex],
					prevRadianAngle: enemyRadianAngles[minimalDistanceEnemyIndex],
					new: true,
					timestamp: Date.now(),
				}
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

	var iterate = function() {
		// check if we in game
		if(game.gameOver) {
			disableCheat();
			return;
		}

		updateState(detectEnemies());
		
		if(state.new) {
			game.input.mousePos = state.targetMousePosition;
		}

		// No longer works
		if( !game.activePlayer.localData.inventory["8xscope"] &&
			!game.activePlayer.localData.inventory["15xscope"]) {

			game.activePlayer.localData.curScope = "8xscope"; //15xscope
			game.activePlayer.localData.inventory["8xscope"] = 1;	
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

	var addOKeyListener = function() {
		document.addEventListener("keyup", function(event) {
			if(event.which == 79) {
				captureEnemyMode = !captureEnemyMode;
			}
		});
	}

	var removeOKeyListener = function() {
		document.removeEventListener("keyup", function(event) {
			if(event.which == 79) {
				captureEnemyMode = !captureEnemyMode;
			}
		});
	}

	var timer = null;
	function ticker() {
		timer = setTimeout(ticker, 10);
		iterate();
	}	

	var defaultBOnMouseDown = function(event) {};
	var defaultBOnMouseMove = function(event) {};

	var bindCheatListeners = function() {
		defaultBOnMouseDown = game.input.bOnMouseDown;
		defaultBOnMouseMove = game.input.bOnMouseMove;

		window.removeEventListener("mousedown", game.input.bOnMouseDown);
		window.removeEventListener("mousemove", game.input.bOnMouseMove);

		window.addEventListener("mousedown", function(event) {
			if(!event.button && state.new) {
				game.input.mousePos = state.targetMousePosition;
				game.input.mouseButtonOld = false;
				game.input.mouseButton = true;
			} else {
				defaultBOnMouseDown(event);
			}
		});

		window.addEventListener("mousemove", function(event) {
			if(!state.new) {
				defaultBOnMouseMove(event);
			}
		});

		removeSpaceKeyListener();
		addSpaceKeyListener();

		removeOKeyListener();
		addOKeyListener();
	}

	var unbindCheatListeners = function() {
		window.removeEventListener("mousedown", function(event) {
			if(!event.button && state.new) {
				game.input.mousePos = state.targetMousePosition;
				game.input.mouseButtonOld = false;
				game.input.mouseButton = true;
			} else {
				defaultBOnMouseDown(event);
			}
		});

		window.removeEventListener("mousemove", function(event) {
			if(!state.new) {
				defaultBOnMouseMove(event);
			}
		});

		window.addEventListener("mousedown", defaultBOnMouseDown);
		window.addEventListener("mousemove", defaultBOnMouseMove);

		removeSpaceKeyListener();
		removeOKeyListener();
	}

	var cheatEnabled = false;
	function enableCheat() {
		if(!game.gameOver) {			
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
		captureEnemyMode = false;
	}

	var addZKeyListener = function() {
		document.addEventListener("keyup", function(event) {
			if(event.which == 90) {
				if(cheatEnabled) {
					disableCheat();
				} else {
					enableCheat();
					console.log(game);
				}
			}
		});
	}

	var removeZKeyListener = function() {
		document.removeEventListener("keyup", function(event) {
			if(event.which == 90) {
				if(cheatEnabled) {
					disableCheat();
				} else {
					enableCheat();
				}
			}
		});
	}

	removeZKeyListener();
	addZKeyListener();	

})();