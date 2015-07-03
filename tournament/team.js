var async = require("async");
var mongoose = require("mongoose");
var TournamentSchema = require("./../model/tournament");
var UserSchema = require("./../model/user");
var PlayerSchema = require("./../model/tournamentPlayer");
var TeamSchema = require("./../model/tournamentTeam");
var ManagerSchema = require("./../model/teamManager");
var BracketSchema = require("./../model/tournamentBracket");
var player = require("./player");




// 	Creates a team on a target tournament
//
// 	userId: (String),
// 	tournamentId: (String),
// 	teamOptions: {
//		name: (String)
// 		description: (String)
//  }
function createTeam(userId, tournamentId, teamOptions, finalCallback) {
	if(typeof userId !== "string") {
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
					if(tournament.userIdWhitelist.indexOf(userId) !== -1) {
						seriesCallback(undefined, tournament);
					} else if(user.tournamentBlacklisted
					|| tournament.userIdBlacklist.indexOf(userId) !== -1) {
						seriesCallback("Cannot add player. User is blacklisted");
					} else {
						seriesCallback(undefined, tournament, user);
					}
				}
			});	
		},
		// Check that the manager has linked their paypal account
		function(tournament, user, seriesCallback) {
			if(typeof user.paypalID !== "string" || user.paypalID.length < 1) {
				seriesCallback("User needs to link their paypal account");
			} else {
				seriesCallback(undefined, tournament, user);
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
  					seriesCallback(undefined, tournament, user, manager._id.toString());
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
				teamFields.name = (typeof teamOptions.name === "string") ? teamOptions.name : "Default Team Name";
				teamFields.description = (typeof teamOptions.description === "string") ? teamOptions.description : "";
			}

			var newTeam = new TeamSchema(teamFields);
			newTeam.save(function(err, newTeam) {
				seriesCallback(err, tournament, user, newTeam);
			});
		},
		// Should we automatically create a player for the manager?
		function(tournament, user, newTeam, seriesCallback) {		
			if(tournament.gameType === "hearthstone") {
				console.log("Creating player");
				console.log(newTeam);
				player.createPlayer(userId, newTeam._id.toString(), function(err, newPlayer) {
					seriesCallback(err, tournament)
				});
			} else {
				seriesCallback(undefined, newTeam);
			}
		},
		// Update the associated tournament with this team
		function(newTeam, seriesCallback) {
			TournamentSchema.findByIdAndUpdate(tournamentId, {$push:{teamIds:newTeam._id}}, function(err, tournament) {
				seriesCallback(err, newTeam);
			});
		}],
	function(err, newTeam) {
		console.log("Finito team making");
		console.log(newTeam);
		finalCallback(err, newTeam);
	});
}


// 	Removes a team from a tournament with the id provided
//
// 	managerId: (String),
// 	teamId: (String),
// 	finalCallback: (Function) (err)
//
function removeTeam(managerId, teamId, finalCallback) {
	if(typeof managerId !== "string") {
		finalCallback("Unable to remove team with invalid managerId");
		return;
	}
	if(typeof teamId !== "string") {
		finalCallback("Unable to remove team with invalid teamId");
		return;
	}


	async.waterfall([
		// Get the associated team
		function(seriesCallback) {
			TeamSchema.findById(teamId)
			.select("managerId playerIds bracketId tournamentId")
			.exec(function(err, team) {
				if(err) seriesCallback(err);
				else if(!team) seriesCallback("Unable to find a team with the id provided");
				else seriesCallback(undefined, team);
			});
		},
		// Check if the manager is valid
		function(team, seriesCallback) {
			if(managerId !== team.managerId) {
				seriesCallback("Unable to remove team with invalid managerId");
			} else {
				seriesCallback(undefined, team);
			}
		},
		// Delete all the players associated with this team
		function(team, seriesCallback) {
			async.eachSeries(team.playerIds, function(playerId, eachCallback) {
				PlayerSchema.remove({_id:playerId}, eachCallback);
			}, function(err) {
				seriesCallback(err, team);
			});
		},
		// Delete the manager of this team
		function(team, seriesCallback) {
			ManagerSchema.remove({_id:team.managerId}, function(err) {
				seriesCallback(err, team);
			});
		},
		// Remove this team from it's current bracket
		function(team, seriesCallback) {
			if(typeof team.bracketId === "string" && team.bracketId.length > 0) {
				BracketSchema.findByIdAndUpdate(team.bracketId, {$pull:{teamIds:teamId}}, function(err) {
					seriesCallback(err, team);
				});
			} else {
				seriesCallback(undefined, team);
			}
		},
		// Finally, remove this team from the current tournament
		function(team, seriesCallback) {
			if(typeof team.tournamentId === "string" && team.tournamentId.length > 0) {
				TournamentSchema.findByIdAndUpdate(team.tournamentId, {$pull:{teamIds:teamId}}, function(err) {
					seriesCallback(err, team);
				});
			} else {
				seriesCallback(undefined, team);
			}
		}],
	function(err) {
		finalCallback(err);
	});
}

// MAIN EXPORTS
module.exports = {
	createTeam : createTeam,
	removeTeam : removeTeam
}