var init = function(game, exports, interactionEmitter, emitActionCb, modules) {
	if(!exports) return;
	
	function findVariable(name, exports) {
		var keys = Object.keys(exports);
		for(var i = 0; i < keys.length; i++) {
			if(exports[keys[i]].exports[name]) {
				return exports[keys[i]].exports[name];
			}
		}
		return null;
	};

	var defsParticles = findVariable("Defs", exports);
	var bullets = findVariable("bullets", exports);
	var items = findVariable("items", exports);
	var bagSizes = findVariable("bagSizes", exports);
	var playerBarn = findVariable("PlayerBarn", exports);
	var lootBarn = findVariable("LootBarn", exports);
	var scopeZoomRadius = findVariable("scopeZoomRadius", exports);
	var inputHandler = findVariable("InputHandler", exports);

	if(inputHandler) {
		var defaultInputHandlerFreeFunction = function() {};
		var inputHandlerFreeContext = {};

		defaultInputHandlerFreeFunction = inputHandler.prototype.free;
		inputHandler.prototype.free = function() {
			disableCheat();
			inputHandlerFreeContext = this;
			defaultInputHandlerFreeFunction.call(inputHandlerFreeContext);			
		}
	} else {
		console.log("Cannot init");
		return;
	}

	if(!!defsParticles || !!items) {
		// Gernage size and color
		items.frag.worldImg.tint = 16711680;
		items.frag.worldImg.scale = 0.31;

		// Ceiling alpha
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
		console.log("Alpha not patched");
	}

	// setInterval(function(){if(game.scope && game.scope.activePlayer){
	// 	console.log(game.scope);console.log(exports);
	// }}, 2000);

	var gameOver = function() {
		return !!game.scope.gameOver;
	}

	var autoAim = modules.autoAim(game, {
		bullets: bullets, 
		items: items, 
		playerBarn: playerBarn
	});

	var autoLoot = modules.autoLoot(game, {
		lootBarn: lootBarn,
		bagSizes: bagSizes
	});

	var autoOpeningDoors = modules.autoOpeningDoors(game, emitActionCb, interactionEmitter);

	var zoomRadiusManager = modules.zoomRadiusManager(game, {
		scopeZoomRadius: scopeZoomRadius
	});

	var bindCheatListeners = function() {
		autoAim.bind();
		autoLoot.bind();
		autoOpeningDoors.bind();
		zoomRadiusManager.bind();
	}

	var unbindCheatListeners = function() {
		autoAim.unbind();
		autoLoot.unbind();
		autoOpeningDoors.unbind();
		zoomRadiusManager.unbind();
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
		window.addEventListener("keyup", zKeyListener.keyup);
	}

	var removeZKeyListener = function() {
		window.removeEventListener("keyup", zKeyListener.keyup);
	}

	addZKeyListener();
}
