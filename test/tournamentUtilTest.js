var assert = require("assert");
var tournamentUtil = require("./../util/tournamentUtil");


var TOTAL_NUM_PLAYERS_1 = 16;
var TOTAL_NUM_PLAYERS_2 = 32;
var TOTAL_NUM_PLAYERS_3 = 64;

describe("Tournament Utilities", function() {

	describe("getNumOfRoundsInWinnerBracket", function() {
		it("should output 5 rounds", function() {
			assert.equal(5, tournamentUtil.getNumOfRoundsInWinnerBracket(TOTAL_NUM_PLAYERS_1));
		});
		it("should output 6 rounds", function() {
			assert.equal(6, tournamentUtil.getNumOfRoundsInWinnerBracket(TOTAL_NUM_PLAYERS_2));
		});
		it("should output 7 rounds", function() {
			assert.equal(7, tournamentUtil.getNumOfRoundsInWinnerBracket(TOTAL_NUM_PLAYERS_3));
		});
	});

	describe("getNumOfRoundsInLoserBracket", function() {
		it("Number of rounds in loser bracket for 16 people is 7", function() {
			assert.equal(7, tournamentUtil.getNumOfRoundsInLoserBracket(16));
		});
		it("Number of rounds in loser bracket for 8 people is 5", function() {
			assert.equal(5, tournamentUtil.getNumOfRoundsInLoserBracket(8));
		});
	});

	describe("getWinningRoundNumFromWinnerBracket", function() {
		it("Round number for winning round 5 in winner bracket is 4", function() {
			assert.equal(4, tournamentUtil.getWinningRoundNumFromWinnerBracket(5));
		});
		it("Round number for winning round 8 in winner bracket is 7", function() {
			assert.equal(4, tournamentUtil.getWinningRoundNumFromWinnerBracket(5));
		});
		it("Round number for winning round 1 in winner bracket is 1", function() {
			assert.equal(1, tournamentUtil.getWinningRoundNumFromWinnerBracket(1));
		});
	});

	describe("getLosingRoundNumFromWinnerBracket", function() {
		it("Round number for losing round 5 is 7", function() {
			assert.equal(7, tournamentUtil.getLosingRoundNumFromWinnerBracket(5));
		});
		it("Round number for losing round 6 is 9", function() {
			assert.equal(4, tournamentUtil.getLosingRoundNumFromWinnerBracket(3));
		});
		it("Round number for losing round 8 is 13", function() {
			assert.equal(9, tournamentUtil.getLosingRoundNumFromWinnerBracket(6));
		});
		it("Round number for losing round 2 is 2", function() {
			assert.equal(2, tournamentUtil.getLosingRoundNumFromWinnerBracket(2));
		});
	});
});
