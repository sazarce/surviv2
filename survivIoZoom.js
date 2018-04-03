
var iterate = function() {
	if( !game.activePlayer.localData.inventory["4xscope"] &&
		!game.activePlayer.localData.inventory["8xscope"] &&
		!game.activePlayer.localData.inventory["15xscope"]) {

		game.activePlayer.localData.curScope = "4xscope"; //15xscope
		game.activePlayer.localData.inventory["4xscope"] = 1;	
	}
}

var timer = {};
function ticker() {
	iterate();
	timer = setTimeout(ticker, 30);
}

function reload() {
	if(timer) clearTimeout(timer);
	ticker();
}

function stop() {
	if(timer) clearTimeout(timer);
}