
(function() {
	var iterate = function() {
		if( !game.activePlayer.localData.inventory["8xscope"] &&
			!game.activePlayer.localData.inventory["15xscope"]) {

			game.activePlayer.localData.curScope = "8xscope"; //15xscope
			game.activePlayer.localData.inventory["8xscope"] = 1;
		}
	}

	var timer = {};
	function ticker() {
		iterate();
		timer = setTimeout(ticker, 100);
	}

	function reload() {
		if(timer) clearTimeout(timer);
		ticker();
	}

	function stop() {
		if(timer) clearTimeout(timer);
	}

	var scriptEnabled = false;
	var addZKeyListener = function() {
		document.addEventListener("keyup", function(event) {
			if(event.which == 90) {
				scriptEnabled = !scriptEnabled;
				if(scriptEnabled) {
					reload();
				} else {
					stop();
				}
			}
		});
	}

	var removeZKeyListener = function() {
		document.removeEventListener("keyup", function(event) {
			if(event.which == 90) {
				scriptEnabled = !scriptEnabled;
				if(scriptEnabled) {
					reload();
				} else {
					stop();
				}
			}
		});
	}

	removeZKeyListener();
	addZKeyListener();
})();