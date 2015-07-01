var async = require("async");
var tournamentUtil = require("./tournamentUtil");
var RoundOptions = require("./roundOptions");
var TournamentSchema = require("./../model/tournament");
var BracketSchema = require("./../model/tournamentBracket");


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
// 		sourcePlayerIds : (Array)
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
		// Compile the list of player Ids from the sources provided
		function(tournament, seriesCallback) {
			var playerIds = [];

			async.series([
				// No options means we just take the playerIds from the tournament
				function(innerCallback) {
					if(typeof options !== "object") {
						Array.prototype.push.apply(playerIds, options.sourcePlayerIds);
						innerCallback(true);
					}
					innerCallback();
				}, 
				// Add source player Ids
				function(innerCallback) {
					if(Array.isArray(options.sourcePlayerIds)) {
						Array.prototype.push.apply(playerIds, options.sourcePlayerIds);
					}
					innerCallback();
				},
				function(innerCallback) {
					if(typeof options.sourceBracketId === "string") {
						BracketSchema.findById(options.sourceBracketId)
						.select("playerIds")
						.exec(function(err, bracket) {
							if(err) innerCallback(err);
							else if(!bracket) innerCallback();
							else {
								Array.prototype.push.apply(playerIds, bracket.playerIds);
								innerCallback();
							}
						})
					} else {
						innerCallback();
					}	
				}],
			function(err, results) {
				seriesCallback(err, tournament, playerIds);
			});
		},
		// Filter out duplicates and players not registered for this tournament
		function(tournament, playerIds, innerCallback) {
			try {
				var uniquePlayerIds = _.uniq(playerIds);
				for(var i = uniquePlayerIds.length -1; i >= 0 ; i--) {
					if(tournament.playerIds.indexOf(uniquePlayerIds[i]) === -1) {
	    				uniquePlayerIds.splice(i, 1);
					}
				}
				innerCallback(undefined, tournament, uniquePlayerIds);
			} catch(err) {
				innerCallback(err);
			}
		},
		// Create the necessary matches
		function(tournament, playerIds, innerCallback) {
			try {
				console.log("Number of players registered for tournament: "+playerIds.length);
				var tournamentSize = mathUtil.nextPowerOf2(playerIds.length);

				if(tournament.tournamentType === "singleElim") {
					var numOfRounds = tournamentUtil.getNumOfRoundsInWinnerBracket(tournamentSize);
					var numOfMatchesThisRound = 1;
					for(var i = 0; i < numOfRounds; i++) {	
						for(var j = 0; j < numOfMatchesThisRound; j++) {
							var matchKey = "1::"+(i+1)+"::"+(j+1);
							matchDict[matchKey] = {
								_id: mongoose.Types.ObjectId(),
								tournamentId: tournament._id,
								bracketId: bracketId,
								matchKey: matchKey,
								createdTime: Date.now()
							}
						}
						numOfMatchesThisRound *= 2;
					}
				} else if(tournament.tournamentType === "doubleElim") {
					innerCallback("doubleElim not yet implimented");
				} else if(tournament.tournamentType === "swiss") {
					innerCallback("swiss not yet implimented");
				} else {
					innerCallback("swiss not yet implimented");
				}
			} catch(err) {
				innerCallback(err);
			}	

			innerCallback(undefined, tournament, playerIds);
		},
		// Get all players with raw and buchholtz scores
		function(playerIds, innerCallback) {
			async.each(playerIds, function(playerId, eachCallback) {
				PlayerSchema.findById(playerId)
				.select("buchholzScore rawScore")
				.exec(function(err, player) {
					if(err) callback(err);
					else if(!player) eachCallback("Unable to find player by id");
					else {
						playerDict[playerId] = player;
						eachCallback();
					}
				});
			}, function(err) {
				innerCallback(err);
			});
		},
		// Sort players by their scores
		function(innerCallback) {
			try {
				// Create a list of player ids from playerDict
				var playerIds = _.map(playerDict, function(value, key) {
					return key;
				});

				// Sort player ids by rawScore and then buchholz score
				var sortedPlayerIds = playerIds.sort(function(id1, id2) {
					var player1 = playerDict[id1];
					var player2 = playerDict[id2];
					if(player1.rawScore !== player2.rawScore) {
						return player1.rawScore - player2.rawScore;
					} else {
						return player1.buchholzScore - player2.buchholzScore;
					}
				});

				innerCallback(undefined, sortedPlayerIds)
			} catch(err) {
				innerCallback(err);
			}	
		},
		// Iterate through new matches and populate losing and winner match Ids
		function(sortedPlayerIds, innerCallback) {
			if(bracket.bracketType === "singleElim") {
				for(var key in matchDict) {
					// If the round is one or less then you're already at the end of the bracket
					var round = tournamentUtil.getBracketRoundFromMatchKey(key);
					if(round <= 1) {
						matchDict[key].winningMatchId = undefined;
					} else {
						var nextMatchId = tournamentUtil.getWinningMatchCoordsForSingleElim(key);
						matchDict[key].winningMatchId = nextMatchId;
					}
				}
			} else if(tournament.tournamentType === "doubleElim") {
				innerCallback("doubleElim not yet implimented");
			} else if(tournament.tournamentType === "swiss") {
				innerCallback("swiss not yet implimented");
			} else {
				innerCallback("swiss not yet implimented");
			}

			innerCallback();
		},
		// Populate the starting matches with players
		function(sortedPlayerIds, innerCallback) {
			try {
				var numOfStartingPlayerSlots = mathUtil.nextPowerOf2(sortedPlayerIds);
				var numOfMatchesFirstRound = tournamentUtil.getNumOfRoundsInWinnerBracket(numOfStartingPlayerSlots);
				var matchIdPrefix = "1"+tournamentConstants.KEY_SEPARATOR+numOfMatchesFirstRound
					 +tournamentConstants.KEY_SEPARATOR;
				
				// Append the empty slots at the end of the sorted array. 
				// This way the best players will get seeded with the worst players 
				// giving them the byes first.
				var numOfEmptyPlayerSlots = numOfStartingPlayerSlots - sortedPlayerIds.length;
				for(var i = 0; i < numOfEmptyPlayerSlots; i++) {
					sortedPlayerIds.push(undefined);
				}

				// Add the player ids to the matches
				for(var i = 0; i < numOfMatchesFirstRound.length; i++) {
					var matchId = matchIdPrefix + (i+1);
					matchDict[matchId].player1Id = sortedPlayerIds.shift();
					matchDict[matchId].player2Id = sortedPlayerIds.pop();
				}

				innerCallback();
			} catch(err) {
				innerCallback(err);
			}
		},
		// Iterate through matches and find ones with byes. Set the winner of 
		// those matches and give players new matches
		function(seriesCallback) {
			try {
				var playerUpdates = {};
				for(var key in matchDict) {
					var match = matchDict[key];

					// Save the matchId to update the player
					playerUpdates[match.player1Id] = match._id

					// If player2 is undefinded then set the matchWinner and assing new match
					if(typeof match.player2Id === "undefined") {
						match.winnerId = match.player1Id;
						var oldMatchKey = match.matchKey
						var nextMatchKey = tournamentUtil.getWinningMatchCoordsForSingleElim(oldMatchKey);
						matchDict[newMatchKey].player1Id = match.player1Id;
						playerUpdates[match.player1Id] = matchDict[newMatchKey]._id;
					} else {
						playerUpdates[match.player2Id] = math._id;
					}
				}
				seriesCallback(playerUpdates);
			} catch(err) {
				seriesCallback(err);
			}
			
		},	
		// Update the players with their current matchIds
		function(playerUpdates, innerCallback) {
			async.forEachObj(playerUpdates, function(matchId, playerId, eachCallback) {
				PlayerSchema.findByIdAndUpdate(playerId, {currentMatchId:matchId}, eachCallback);
			}, innerCallback);
		},
		// Save the matches in the database
		function(innerCallback) {
			async.forEachOf(matchDict, function(match, key, eachCallback) {
				var newMatch = new MatchSchema(matchDict[key]);
				newMatch.save(eachCallback);
			}, innerCallback);
		}], 
	finalCallback);
}


 // MAIN EXPORTS
 module.exports = {
 	createBracket : createBracket,
 	removeBracket : removeBracket,
 	seedBracket : seedBracket
 }