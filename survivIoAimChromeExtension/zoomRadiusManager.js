var zoomRadiusManager = function(game, variables) {

	var scopeZoomRadius = variables.scopeZoomRadius;

	if(!!!scopeZoomRadius) {
		console.log("Cannot init zoom radius manager");
		return;
	}

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
	var zoomRadius = 68;
	setZoomRadius(zoomRadius);

	var defaultBOnMouseWheel = function(e) {};

	var mouseListener = {
		wheel: function(e) {			
			if(e.shiftKey) {
				var delta = e.deltaY || e.detail || e.wheelDelta;
				zoomRadius += Math.sign(delta) * 10;
				if(zoomRadius < 10) zoomRadius = 10;
				if(zoomRadius > 1000) zoomRadius = 1000;
				setZoomRadius(zoomRadius)
			} else {
				defaultBOnMouseWheel(e);
			}
		}
	}

	var addMouseListener = function(e) {
		window.addEventListener('wheel', mouseListener.wheel);
	}

	var removeMouseListener = function(e) {
		window.removeEventListener('wheel', mouseListener.wheel);
	}

	var bind = function() {
		defaultBOnMouseWheel = game.scope.input.bOnMouseWheel;
		window.removeEventListener('wheel', game.scope.input.bOnMouseWheel);
		addMouseListener();
	}

	var unbind = function() {
		removeMouseListener();
		window.addEventListener('wheel', defaultBOnMouseWheel);
		defaultBOnMouseWheel = function(e) {};
	}

	return {
		bind: bind,
		unbind: unbind
	}
}