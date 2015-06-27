var async = require("async");
var mongoose = require("mongoose");
var _ = require("underscore");
var mathUtil = require("./../util/mathUtil");
var tournamentUtil = require("./../util/tournamentUtil");
var UserSchema = require("./../model/user");
var TournamentSchema = require("./../model/tournament");
var PlayerSchema = require("./../model/tournamentPlayer");
var MatchSchema = require("./../model/tournamentMatch");
var tournamentUtil = require("./tournamentUtil");
var util = require("util");
var constants = require("./../constants/constants");
var gameOption = require("./gameOptions");


// Connect to the database
mongoose.connect('mongodb://localhost/tempostorm');


// Methods

// Creates a tournament in the database with the arguments provided.
//	
// 	userId : (String),
// 	tournamentOptions : {
// 		name: (String),
// 		description: (String),
// 		startTime : (Date),
//		regionName: (String),
//		gameType: (String)
//	 	teamSize : (Number),
//		bestOf: (Number),
//		prizePool: (Array),
//  }
// 	gameOptions: {
//		gameType: (String),
//		gameSpecificStuff
//  }
// 	finalCallback : (Callback) // (err, newTournament)
//
function createTournament( adminId, tournamentOptions, gameOptions, finalCallback ) {	
	// Validate arguments
	if(typeof adminId !== "string") {
		finalCallback("Can't create tournament with invalid user id");
		return;
	}
	if(typeof tournamentOptions !== "object") {
		finalCallback("Can't create tournament with no tournament options");
		return;
	}	
	if(typeof tournamentOptions.startTime !== "number") {
		finalCallback("Can't create tournament with no start time");
		return;
	}
	if(typeof tournamentOptions.gameType !== "string"  || !constants.GAME_TYPES[tournamentOptions.gameType]) {
		finalCallback("Can't create tournament with invalid game type");
		return;
	}
	if(typeof gameOptions !== "object") {
		finalCallback("Can't create tournament with no game options");
		return;
	}		

	// Clean arguments
	var tournamentArgs = {
		creatorId : adminId,
		name: (typeof tournamentOptions.name !== "string") ? "Unnamed Tournament" : tournamentOptions.name,
		description: (typeof tournamentOptions.description !== "string") ? "" : tournamentOptions.description,
		startTime : new Date(tournamentOptions.startTime),
		regionName: (typeof tournamentOptions.regionName !== "string" 
			|| !constants.REGIONS[tournamentOptions.regionName]) ? "na" : tournamentOptions.regionName,

		adminIds : [adminId],

		gameType: tournamentOptions.gameType,
		teamSize: (typeof tournamentOptions.teamSize !== "number" && tournamentOptions.teamSize < 1) ? 1 : tournamentOptions.teamSize, 
		bestOf: (typeof tournamentOptions.bestOf !== "number" && tournamentOptions.bestOf < 1) ? 1 : tournamentOptions.bestOf,	
		
		prizePool: (!Array.isArray(tournamentOptions.prizePool)) ? [] : tournamentOptions.prizePool,
		creationTime: Date.now()
	}

	async.waterfall([
		// Check if the adminId exists in the system
		function(seriesCallback) {
			UserSchema.findById(adminId, function(err, user) {
				if(err) seriesCallback(err);
				else if(!user) seriesCallback("Unable to find user with Id");
				else seriesCallback();
			});
		},
		// Save the game options
		function(seriesCallback) {
			gameOption.addGameOptions(gameOptions, seriesCallback);
		},
		// Save the tournament
		function(newGameOptions, seriesCallback) {
			tournamentArgs["gameOptionsId"] = newGameOptions._id;
			var newTournament = new TournamentSchema(tournamentArgs);
			newTournament.save(finalCallback);
		}],
	finalCallback);
}

function startTournament( tournamentId, finalCallback ) {
	if(typeof tournamnetId !== "string") {
		finalCallback("Can't start tournament with invalid id");
		return;
	}

	async.waterfall([
		// Get the tournament with the id provided
		function(seriesCallback) {
			TournamentSchema.findById(tournamentId)
			.select("startingBracketId")
			.exec(function(err, tournament) {
				if(err) seriesCallback(err);
				else if(!tournament) seriesCallback("Unable to find tournament with id provided");
				else seriesCallback(undefined, tournament);
			});
		},
		// Seed the bracket for the tournament
		function(tournament, seriesCallback) {
			seedBracket(tournament.startingBracketId, seriesCallback);
		},
		// Flag the tournament as active
		function(tournament, seriesCallback) {
			TournamentSchema.findByIdAndUpdate(tournamnetId, {active:true}, seriesCallback);
		}], finalCallback);
}





module.exports = {
	createTournament : createTournament
}