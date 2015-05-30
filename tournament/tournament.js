var async = require("async");
var mongoose = require("mongoose");
var UserSchema = require("./../model/user");
var TournamentSchema = require("./../model/tournament");
var PlayerSchema = require("./../model/player");


// Constants
var REGIONS = ["na", "eu"];


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
function createTournament( adminId, data, finalCallback ) {	
	// Validate arguments
	if(typeof adminId !== "string") {
		finalCallback("Can't create tournament with invalid user id");
		return;
	}
	if(typeof data !== "object") {
		finalCallback("Can't create tournament with no data");
		return;
	}
	if(typeof data.startTime !== "number") {
		finalCallback("Can't create tournament with no start time");
		return;
	}

	// Clean arguments
	var tournamentArgs = {
		creator : adminId,
		startTime : new Date(data.startTime),
		admins : (!Array.isArray(data.admins)) ? [adminId] : data.admins,
		name: (typeof data.name !== "string") ? "Unnamed Tournament" : data.name,
		regionName: (typeof data.regionName !== "string" 
			|| REGIONS.indexOf(data.regionName) === -1) ? "na" : data.regionName,
		description: (typeof data.description !== "string") ? "" : data.description,
		prizePool: (!Array.isArray(data.prizePool)) ? [] : data.prizePool,
		numOfDecks: (typeof data.numOfDecks !== "number") ? 1 : data.numOfDecks,
		numOfDeckBans: (typeof data.numOfDeckBans !== "number") ? 0 : data.numOfDeckBans,
		decksPerClass: (typeof data.decksPerClass !== "number") ? 1 : data.decksPerClass,
		bestOf: (typeof data.bestOf !== "number") ? 1 : data.bestOf,
		cardBans: (!Array.isArray(data.cardBans)) ? [] : data.cardBans,
		creationTime: new Date()
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




module.exports = {
	createTournament : createTournament,
	addPlayer : addPlayer
}