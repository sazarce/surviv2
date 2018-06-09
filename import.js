var test = "test"
function run(){
	console.log(test)
}
module.exports = function(){
	this.run = run
}
