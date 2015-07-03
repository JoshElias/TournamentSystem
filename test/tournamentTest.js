 var assert = require("assert");
var mongoose = require("mongoose");
var tournament = require("./../tournament/tournament");
var bracket = require("./../tournament/bracket");
var player = require("./../tournament/player");
var team = require("./../tournament/team");




describe("Tournament Tests", function() {

	var TEST_ADMIN_ID = "559704b443e8683e296ce153";
	var TEST_USER_ID = "5596cc4a43e8683e296ce150";
	var testTournamentId;
	var testBracketId;
	var testTeamId;
	var testPlayerId;

	describe("createTournament", function() {
		it("Should create a tournament", function(done) {
			var testTournamentOptions = {
				name: "Test Tournament",
				description: " test description",
				startTime : Date.now(),
				regionName: "na",
				gameType : "hearthstone",
				teamSize: 1,
				bestOf: 1,
				prizePool: []
			}

			var testGameOptions = {
				gameType: "hearthstone",
				numOfDecks: 2,
				numOfDeckBans : 1,
				decksPerClass: 1,
				cardBanIds: []
			}

			tournament.createTournament(TEST_ADMIN_ID, testTournamentOptions, testGameOptions, function(err, newTournament) {
				if(err) done(err);
				else {
					testTournamentId = newTournament._id.toString();
					done();
				}
			});
		});
	});

	describe("failedCreateTournament", function() {
		it("Should fail to create tournament due to no gameType", function(done) {
			var testTournamentOptions = {
				name: "Test Tournament",
				regionName: "na",
				prizePool: []
			}

			var testGameOptions = {
				numOfDeckBans : 1,
				decksPerClass: 1,
				cardBanIds: []
			}

			tournament.createTournament(mongoose.Types.ObjectId().toString(), testTournamentOptions, testGameOptions, function(err, newTournament) {
				if(err) done();
				else {
					done("Should not have successfully created tournament");
				}
			});
		});

		it("Should fail to create tournament due to invalid userId", function(done) {
			var testTournamentOptions = {
				name: "Test Tournament",
				description: " test description",
				startTime : Date.now(),
				regionName: "na",
				gameType : "hearthstone",
				teamSize: 1,
				bestOf: 1,
				prizePool: []
			}

			var testGameOptions = {
				gameType: "hearthstone",
				numOfDecks: 2,
				numOfDeckBans : 1,
				decksPerClass: 1,
				cardBanIds: []
			}

			tournament.createTournament("fuckingWRONGId", testTournamentOptions, testGameOptions, function(err, newTournament) {
				if(err) done();
				else {
					done("Should not have successfully created tournament");
				}
			});
		});
	});

	describe("createBracket", function() {
		it("Should create a bracket", function(done) {
			var testBracketOptions = {
				name: "Bracket Tournament",
				description: " test description",
				gameType: "hearthstone",
				startTime : Date.now(),
				prizePool: [],
				bestOf: 3
			}

			bracket.createBracket(TEST_ADMIN_ID, testTournamentId, testBracketOptions, {}, function(err, newBracket) {
				if(err) done(err);
				else {
					testBracketId = newBracket._id.toString();
					done();
				}
			});
		})
	});

	describe("createTeam", function() {
		it("Should create a team", function(done) {
			var teamOptions = {
				name : "Josh's bomb team of bombness",
				description: "...WE...da........bomb?"
			};

			team.createTeam(TEST_ADMIN_ID, testTournamentId, teamOptions, function(err, newTeam) {
				if(err) done(err);
				else {
					testTeamId = newTeam._id.toString();
					done();
				}
			})
		});
	});

	describe("createPlayer", function() {
		it("Should create a player", function(done) {
			player.createPlayer(TEST_USER_ID, testTeamId, function(err, newPlayer) {
				if(err) done(err);
				else {
					testPlayerId = newPlayer._id.toString();
					done();
				}
			});
		});
	});

	describe("removePlayer", function() {
		it("Should remove the player", function(done) {
			player.removePlayer(testPlayerId, function(err) {
				if(err) done(err);
				else done();
			});
		});
	});

	describe("removeTeam", function() {
		it("Should remove the team", function(done) {
			team.removeTeam(TEST_ADMIN_ID, testTeamId, function(err) {
				if(err) done(err);
				else done();
			})
		});
	});

	describe("removeBracket", function() {
		it("Should remove a bracket", function(done) {
			bracket.removeBracket(TEST_ADMIN_ID, testBracketId.toString(), function(err) {
				if(err) {
					console.log("ERR REMOVING BRACKET");
					console.log(err);
					done(err);
				} else {
					done();
				}
			});
		});
	})

});