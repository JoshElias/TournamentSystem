var async = require("async");
var UserSchema = require("./../model/user");
var TournamentSchema = require("./../model/tournament");
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
	if(typeof teamId !== "string") {
		finalCallback("Can't add player with no team id")
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
				else {
					console.log("Dat team do");
					console.log(team);
					seriesCallback(undefined, team.tournamentId);
				}
			});
		},
		// Check that this user hasn't already created a player for this tournament
		function(tournamentId, seriesCallback) {
			PlayerSchema.count({user:userId, $or:[{tournamentId:tournamentId}, {teamId:teamId}]}, function(err, count) {
				if(err) seriesCallback(err);
				else if(count > 0) {
					seriesCallback("This user has already created a player for this tournament");
				} else {
					seriesCallback(undefined, tournamentId);
				}
			});
		},
		// Check that user has a valid tempostorm account
		function(tournamentId, callback) {
			UserSchema.findById(userId)
			.select("bnetID paypalID tournamentBlacklisted")
			.exec(function(err, user) {
				if(err) {
					callback(err);
				} else if(typeof user === "undefined") {
					callback("Could not find user with provided id");
				} else {
					callback(undefined, tournamentId, user);
				}
			});
		},
		// Get the associated tournament
		function(tournamentId, user, callback) {
			TournamentSchema.findById(tournamentId)
			.select("userIdBlacklist userIdWhitelist regionName")
			.exec(function(err, tournament) {
				if(err) callback(err);
				else if(!tournament) callback("Unable to find tournament to associated with this team");
				else {
					console.log("Rainbow sunshine lollipops");
					console.log(tournament);
					callback(undefined, user, tournament);
				}
			});
		},
		// Check if the user has been tournament blacklisted
		function(user, tournament, callback) {
			if(tournament.userIdWhitelist.indexOf(userId) !== -1) {
				callback(undefined, tournament);
			} else if(user.tournamentBlacklisted
				|| tournament.userIdBlacklist.indexOf(userId) !== -1) {
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


function removePlayer(playerId, finalCallback) {
	if(typeof playerId !== "string") {
		finalCallback("Unable to remove player with invalid playerId");
		return;
	}

	async.waterfall([
		// Get the associated player
		function(seriesCallback) {
			PlayerSchema.findById(playerId)
			.select("teamId")
			.exec(function(err, player) {
				if(err) seriesCallback(err);
				else if(!player) seriesCallback("Unable to find player with the id provided");
				else seriesCallback(undefined, player);
			})
		},
		// Remove the player from the team
		function(player, seriesCallback) {
			TeamSchema.findByIdAndUpdate(player.teamId, {$pull:{playerIds:playerId}}, function(err) {
				seriesCallback(err, player);
			})
		}],
	function(err) {
		finalCallback(err);
	});
}

// MAIN EXPORTS
module.exports = {
	createPlayer : createPlayer,
	removePlayer : removePlayer
}