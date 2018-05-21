var autoAim = function(game, variables) {
	window.positionLog = [];
	var bullets = variables.bullets;
	var items = variables.items;
	var playerBarn = variables.playerBarn;
	var binded = false;

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
		
		game.overlay.strokeStyle = 'orange';
		game.overlay.lineWidth = 5;
		for(var i = 0; i < playerIds.length; i++) {
			var curplayer = game.scope.objectCreator.idToObj[playerIds[i]];
			if( game.scope.objectCreator.idToObj[playerIds[i]] && 
				(!game.scope.objectCreator.idToObj[playerIds[i]].netData.dead) && 
				(!game.scope.objectCreator.idToObj[playerIds[i]].netData.downed) &&
				game.scope.playerBarn.playerInfo[playerIds[i]].teamId != selfTeamId) {
				//debugger;
				if(playerIds[i] != selfId) {
					//debugger;
					result[playerIds[i]] = game.scope.objectCreator.idToObj[playerIds[i]];
					var newpoint = game.scope.camera.pointToScreen(curplayer.pos);
					game.overlay.strokeRect(newpoint.x-15, newpoint.y-15,30,30);
					game.overlay.font = "38px";
					game.overlay.lineWidth = 1;
					game.overlay.strokeText(game.scope.objectCreator.idToObj[playerIds[i]].weapType, newpoint.x-5, newpoint.y + 30);
					//console.log(newpoint.x, newpoint.y);
				}
				else {

				}
			}
			if (playerIds[i] == selfId){
				window.positionLog.push({time: Date.now(), pos: game.scope.objectCreator.idToObj[playerIds[i]].pos});
				if (positionLog.length > 1000){
					//console.log(window.positionLog);
					//debugger;
				}
				///	debugger;
			}
		}

		return result;
	}

	var drawPlayer = function(pos, color, thickness){
		game.overlay.strokeStyle = color;
		game.overlay.lineWidth = thickness;
		var newpoint = game.scope.camera.pointToScreen(pos);
		game.overlay.strokeRect(newpoint.x - 15, newpoint.y - 15 ,30, 30);
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
			//game.overlay.beginPath();
			//var newpoint = game.scope.camera.pointToScreen(predictionEnemyPos);
			//game.overlay.arc(newpoint.x, newpoint.y, 10, 0, 2*Math.PI);
			//game.overlay.fill()
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

	var calculateMousePosition = function(enemyPos, vel){
		//console.log("CalcMousePosition " + JSON.stringify(vel));

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
		
		var enemySpeed = {x: vel.x * 1000, y: vel.y * 1000};

		for(var i = 0; i < 10; i++) {
			bulletApproachTime = predictionEnemyDistance/bulletSpeed;

			predictionEnemyPos = {
				x: enemyPos.x + enemySpeed.x * bulletApproachTime,
				y: enemyPos.y + enemySpeed.y * bulletApproachTime
			};
			//game.overlay.beginPath();
			//var newpoint = game.scope.camera.pointToScreen(predictionEnemyPos);
			//game.overlay.arc(newpoint.x, newpoint.y, 10, 0, 2*Math.PI);
			//game.overlay.fill()
			predictionEnemyDistance = calculateDistance(selfPos.x, selfPos.y, predictionEnemyPos.x, predictionEnemyPos.y);
		}
		//console.log(JSON.stringify(enemyPos));
		//console.log(JSON.stringify(game.scope.camera.pointToScreen(predictionEnemyPos)));
		return game.scope.camera.pointToScreen(predictionEnemyPos);
	}
	var getNewState = function() {
		var state = {changeIndex: 0, prevXSign: 0, prevYSign: 0, bufferSize: 20, targetMousePosition: {x: 0, y: 0}, positions: [], vels: [], times: [], calcVel: {x: 0, y: 0}};
		return state;
	}

	var state = getNewState();
	var addNewPosition = function(pos){
		state.positions.push(pos);
    	state.times.push(Date.now())
		if (state.positions.length == 1){
			state.vels.push({x: 0, y: 0});
     
			state.calcVel.x = 0;
			state.calcVel.y = 0;
			return;
		}
		var curIndex = state.positions.length-1;

		var curXVel = 1.0 * (state.positions[curIndex].x - state.positions[curIndex - 1].x) *1.0/ (state.times[curIndex] - state.times[curIndex -1] + 1); //velocity between ticks
		var curYVel = (state.positions[curIndex].y - state.positions[curIndex - 1].y) *1.0/ (state.times[curIndex] - state.times[curIndex -1] + 1); //velocity between ticks)
		state.vels.push({x: curXVel, y: curYVel});
		//console.log("Instant vel: " + JSON.stringify(state.vels[state.vels.length - 1]))
		var newXSign = Math.sign(curXVel);
		var newYSign = Math.sign(curYVel);
		if (curXVel != 0 && newXSign != state.prevXSign){ //moving in new direction
			state.changeIndex = curIndex;
			state.prevXSign = newXSign;
		}
		if (curYVel != 0 && newYSign != state.prevYSign){
			state.changeIndex = curIndex;
			state.prevYSign = newYSign;
		}
		//avg velocity from 0 to current
		var calcXVel = 1.0 * (state.positions[curIndex].x - state.positions[Math.max(state.changeIndex, curIndex - state.bufferSize)].x)*1.0/(state.times[curIndex] - state.times[Math.max(state.changeIndex, curIndex - state.bufferSize)] + 1);
		var calcYVel = 1.0 * (state.positions[curIndex].y - state.positions[Math.max(state.changeIndex, curIndex - state.bufferSize)].y)*1.0/(state.times[curIndex] - state.times[Math.max(state.changeIndex, curIndex - state.bufferSize)] + 1);
		state.calcVel.x = calcXVel;
		state.calcVel.y = calcYVel;

	    //debugger;

	}
  

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

			
			// state.unshift({
			// 	playerId: detectedEnemies[detectedEnemiesKeys[minimalDistanceEnemyIndex]].__id,
			// 	distance: enemyDistances[minimalDistanceEnemyIndex],
			// 	radianAngle: enemyRadianAngles[minimalDistanceEnemyIndex],
			// 	pos: detectedEnemies[detectedEnemiesKeys[minimalDistanceEnemyIndex]].netData.pos,
			// 	timestamp: Date.now(),
			// });
			// state.pop();
			// drawPlayer(state[0].pos, 'red', 7);
			// state[0].targetMousePosition = calculateTargetMousePosition(state[0].pos, state[0].timestamp, state[1].pos, state[1].timestamp, state.distance);
			// state.averageTargetMousePosition = {
			// 	x: 0,
			// 	y: 0
			// };

			// for(var i = 0; i < state.length; i++) {
			// 	state.averageTargetMousePosition.x += state[i].targetMousePosition.x;
			// 	state.averageTargetMousePosition.y += state[i].targetMousePosition.y;
			// }

			// state.averageTargetMousePosition.x /= state.length;
			// state.averageTargetMousePosition.y /= state.length;
			addNewPosition(detectedEnemies[detectedEnemiesKeys[minimalDistanceEnemyIndex]].netData.pos);
			state.averageTargetMousePosition = calculateMousePosition(detectedEnemies[detectedEnemiesKeys[minimalDistanceEnemyIndex]].netData.pos, state.calcVel);
			drawPlayer(detectedEnemies[detectedEnemiesKeys[minimalDistanceEnemyIndex]].netData.pos, 'red', 7);
			game.overlay.beginPath();
			var newpointt = state.averageTargetMousePosition;
			//console.log(state.calcVel);
			
			var curpos = game.scope.camera.pointToScreen(selfPos);

			game.overlay.moveTo(curpos.x, curpos.y);
			game.overlay.lineWidth = 1;
			game.overlay.lineTo(newpointt.x, newpointt.y);
			game.overlay.stroke()
			//debugger;
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
			//alert("Mouse");
			console.log("Mouse");
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
			//debugger;
			if(event.which == 32) {
				//alert("Space key");
				console.log("Space key");
				
				game.scope.input.mouseButton = true;
				game.scope.isSpacePressed = true;
				spam(false);
			}
		},
		keyup: function(event) {
			//debugger;
			if(event.which == 32) {
				//alert("Key up");
				game.scope.input.mouseButton = false; 
				game.scope.isSpacePressed = false;
			}
		}
	}

	var spam = function(pressed){
		if (!game.scope.isSpacePressed) return;
		console.log("spam");
		if (pressed){
			game.scope.input.mouseButton = false;
			setTimeout(function(){spam(false)}, 50);
		}
		else {
			game.scope.input.mouseButton = true;
			setTimeout(function(){spam(true)}, 50);
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
				//console.log("Render: " + JSON.stringify(state.averageTargetMousePosition));
				game.scope.input.mousePos = state.averageTargetMousePosition;
			}
		};

		window.removeEventListener("mousedown", game.scope.input.bOnMouseDown);
		window.removeEventListener("mousemove", game.scope.input.bOnMouseMove);

		removeMouseListener();
		removeSpaceKeyListener();
		removeOKeyListener();

		addMouseListener();
		addSpaceKeyListener();
		addOKeyListener();

		binded = true;
	}

	var unbind = function() {
		removeMouseListener();
		removeSpaceKeyListener();
		removeOKeyListener();

		window.removeEventListener("mousedown", defaultBOnMouseDown);
		window.removeEventListener("mousemove", defaultBOnMouseMove);		

		window.addEventListener("mousedown", defaultBOnMouseDown);
		window.addEventListener("mousemove", defaultBOnMouseMove);

		playerBarn.prototype.render = defaultPlayerBarnRenderFunction;

		binded = false;
	}

	var isBinded = function() {
		return binded;
	}

	return {
		bind: bind,
		unbind: unbind,
		isBinded: isBinded
	}
}