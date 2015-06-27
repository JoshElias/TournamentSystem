
var REGIONS = {
	na: "na", 
	eu: "eu"
};

var TOURNAMENT_TYPES = {
	singleElim: "singleElim",
	doubleElim: "doubleElim", 
	swiss: "swiss"
};

var KEY_SEPARATOR = "::";

var WIN_TYPES = { 
	victory: "victory", 
	draw: "draw", 
	unplayed: "unplayed", 
	bye: "bye"
};

var GAME_TYPES = {
	hearthstone: "hearthstone", 
	hots: "hots"
};


// MAIN EXPORTS
module.exports = {
	REGIONS : REGIONS,
	TOURNAMENT_TYPES : TOURNAMENT_TYPES,
	KEY_SEPARATOR : KEY_SEPARATOR,
	WIN_TYPES : WIN_TYPES,
	GAME_TYPES : GAME_TYPES
}