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
