var mongoose = require("mongoose");
var constants = require("./../constants/constants");
var HearthstoneRoundOptionSchema = require("./../model/hearthstoneRoundOptions");


var schemaMap = {
	"hearthstone" : HearthstoneRoundOptionSchema
}


// METHODS

function createRoundOptions( roundOptions, finalCallback) {
	if(typeof roundOptions !== "object") {
		finalCallback("Unable to add game options with invalid options");
		return;
	}
	if(typeof roundOptions.gameType !== "string" || !schemaMap[roundOptions.gameType]) {
		finalCallback("Unable to find schema for game type");
		return;
	}

	saveRoundOptionsMap[roundOptions.gameType](roundOptions, finalCallback);
}

var saveRoundOptionsMap = {
	hearthstone : function(roundOptions, finalCallback) {
		try {
			var gameOptionArgs = {
				numOfDecks : (typeof roundOptions.numOfDecks === "number") ? roundOptions.numOfDecks : 1,
				numOfDeckBans : (typeof roundOptions.numOfDeckBans === "number") ? roundOptions.numOfDeckBans : 0,
				decksPerClass : (typeof roundOptions.decksPerClass === "number") ? roundOptions.decksPerClass : 1,
				cardBanIds : (Array.isArray(roundOptions.cardBanIds)) ? roundOptions.cardBanIds : []
			}

			var newRoundOptions = new HearthstoneRoundOptionSchema(gameOptionArgs);
			newRoundOptions.save(function(err, saveRoundOptions) {
				finalCallback(err, saveRoundOptions);
			});
		} catch(err) {
			finalCallback(err);
		}
	}
}

function getRoundOptions( roundOptionsId, gameType, finalCallback ) {
	if(typeof roundOptionsId !== "string") {
		finalCallback("Unable to get roundOptions with invalid id");
		return;
	}
	if(!schemaMap[gameType]) {
		finalCallback("Unable to find schema for game type");
		return;
	}

	schemaMap[gameType].findById(roundOptionsId)
	.lean()
	.exec(finalCallback);
}

function combineRoundOptions(oldOptions, newOptions) {
	if(typeof oldOptions !== "object" || typeof newOptions !== "object") {
		throw new Error("Unable to combine gameOptions with invalid args");
	}

	for(var key in oldOptions) {
		if(typeof newOptions[key] !== "undefined" && typeof newOptions[key] === typeof oldOptions[key]) {
			oldOptions[key] = newOptions[key];
		}
	}

	delete oldOptions._id;
	return oldOptions;
}

function removeRoundOptions(gameTypeId, gameType, finalCallback) {
	if(typeof gameTypeId !== "string") {
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
	createRoundOptions : createRoundOptions,
	getRoundOptions : getRoundOptions,
	combineRoundOptions : combineRoundOptions,
	removeRoundOptions : removeRoundOptions
}