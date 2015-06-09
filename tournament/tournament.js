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


// Creates a player for a tournament in the database with the arguments provided.
//	
// 	userId : (String),
// 	tournamentId: (String),
// 	finalCallback : (Callback) // (err, newPlayer)
//
function addPlayer( userId, tournamentId, finalCallback ) {
	// Validate arguments
	if(typeof userId !== "string") {
		finalCallback("Can't add player with no user id");
		return;
	}
	if(typeof tournamentId !== "string") {
		res.json({err: "Can't add player with no tournament id"})
		return;
	}

	async.waterfall([
		// Check that this user hasn't already created a player for this tournament
		function(callback) {
			PlayerSchema.count({user:userId, tournament:tournamentId}, function(err, count) {
				if(err) callback(err);
				else if(count > 0) {
					callback("This user has already created a player for this tournament");
				} else {
					callback();
				}
			});
		},
		// Check that user has a valid tempostorm account
		function(callback) {
			UserSchema.findById(userId)
			.select("bnetID paypalID tournamentBlacklisted")
			.exec(function(err, user) {
				if(err) {
					callback(err);
				} else if(typeof user === "undefined") {
					callback("Could not find user with provided id");
				} else {
					callback(undefined, user);
				}
			});
		},
		// Check that user has linked their battle.net account
		function(user, callback) {
			if(typeof(user.bnetID) !== "string" || user.bnetID.length < 1) {
				callback("User needs to link their battle.net account");
			} else {
				callback(undefined, user);
			}
		},
		// Check that user has linked their paypal account
		function(user, callback) {
			if(typeof user.paypalID !== "string" || user.paypalID.length < 1) {
				callback("User needs to link their paypal account");
			} else {
				callback(undefined, user);
			}
		},
		// Get the associated tournament
		function(user, callback) {
			TournamentSchema.findById(tournamentId)
			.select("playerBlacklist playerWhitelist regionName")
			.exec(function(err, tournament) {
				if(err) callback(err);
				else if(typeof tournament === "undefined") {
					callback("Failed to find tournament to associate this player");
				} else {
					callback(undefined, user, tournament);
				}
			});
		},
		// Check if the user has been tournament blacklisted
		function(user, tournament, callback) {
			if(tournament.playerWhitelist.indexOf(userId) !== -1) {
				callback(undefined, tournament);
			} else if(user.tournamentBlacklisted
				|| tournament.playerBlacklist.indexOf(userId) !== -1) {
				callback("Cannot add player. User is blacklisted");
			} else {
				callback(undefined, tournament);
			}
		},
		// Create the player
		function(tournament, callback) {
			var newPlayer = new PlayerSchema({
				user: userId,
				tournament: tournamentId,
				regionName: tournament.regionName,
				creationTime: new Date()
			});

			newPlayer.save(function(err) {
				callback(err, tournament, newPlayer);
			});
		}, 
		// Add Player to tournament
		function(tournament, newPlayer, callback) {
			TournamentSchema.findByIdAndUpdate(tournament._id, {$push:{players:newPlayer._id}}, function(err, tournament) {
				callback(err, newPlayer);
			});
		}
	], finalCallback);
}

function addBracket( adminId, tournamentId, options, finalCallback ) {
	// Validate arguments
	if(typeof adminId !== "string") {
		finalCallback("Can't add bracket with invalid admin id");
		return;
	}
	if(typeof tournamentId !== "string") {
		finalCallback("Can't add bracket with invalid tournament id");
		return;
	}
	if(typeof options !== "object") {
		finalCallback("Options must be an object");
		return;
	}

	// Clean arguments
	var bracketArgs = {
		creator : adminId,
		bracketType: (typeof options.bracketType !== "string") ? "singleElim" : bracketType,
		name: (typeof options.name !== "string") ? "Unnamed Bracket" : options.name,
		description: (typeof options.description !== "string") ? "" : options.description,
		tournamentId: tournamentId,
		prizePool: (!Array.isArray(options.prizePool)) ? [] : options.prizePool,
		numOfDecks: (typeof options.numOfDecks !== "number") ? 1 : options.numOfDecks,
		numOfDeckBans: (typeof options.numOfDeckBans !== "number") ? 0 : options.numOfDeckBans,
		decksPerClass: (typeof options.decksPerClass !== "number") ? 1 : options.decksPerClass,
		bestOf: (typeof options.bestOf !== "number") ? 1 : options.bestOf,
		cardBanIds: (!Array.isArray(options.cardBans)) ? [] : options.cardBans,
		creationTime: Date.now()
	}

	async.waterfall([
		// Check if this user has admin rights to this tournament
		function(seriesCallback) {
			validateAdminId(adminId, tournamentId);
		},
		// Create bracket
		function(seriesCallback) {
			var newBracket = new BracketSchema(bracketArgs);
			newBracket.save(function(err) {
				callback(err, newBracket);
			});
		},
		// Add bracket to tournament
		function(newBracket, seriesCallback) {	
			TournamentSchema.findByIdAndUpdate(tournamentId, {$push:{bracketIds:newBracket._id}}, seriesCallback);
		},
		// Check if this deck this tournament has starting and ending bracket id
		function(seriesCallback) {
			TournamentSchema.findById(tournamnetId)
			.select("startingBracketId endingBracketId")
			.exec(function(err, tournamnent) {
				if(err) seriesCallback(err);
				else {
					var tournamentChanges = {};
					if(typeof tournamnet.startingBracketId === "undefined" || tournament.startingBracketId === "") {
						tournamentChanges.startingBracketId = bracketId
					}
					if(typeof tournamnet.endingBracketId === "undefined" || tournamnet.endingBracketId === "") {
						tournamentChanges.endingBracketId = bracketId;
					}
					seriesCallback(undefined, tournamentChanges);
				}
			});
		},
		// Update the starting and ending bracket id if need be
		function(tournamentChanges, seriesCallback) {
			if(_.isEmpty(tournamentChanges)) {
				seriesCallback();
			} else {
				TournamentSchema.findByIdAndUpdate(tournamentId, tournamentChanges, seriesCallback);
			}
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
				console.log("Tournament size: "+tournamentSize);

				if(tournament.tournamentType === "singleElim") {
					var numOfRounds = tournamentUtil.getNumOfRoundsInWinnerBracket(tournamentSize);
					var numOfMatchesThisRound = 1;
					for(var i = 0; i < numOfRounds; i++) {	
						for(var j = 0; j < numOfMatchesThisRound, j++) {
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


function calculateBuchholzScore( playerId, finalCallback ) {
	if(!Array.isArray(playerIds)) {
		finalCallback("Unable to rank players with invalid array");
		return;
	}

	async.waterfall([
		// Get the bracket that this player belongs to
		function(callback) {
			PlayerSchema.findById(playerId)
			.select("bracketId")
			.exec(function(err, player) {
				callback(err, player.bracketId);
			});
		},
		// Get all the player ids from this bracket
		function(bracketId, callback) {
			var playerDict = {};
			BracketSchema.findById(bracketId)
			.select("playerIds")
			.populate("playerIds")
			.exec(function(err, bracket) {
				if(err) callback(err);
				else if(!bracket) callback()
				else {
					// Cache the player data locally for fast reference
					for(var i = 0; i < bracket.playerIds.length; i++) {
						var player = bracket.playerIds[i];
						playerDict[player._id] = player;
					}
					callback(undefined, playerDict);
				}
			});
		},
		// Iterate through players and generate buchholtz score based on their opponents
		function(playerDict, callback) {
			var player = playerDict[playerId];

			async.waterfall([
				// Get opponent entry for each match descibing win or loss
				function(seriesCallback) {
					var opponentEntries = [];	
					async.each(player.matchHistory, function(matchId, eachCallback) {
						MatchSchema.findById(matchId)
						.select("player1Id player2Id")
						.exec(function(err, match) {
							if(err) eachCallback(err);
							else {
								var opponentEntry = {
									result: (match.winnerId === playerId)
								};
								if(match.player1Id === playerId) {
									opponentEntry.opponentId = match.player2Id;
								} else if(match.player2Id === playerId) {
									opponentEntry.opponentId = match.player1Id;
								} else {
									seriesCallback("Unable to find player in match");
									return;
								}
								opponentEntries.push(opponentEntry);
								eachCallback();
							}
						});
					}, function(err) {
						seriesCallback(err, opponentEntries);
					});
				},
				// Sort	the opponents by raw score, do average	
				function(opponentEntries, seriesCallback) {
					try {

						// Sort opponents by raw score
						var opponentIds = _.map(opponentEntries, function(value, key) {
							return value.opponentId;
						})
						var sortedOpponentIds = _.sortBy(opponentIds, function(opponentId) {
							return playerDict[opponentId].rawScore;
						});

						// Get average score of all team mates
						var scoreTotal = 0;
						for(var i = 0; i < sortedOpponentIds; i++) {
							scoreTotal += playerDict[sortedOpponentIds].rawScore;
						}
						scoreTotal += player.rawScore;
						var averageScore = scoreTotal/(sortedOpponentIds+1);

						// Calculate Buchholz score
						var buchholzScore = 0;
						if(player.rawScore > averageScore) {
							sortedOpponentIds.shift();
						} else if(player.rawScore < averageScore) {
							sortedOpponentIds.pop();
						} else {
							sortedOpponentIds.shift();
							sortedOpponentIds.pop();
						}	
						// After filtering top and bottom opponent scores, recalculate score
						for(var i = 0; i < sortedOpponentIds; i++) {
							if(sortedOpponentIds.result) {
								buchholzScore++;
							}
						}

						seriesCallback(undefined, buchholzScore);
					} catch(err) {
						seriesCallback(err);
					}
				},
				// Update the player's buchholz score
				function(buchholzScore, seriesCallback) {
					playerDict[playerId].buchholzScore = buchholzScore;
					PlayerSchema.findByIdAndUpdate(playerId, {buchholzScore:buchholzScore}, function(err, result) {
						seriesCallback(err);
					});
				}],
			function(err, results) {
				callback(err, playerDict);
			});
		}],
	function(err, playerDict) {
		if(err) finalCallback(err);
		else {
			// Sort player Ids by buccholz score
			var playerIds = _.map(playerDict, function(value, key) {
				return value.opponentId;
			})
			var sortedPlayerIds = _.sortBy(playerIds, function(playerId) {
				return playerDict[playerId].buchholzScore;
			});
			finalCallback(undefined, sortedPlayerIds);
		}
	});
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

function validateAdminId(userId, tournamentId, finalCallback) {
	TournamentSchema.findById(tournamentId)
	.select("adminIds")
	.exec(function(err, tournament) {
		if(err) callback(err);
		else if(!tournament) {
			finalCallback("Could not find user with provided id");
		} else if(tournament.adminIds.indexOf(userId) === -1) {
			finalCallback("This user is not an admin to this tournamnet")
		} else {
			finalCallback();
		}
	});
}


module.exports = {
	createTournament : createTournament,
	addPlayer : addPlayer
}