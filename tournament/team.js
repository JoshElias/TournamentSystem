var async = require("async");
var mongoose = require("mongoose");
var TournamentSchema = require("./../model/tournament");
var UserSchema = require("./../model/user");
var TeamSchema = require("./../model/tournamentTeam");
var ManagerSchema = require("./../model/teamManager");
var player = require("./player");




// 	Creates a team on a target tournament
//
// 	userId: (String),
// 	tournamentId: (String),
// 	teamOptions: {
//	
//  }
function createTeam(userId, tournamentId, teamOptions, finalCallback) {
	if(typeof managerId !== "string") {
		finalCallback("Unable to create a team with an invalid manager Id");
		return;
	}
	if(typeof tournamentId !== "string") {
		finalCallback("Unable to create a team with an invalid tournamentId");
		return;
	}


	async.waterfall([
		// Get the associated tournament
		function(seriesCallback) {
			TournamentSchema.findById(tournamentId)
			.select("userIdWhitelist userIdBlacklist regionName gameType managerIds")
			.exec(function(err, tournament) {
				if(err) seriesCallback(err);
				else if(!tournament) seriesCallback("Unable to associated tournament for new team");
				else seriesCallback(undefined, tournament);
			});
		},
		// Check that this user doesn't already manage a team in this tournament
		function(tournament, seriesCallback) {
			if(tournament.managerIds.indexOf(userId) !== -1) {
				seriesCallback("This manager already has a team in this tournament");
			} else {
				seriesCallback(undefined, tournament);
			}
		},
		// Check that this user isn't on the tournament's blacklist
		function(tournament, seriesCallback) {
			UserSchema.findById(userId)
			.select("paypalID tournamentBlacklisted")
			.exec(function(err, user) {
				if(err) seriesCallback(err);
				else if(!user) seriesCallback("Unable to add team with invalid user Id");
				else {
					if(tournament.userWhitelist.indexOf(userId) !== -1) {
						callback(undefined, tournament);
					} else if(user.tournamentBlacklisted
					|| tournament.playerBlacklist.indexOf(userId) !== -1) {
						callback("Cannot add player. User is blacklisted");
					} else {
						callback(undefined, tournament, user);
					}
				}
			});	
		},
		// Check that the manager has linked their paypal account
		function(tournament, user, seriesCallback) {
			if(typeof user.paypalID !== "string" || user.paypalID.length < 1) {
				callback("User needs to link their paypal account");
			} else {
				callback(undefined, tournament, user);
			}
		},
		// Create the manager for the team
		function(tournament, user, seriesCallback) {
			var teamId = mongoose.Types.ObjectId();
			var newManager = new ManagerSchema({
				userId: userId,
  				teamId: teamId,
  				tournamentId: tournamentId
  			});
  			newManager.save(function(err, manager) {
  				if(err) seriesCallback(err);
  				else {
  					seriesCallback(undefined, tournament, user, managerId);
  				}
  			})
		},
		// Create the team
		function(tournament, user, managerId, seriesCallback) {

			var teamFields = {
				managerId: managerId,
				regionName: tournament.regionName
			}

			if(typeof teamOptions === "object") {
				teamFields.name = (typeof teamOptions.name === "string") teamOptions.name : "Default Team Name",
				teamFields.description = (typeof teamOptions.description === "string") teamOptions.description : "",
			}

			var newTeam = new TeamSchema(teamFields);
			newTeam.save(function(err, newTeam) {
				seriesCallback(err, tournament, user, newTeam);
			});
		},
		// Should we automatically create a player for the manager?
		function(tournament, user, newTeam, seriesCallback) {		
			if(tournament.gameType === "hearthstone") {
				player.createPlayer(userId, newTeam._id, function(err, newPlayer) {
					seriesCallback(err, )
				});
			} else {
				seriesCallback(undefined, tournament, user);
			}
		},
		// Update the associated tournament with this team
		function(seriesCallback) {
			TournamentSchema.findByIdAndUpdate(tournamentId, {$push:{teamIds:newTeam._id}}, function(err, tournament) {
				seriesCallback(err, tournament);
			});
		}],
	function(err) {

	});

}