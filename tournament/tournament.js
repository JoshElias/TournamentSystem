var async = require("async");
var mongoose = require("mongoose");
var mathUtil = require("./util/mathUtil");
var tournamentUtil = require("./util/tournamentUtil");
var UserSchema = require("./../model/user");
var TournamentSchema = require("./../model/tournament");
var PlayerSchema = require("./../model/player");
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
		function(callback) {
			validateAdminId(adminId, tournamentId);
		},
		// Create bracket
		function(callback) {
			var newBracket = new BracketSchema(bracketArgs);
			newBracket.save(function(err) {
				callback(err, newBracket);
			});
		},
		// Add bracket to tournament
		function(newBracket, callback) {	
			TournamentSchema.findByIdAndUpdate(tournamentId, {$push:{bracketIds:newBracket._id}}, function(err, results) {
				callback(err);
			});
		}],
	function(err, results) {
		finalCallback(err);
	});

}

function seedBracket(bracketId, finalCallback) {
	// Validate arguments
	if(typeof bracketId !== "object") {
		finalCallback("Can't seed bracket with invalid id");
		return;
	}

	async.waterfall([
		// Get the associated tournament
		function(callback) {
			BracketSchema.findById(bracketId)
			.populate("tournamnetId")
			.exec(function(err, bracket) {
				callback(err, bracket.tournamentId);
			});
		},
		// Create the necessary matches
		function(tournament, callback) {
			try {
				console.log("Number of players registered for tournament: "+tournament.players.length);
				var tournamentSize = mathUtil.lastPowerOf2(tournament.players.length);
				console.log("Tournament size: "+tournamentSize);

				var matchDict = {};
				if(tournament.tournamentType === "singleElim") {
					var numOfRounds = tournamentUtil.getNumOfRoundsInWinnerBracket(tournamentSize);
					var numOfMatchesThisRound = 1;
					for(var i = 0; i < numOfRounds; i++) {	
						for(var j = 0; j < numOfMatchesThisRound, j++) {
							var matchCoordinates = "1::"+(i+1)+"::"+(j+1);
							matchDict[matchCoordinates] = {
								tournamentId: tournament._id,
								bracketId: bracketId,
								coordinates: matchCoordinates,
								createdTime: Date.now()
							}
						}
						numOfMatchesThisRound *= 2;
					}
				} else if(tournament.tournamentType === "doubleElim") {

				} else if(tournament.tournamentType === "swiss") {

				} else {

				}
			} catch(err) {
				callback(err);
			}	

			callback(undefined, matchDict);
		},
		// Create  
		function(matchDict, callback) {

			for(var key in matchDict) {
				tournamentUtil.get
			}
			
		},
		// Populate the matches necessary for the tournament type
		function(tournament, callback) {
			tournament.tournamentType 
		}],
	function(err, results) {

	});



}

function startTournament( tournamentId, finalCallback ) {
	if(typeof tournamnetId !== "string") {
		finalCallback("Can't start tournament with invalid id");
		return;
	}

	async.waterfall([
		// Get the tournament with the id provided
		function(callback) {
			TournamentSchema.findById(tournamentId, function(err, tournament) {
				if(err) callback(err);
				else if(!tournament) callback("Unable to find tournament with id provided");
				else callback(undefined, tournament);
			});
		},
		// Add matches for the tournament
		function(tournament, callback) {
			addMatchesForTournament(tournament, callback);
		},
		// Populate the matches necessary for the tournament type
		function(tournament, callback) {
			tournament.tournamentType 
		}],
	function(err, results) {

	});
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