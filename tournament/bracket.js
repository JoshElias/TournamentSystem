var async = require("async");
var tournamentUtil = require("./tournamentUtil");
var RoundOptions = require("./roundOptions");
var TournamentSchema = require("./../model/tournament");
var BracketSchema = require("./../model/tournamentBracket");
var match = require("./match");





// 	Creates a bracket with a tournament admin with the options specified
//
//	
function createBracket( adminId, tournamentId, bracketOptions, roundOptions, finalCallback ) {

	// Validate arguments
	if(typeof adminId !== "string") {
		finalCallback("Can't add bracket with invalid admin id");
		return;
	}
	if(typeof tournamentId !== "string") {
		finalCallback("Can't add bracket with invalid tournament id");
		return;
	}
	if(typeof bracketOptions !== "object") {
		finalCallback("Options must be an object");
		return;
	}

	var tournament;

	async.waterfall([
		// Lookup the tournament by id
		function(seriesCallback) {
			TournamentSchema.findById(tournamentId)
			.select("defaultRoundOptionsId bestOf gameType startingBracketId endingBracketId")
			.exec(function(err, _tournament) {
				if(err) seriesCallback(err);
				else if(!_tournament) seriesCallback("Unable to find tournament by id");
				else  {
					tournament = _tournament;
					seriesCallback(undefined);
				}
			});
		},
		// Check if this user has admin rights to this tournament
		function(seriesCallback) {
			tournamentUtil.validateAdminId(adminId, tournamentId, function(err, isAdmin) {
				if(err) seriesCallback(err);
				else if(!isAdmin) seriesCallback("This user does not have admin access to this tournament");
				else seriesCallback();
			});
		},
		// Get game options from tournament and combine with those provided
		function(seriesCallback) {
			RoundOptions.getRoundOptions(tournament.defaultRoundOptionsId.toString(), tournament.gameType, function(err, defaultGameOptions) {
				if(err) seriesCallback(err);
				else {
					var newRoundOptions = RoundOptions.combineRoundOptions(defaultGameOptions, roundOptions);
					seriesCallback(undefined, newRoundOptions);
				}
			});
		},
		// Save the game options
		function(newRoundOptions, seriesCallback) {
			RoundOptions.createRoundOptions(newRoundOptions, seriesCallback);
		},
		// Get arguments for creating a bracket
		function(newRoundOptions, seriesCallback) {
			try {
				var bracketArgs = {
					creatorId : adminId,
					bracketType: (typeof bracketOptions.bracketType !== "string") ? "singleElim" : bracketOptions.bracketType,
					name: (typeof bracketOptions.name !== "string") ? "Unnamed Bracket" : bracketOptions.name,
					description: (typeof bracketOptions.description !== "string") ? "" : bracketOptions.description,
					tournamentId: tournamentId,
					prizePool: (!Array.isArray(bracketOptions.prizePool)) ? [] : bracketOptions.prizePool,
					defaultRoundOptionsId: newRoundOptions._id,
					gameType: tournament.gameType,
					creationTime: Date.now()
				}
				seriesCallback(undefined, bracketArgs);
			} catch(err) {
				seriesCallback(err);
			}
		},	
		// Create bracket
		function(bracketArgs, seriesCallback) {
			var newBracket = new BracketSchema(bracketArgs);
			newBracket.save(function(err, newBracket) {
				seriesCallback(err, newBracket);
			});
		},
		// Add bracket to tournament. Check for starting and ending bracket ids
		function(newBracket, seriesCallback) {	
			var tournamentUpdates = {$push:{bracketIds:newBracket._id}};
			if(typeof tournament.startingBracketId === "undefined" || tournament.startingBracketId === "") {
				tournamentUpdates.startingBracketId = newBracket._id
			}
			if(typeof tournament.endingBracketId === "undefined" || tournament.endingBracketId === "") {
				tournamentUpdates.endingBracketId = newBracket._id;
			}

			TournamentSchema.findByIdAndUpdate(tournamentId, tournamentUpdates, function(err) {
				seriesCallback(err, newBracket);
			});
		}], 
	finalCallback);
}


function removeBracket(adminId, bracketId, finalCallback ) {
	// Validate arguments
	if(typeof bracketId !== "string") {
		finalCallback("Can't add bracket with invalid admin id");
		return;
	}

	async.waterfall([
		// Look up the bracket in the db
		function(seriesCallback) {
			BracketSchema.findById(bracketId)
			.select("gameType nextBracketId defaultRoundOptionsId tournamentId matchIds")
			.exec(function(err, bracket) {
				if(err) seriesCallback(err);
				else if(!bracket) seriesCallback(true);
				else seriesCallback(undefined, bracket);
			});
		},
		// Check if this user has admin rights to this tournament
		function(bracket, seriesCallback) {
			tournamentUtil.validateAdminId(adminId, bracket.tournamentId, function(err, isAdmin) {
				if(err) seriesCallback(err);
				else if(!isAdmin) seriesCallback("This user does not have admin rights to this tournament");
				else seriesCallback(undefined, bracket);
			});
		},
		// Delete the game options associated with this bracket
		function(bracket, seriesCallback) {
			RoundOptions.removeRoundOptions(bracket.defaultRoundOptionsId.toString(), bracket.gameType, function(err) {
				seriesCallback(err, bracket);
			}); 
		},
		// Delete the matches belonging to this bracket
		function(bracket, seriesCallback) {
			async.eachSeries(bracket.matchIds, function(matchId, eachCallback) {
				MatchSchema.find({_id:matchId}).remove(eachCallback);
			}, function(err) {
				seriesCallback(err, bracket);
			});
		},
		// Lookup the tournament by id
		function(bracket, seriesCallback) {
			TournamentSchema.findById(bracket.tournamentId)
			.select("gameOptionsId bestOf gameType startingBracketId endingBracketId")
			.exec(function(err, tournament) {
				if(err) seriesCallback(err);
				else if(!tournament) seriesCallback(true);
				else seriesCallback(undefined, tournament);
			});
	
		},
		// Remove bracket from tournament. Check for starting and ending bracket ids
		function(tournament, seriesCallback) {	
			var tournamentUpdates = {$pull:{bracketIds:bracketId}};
			if(typeof tournament.startingBracketId !== "undefined" && tournament.startingBracketId === bracketId) {
				tournamentUpdates.startingBracketId = ""
			}
			if(typeof tournament.endingBracketId !== "undefined" && tournament.endingBracketId === bracketId) {
				tournamentUpdates.endingBracketId = "";
			}

			TournamentSchema.findByIdAndUpdate(tournament._id, tournamentUpdates, function(err) {
				seriesCallback(err);
			});
		},
		// Delete the bracket from the database
		function(seriesCallback) {
			BracketSchema.find({_id:bracketId}).remove(function(err) {
				seriesCallback(err);
			});
		}], 
	finalCallback);
}


// Seeds a bracket with the players coming from another bracket or being added manually.
// If no sources are provided then we use all the players registered for the tournament.
// 
//	
// 	bracketId : (String)
// 	options : {
// 		sourceTeamIds : (Array)
//		sourceBracketId: (String)
// 		seedOrder: (String) // ascending/descending
//  }
// 	finalCallback : (Callback) // (err, newBracket)
//
function seedBracket(bracketId, options, finalCallback) {
	// Validate arguments
	if(typeof bracketId !== "object") {
		finalCallback("Can't seed bracket with invalid id");
		return;
	}

	// Database cache
	var playerDict = {};
	var matchDict = {};

	async.waterfall([
		// Get the associated tournament
		function(seriesCallback) {
			BracketSchema.findById(bracketId)
			.populate("tournamentId")
			.exec(function(err, bracket) {
				seriesCallback(err, bracket.tournamentId);
			});
		},
		// Compile the list of team Ids from the sources provided
		function(tournament, seriesCallback) {
			var teamIds = [];

			async.series([
				// No options means we just take the teamIds from the tournament
				function(innerCallback) {
					if(typeof options !== "object") {
						Array.prototype.push.apply(teamIds, options.teamIds);
						innerCallback(true);
					}
					innerCallback();
				}, 
				// Add source player Ids
				function(innerCallback) {
					if(Array.isArray(options.sourceTeamIds)) {
						Array.prototype.push.apply(teamIds, options.sourceTeamIds);
					}
					innerCallback();
				},
				function(innerCallback) {
					if(typeof options.sourceBracketId === "string") {
						BracketSchema.findById(options.sourceBracketId)
						.select("teamIds")
						.exec(function(err, bracket) {
							if(err) innerCallback(err);
							else if(!bracket) innerCallback();
							else {
								Array.prototype.push.apply(teamIds, bracket.teamIds);
								innerCallback();
							}
						})
					} else {
						innerCallback();
					}	
				}],
			function(err, results) {
				seriesCallback(err, tournament, teamIds);
			});
		},
		// Filter out duplicates and players not registered for this tournament
		function(tournament, teamIds, innerCallback) {
			try {
				var uniqueTeamIds = _.uniq(teamIds);
				for(var i = uniqueTeamIds.length -1; i >= 0 ; i--) {
					if(tournament.teamIds.indexOf(uniqueTeamIds[i]) === -1) {
	    				uniqueTeamIds.splice(i, 1);
					}
				}
				innerCallback(undefined, uniqueTeamIds);
			} catch(err) {
				innerCallback(err);
			}
		},
		// Create the necessary matches
		function(teamIds, seriesCallback) {
			match.createStartingMatches(bracketId, teamIds, seriesCallback);
		}], 
	finalCallback);
}


 // MAIN EXPORTS
 module.exports = {
 	createBracket : createBracket,
 	removeBracket : removeBracket,
 	seedBracket : seedBracket
 }