 var assert = require("assert");
var mongoose = require("mongoose");
var tournament = require("./../tournament/tournament");

describe("Tournament Tests", function() {

	describe("createTournament", function() {
		var testTournamentId;
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

			tournament.createTournament("558c4b58d9c7ff69bd0da9af", testTournamentOptions, testGameOptions, function(err, newTournament) {
				if(err) done(err);
				else {
					testTournamentId = newTournament._id;
					done();
				}
			});
		})
		after(function(done) {
			var TournamentSchema = require("./../model/tournament");
			TournamentSchema.findById(testTournamentId).remove(done);
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
	})
});