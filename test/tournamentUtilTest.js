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
		it("Round number for losing round 5 in winner bracket of 16 people is 7", function() {
			assert.equal(7, tournamentUtil.getLosingRoundNumFromWinnerBracket(16, 5));
		});
		it("Round number for losing round 8 in winner bracket of 256 people is 14", function() {
			assert.equal(14, tournamentUtil.getLosingRoundNumFromWinnerBracket(256, 8));
		});
		it("Round number for losing round 2 in winner bracket of 4 people is 2", function() {
			assert.equal(2, tournamentUtil.getLosingRoundNumFromWinnerBracket(4, 2));
		});
	});

	describe("getWinningMatchNumFromWinnerBracket", function() {
		it("Winning match number for winner bracket after 1 is 1", function() {
			assert.equal(1, tournamentUtil.getWinningMatchNumFromWinnerBracket(1));
		});
		it("Winning match number for winner bracket after 4 is 2", function() {
			assert.equal(2, tournamentUtil.getWinningMatchNumFromWinnerBracket(4));
		});
		it("Winning match number for winner bracket after 8 is 4", function() {
			assert.equal(4, tournamentUtil.getWinningMatchNumFromWinnerBracket(8));
		});
	});

	describe("getLosingMatchNumFromWinnerBracket", function() {
		it("Losing match number for winner bracket of 16 people after 1 is 1", function() {
			assert.equal(1, tournamentUtil.getWinningMatchNumFromWinnerBracket(16, 1));
		});
		it("Losing match number for winner bracket of 16 people after 4 is 2", function() {
			assert.equal(2, tournamentUtil.getWinningMatchNumFromWinnerBracket(16, 4));
		});
		it("Losing match number for winner bracket of 16 people after 8 is 4", function() {
			assert.equal(4, tournamentUtil.getWinningMatchNumFromWinnerBracket(16, 8));
		});
	});
/*
	describe("getNumOfMatchesForWinnerRound", function() {
		it("Number of matches for round 5 in winner bracket is 8", function() {
			assert.equal(8, tournamentUtil.getNumOfMatchesForWinnerRound(5));
		});
		it("Number of matches for round 9 in winner bracket is 128", function() {
			assert.equal(128, tournamentUtil.getNumOfMatchesForWinnerRound(9));
		});
		it("Number of matches for round 2 in winner bracket is 1", function() {
			assert.equal(1, tournamentUtil.getNumOfMatchesForWinnerRound(2));
		});
	});

	describe("getFlippedLosingMatchNumFromWinnerBracket", function() {
		it("Flipped losing match number of match 1 round 5 from winner bracket of 16 is 4", function() {
			assert.equal(4, tournamentUtil.getFlippedLosingMatchNumFromWinnerBracket(16, 5, 1))
		});
		it("Flipped losing match number of match 2 round 5 from winner bracket of 16 is 4", function() {
			assert.equal(4, tournamentUtil.getFlippedLosingMatchNumFromWinnerBracket(16, 5, 2))
		});
		it("Flipped losing match number of match 4 round 4 from winner bracket of 8 is 1", function() {
			assert.equal(1, tournamentUtil.getFlippedLosingMatchNumFromWinnerBracket(8, 4, 4))
		});
	});
*/
});
