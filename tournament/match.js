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