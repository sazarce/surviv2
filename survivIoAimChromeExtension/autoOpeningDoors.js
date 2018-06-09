var autoOpeningDoors = function(game, emitActionCb, interactionEmitter) {

	var binded = false;

	emitActionCb.scope = function() {};

	var pressF = function() {
		if(!game.scope.input.keys["70"]) {
			setTimeout(function() {
				game.scope.input.keys["70"] = true;
				setTimeout(function() {
					delete game.scope.input.keys["70"]
				}, 50);
			}, 50);
		}
	};

	var interactionTypes = {
		Obstacle: 2,
		Loot: 3
	};

	var bind = function() {
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
		binded = true;
	};

	var unbind = function() {
		emitActionCb.scope = function() {};
		binded = false;
	};

	var isBinded = function() {
		return binded;
	}

	return {
		bind: bind,
		unbind: unbind,
		isBinded: isBinded
	}
}