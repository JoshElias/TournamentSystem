var async = require("async");
var mongoose = require("mongoose");
var mathUtil = require("./../util/mathUtil");
var BracketSchema = require("./../model/tournamentBracket");
var PlayerSchema = require("./../model/tournamentPlayer");


function createStartingMatches(bracketId, teamIds, finalCallback) {
	if(typeof bracketId !== "string") {
		finalCallback("Unable to create starting matches with invalid bracketId");
		return;
	}
	if(!Array.isArray(teamIds)) {
		finalCallback("Unable to create starting matches with invalid teamIds")
	}

	var matchDict = {};
	var playerDict = {};

	async.waterfall([
		// Get the associated bracket
		function(seriesCallback) {
			BracketSchema.findById(bracketId)
			.select("bracketType")
			.exec(seriesCallback);
		},	
		// Create the necessary matches
		function(bracket, seriesCallback) {
			try {
				var tournamentSize = mathUtil.nextPowerOf2(teamIds.length);

				if(bracket.bracketType === "singleElim") {
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
		// Get all player's raw and buchholtz scores
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
		}
	],
	finalCallback);
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
						/*
						var loserPlayerId = (winnerId === match.player1Id) ? match.player2Id : match.player1Id;
						if(loserPlayerId) {
							var loseType = loserTypeMap[winType];
							PlayerSchema.findByIdAndUpdate(loserPlayerId, {$push: {matchIdHistory:matchId}, 
								$inc:{loseType:1}, $set:{currentMatchId: match.losingMatchId}}, seriesCallback);
						} else {
							seriesCallback();	
						}	*/
					},
					// Update winner position
					function(innerCallback) {
						/*
						var winnerPlayerId = (winnerId === match.player1Id) ? match.player1Id : match.player2Id;
							PlayerSchema.findByIdAndUpdate(winnerPlayerId, {$push: {matchIdHistory:matchId}, 
								$inc:{winTypeMap[winType]:1}, $set:{currentMatchId: match.winningMatchId}}, seriesCallback);
							});
*/
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