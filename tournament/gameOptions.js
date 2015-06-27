var mongoose = require("mongoose");
var constants = require("./../constants/constants");
var HearthstoneOptionSchema = require("./../model/hearthstoneGameOptions");


var schemaMap = {
	"hearthstone" : HearthstoneOptionSchema
}


// METHODS

function addGameOptions( gameOptions, finalCallback) {
	if(typeof gameOptions !== "object" || typeof gameOptions.gameType !== "string" 
		|| !constants.GAME_TYPES[gameOptions.gameType]) {
		finalCallback("Unable to add game options with invalid options");
		return;
	}
	if(!schemaMap[gameOptions.gameType]) {
		finalCallback("Unable to find schema for game type");
		return;
	}

	saveGameOptionsMap[gameOptions.gameType](gameOptions, finalCallback);
}

var saveGameOptionsMap = {
	hearthstone : function(gameOptions, finalCallback) {
		try {
			var gameOptionArgs = {
				numOfDecks : (typeof gameOptions.numOfDecks === "number") ? gameOptions.numOfDecks : 1,
				numOfDeckBans : (typeof gameOptions.numOfDeckBans === "number") ? gameOptions.numOfDeckBans : 0,
				decksPerClass : (typeof gameOptions.decksPerClass === "number") ? gameOptions.decksPerClass : 1,
				cardBanIds : (Array.isArray(gameOptions.cardBanIds)) ? gameOptions.cardBanIds : []
			}

			var newGameOptions = new HearthstoneOptionSchema(gameOptionArgs);
			newGameOptions.save(finalCallback);
		} catch(err) {
			finalCallback(err);
		}
	}
}

function getGameOptions( gameOptionsId, gameType, finalCallback ) {
	if(typeof gameOptionsId !== "string") {
		finalCallback("Unable to get gameOptions with invalid id");
		return;
	}
	if(!schemaMap[gameOptions.gameType]) {
		finalCallback("Unable to find schema for game type");
		return;
	}

	schemaMap[gameType].findById(gameOptionsId, function(err, gameOptions) {
		finalCallback(err gameOptions);
	});
}

function combineGameOptions(oldOptions, newOptions) {
	if(typeof oldOptions !== "object" || typeof newOptions !== "object") {
		throw new Error("Unable to combine gameOptions with invalid args");
	}

	for(var key in oldOptions) {
		if(typeof newOptions[key] !== "undefined" && typeof newOptions[key] === typeof oldOptions[key]) {
			oldOptions[key] = newOptions[key];
		}
	}
	return oldOptions;
}

function removeGameOptions(gameTypeId, gameType, finalCallback) {
	if(typeof gameTypeId !== string) {
		finalCallback("Unable to remove game options with invalid id");
		return;
	}
	if(typeof gameType !== "string" || !schemaMap[gameType]) {
		finalCallback("Unable to remove game options with invalid game type")
		return;
	}

	schemaMap[gameType].find({_id:gameTypeId}).remove(function(err) {
		finalCallback(err);
	});
}

// MAIN EXPORTS
module.exports = {
	addGameOptions : addGameOptions,
	getGameOptions : getGameOptions,
	combineGameOptions : combineGameOptions
}