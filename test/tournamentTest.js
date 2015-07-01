 var assert = require("assert");
var mongoose = require("mongoose");
var tournament = require("./../tournament/tournament");
var bracket = require("./../tournament/bracket");


describe("Tournament Tests", function() {

	var TEST_ADMIN_ID = "558c4b58d9c7ff69bd0da9af";
	var testTournamentId;
	var testBracketId;

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
					testBracketId = newBracket._id;
					done();
				}
			});
		})
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