var async = require("async");
var mongoose = require("mongoose");
var _ = require("underscore");
var mathUtil = require("./util/mathUtil");
var tournamentUtil = require("./util/tournamentUtil");
var UserSchema = require("./../model/user");
var TournamentSchema = require("./../model/tournament");
var PlayerSchema = require("./../model/player");
var MatchSchema = require("./../model/match");
var util = require("util");


// Connect to the database
mongoose.connect('mongodb://localhost/tempostorm');


// Router
function route( app ) {
	app.post("/createTournament", createTournamentHandler);
	app.post("/addPlayer", addPlayerHandler);
}


// Methods

// Creates a tournament in the database with the arguments provided.
//	
// 	userId : (String),
// 	data : {
// 		admins : (Array),
//		regionName: (String),
//		description: (String),
//		prizePool: (Array),
//		numOfDecks: (Number),
//		numOfDeckBans: (Number),
//		decksPerClass: (Number),
//		bestOf: (Number),
//		cardBans: (Array)
//  }
// 	finalCallback : (Callback) // (err, newTournament)
//
function createTournament( adminId, startTime, options, finalCallback ) {	
	// Validate arguments
	if(typeof adminId !== "string") {
		finalCallback("Can't create tournament with invalid user id");
		return;
	}
	if(typeof startTime !== "number") {
		finalCallback("Can't create tournament with no start time");
		return;
	}
	if(typeof options !== "object") {
		finalCallback("Can't create tournament with no options");
		return;
	}


	// Clean arguments
	var tournamentArgs = {
		creatorId : adminId,
		startTime : new Date(startTime),
		adminIds : (!Array.isArray(options.admins)) ? [adminId] : options.admins,
		name: (typeof options.name !== "string") ? "Unnamed Tournament" : options.name,
		regionName: (typeof options.regionName !== "string" 
			|| REGIONS.indexOf(options.regionName) === -1) ? "na" : options.regionName,
		description: (typeof options.description !== "string") ? "" : options.description,
		prizePool: (!Array.isArray(options.prizePool)) ? [] : options.prizePool,
		numOfDecks: (typeof options.numOfDecks !== "number") ? 1 : options.numOfDecks,
		numOfDeckBans: (typeof options.numOfDeckBans !== "number") ? 0 : options.numOfDeckBans,
		decksPerClass: (typeof options.decksPerClass !== "number") ? 1 : options.decksPerClass,
		bestOf: (typeof options.bestOf !== "number") ? 1 : options.bestOf,
		cardBanIds: (!Array.isArray(options.cardBans)) ? [] : options.cardBans,
		creationTime: Date.now()
	}

	// Save tournament
	var newTournament = new TournamentSchema(tournamentArgs);
	newTournament.save(finalCallback);
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
			seedBracket(tournament.startingBracketId, options, seriesCallback);
		},
		// Flag the tournament as active
		function(tournament, seriesCallback) {
			TournamentSchema.findByIdAndUpdate(tournamnetId, {active:true}, seriesCallback);
		}], finalCallback);
}

function setMatchWinner(matchId, winnerId, winType, finalCallback) {
	if(typeof matchId !== "string") {
		finalCallback("Can't set match winner with invalid match id");
		return;
	}
	if(typeof winnerId !== "string") {
		finalCallback("Can't set match winner with invalid match id");
		return;
	}
	if(typeof winType !== "string" || tournamentConstants.WIN_TYPE.indexOf(winType) === -1) {
		finalCallback("Can't set match winner with invalid win type");
		return;
	}

	var match;
	var bracket;

	async.waterfall([
		// Get the match by id
		function(seriesCallback) {
			MatchSchema.findById(matchId)
			.select("player1Id player2Id bracketId winningMatchId losingMatchId")
			.exec(function(err, _match) {
				if(err) seriesCallback(err);
				else if(!_match) seriesCallback("Unable to find match with Id");
				else {
					match = _match;
					seriesCallback();
				}
			});
		},
		// Verify that the winner id is one of the players
		function(seriesCallback) {
			if(winnerId !== match.player1Id && winnerId !== match.player2Id) {
				seriesCallback("WinnerId doesn't match either playerIds in match");
			}
			seriesCallback();
		},
		// Set match winner and save
		function(seriesCallback) {
			MatchSchema.findByIdAndUpdate(matchId, {winnerId:winnerId, winType:winType}, function(err, results) {
				seriesCallback(err);
			});
		},
		// Get the bracket to find out what kind of type it is so we can place
		// the players in their next match accordingly
		function(seriesCallback) {
			BracketSchema.findById(match.bracketId)
			.select("bracketType")
			.exec(function(err, _bracket) {
				if(err) seriesCallback(err);
				else if(!_bracket) seriesCallback("Unable to find bracket with id");
				else {
					bracket = _bracket;
					seriesCallback();
				}
			});
		},
		// Update the match id of both players to their next matches
		function(seriesCallback) {
			if(bracketType === "singleElim") {
				
				var winnerTypeMap = {
					"victory" : "wins",
					"draw": "draws",
					"unplayed" : "unplayed",
					"bye" : "unplayed"
				}

				var loserTypeMap = {
					"victory" : "losses",
					"draw": "draws",
					"unplayed" : "unplayed",
					"bye" : "unplayed"
				}

				async.series([
					// Update loser position
					function(innerCallback) {
						var loserPlayerId = (winnerId === match.player1Id) : match.player2Id ? match.player1Id;
						if(loserPlayerId) {
							PlayerSchema.findByIdAndUpdate(loserPlayerId, {$push: {matchIdHistory:matchId}, 
								$inc:{loserTypeMap[winType]:1}, $set:{currentMatchId: match.losingMatchId}}, seriesCallback);
						} else {
							seriesCallback();	
						}	
					},
					// Update winner position
					function(innerCallback) {
						var winnerPlayerId = (winnerId === match.player1Id) : match.player1Id ? match.player2Id;
							PlayerSchema.findByIdAndUpdate(winnerPlayerId, {$push: {matchIdHistory:matchId}, 
								$inc:{winTypeMap[winType]:1}, $set:{currentMatchId: match.winningMatchId}}, seriesCallback);
							});
					},
					// Did they win the bracket?
					function(innerCallback) {
						// Yes
						if(!match.winningMatchId) {
							MatchSchema.findById(bracket._id, {winnerId:winnerId, endTime:Date.now()}, innerCallback);
						// Number No
						} else {
							innerCallback();
						}
					}], seriesCallback);
			} else {
				seriesCallback();
			}
		}], 
	finalCallback);
}



module.exports = {
	createTournament : createTournament,
	addPlayer : addPlayer
}