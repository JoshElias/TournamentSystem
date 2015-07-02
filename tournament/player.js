var PlayerSchema = require("./../model/tournamentPlayer");
var TeamSchema = require("./../model/tournamentTeam");


// Creates a player for a tournament in the database with the arguments provided.
//	
// 	userId : (String),
// 	teamId: (String),
// 	finalCallback : (Callback) // (err, newPlayer)
//
function createPlayer( userId, teamId, finalCallback ) {
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
		// Get the associated Team
		function(seriesCallback) {
			TeamSchema.findById(teamId)
			.select("tournamentId")
			.exec(function(err, team) {
				if(err) seriesCallback(err);
				else if(!team) seriesCallback("Unable to add player with invalid teamId");
				else seriesCallback(undefined, tournamentId);
			});
		},
		// Check that this user hasn't already created a player for this tournament
		function(tournamentId, seriesCallback) {
			PlayerSchema.count({user:userId, $or:[{tournamentId:tournamentId}, {teamId:teamId}]}, function(err, count) {
				if(err) seriesCallback(err);
				else if(count > 0) {
					seriesCallback("This user has already created a player for this tournament");
				} else {
					seriesCallback();
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
				callback(undefined, tournament, user);
			}
		},
		// Check that user has linked their battle.net account
		function(tournament, user, callback) {
			if(typeof(user.bnetID) !== "string" || user.bnetID.length < 1) {
				callback("User needs to link their battle.net account");
			} else {
				callback(undefined, tournament, user);
			}
		},
		// Check that user has linked their paypal account
		function(tournament, user, callback) {
			if(typeof user.paypalID !== "string" || user.paypalID.length < 1) {
				callback("User needs to link their paypal account");
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
		// Add Player to team
		function(tournament, newPlayer, callback) {
			TeamSchema.findByIdAndUpdate(teamId, {$push:{playerIds:newPlayer._id}}, function(err, tournament) {
				callback(err, newPlayer);
			});
		}
	], finalCallback);
}

// MAIN EXPORTS
module.exports = {
	createPlayer : createPlayer
}