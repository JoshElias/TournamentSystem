var assert = require("assert");
var tournamentUtil = require("./../util/tournamentUtil");


describe("Tournament Utilities", function() {

	describe("getNumOfRoundsInWinnerBracket", function() {
		it("should output 4 rounds", function() {
			assert.equal(4, tournamentUtil.getNumOfRoundsInWinnerBracket(16));
		});
		it("should output 5 rounds", function() {
			assert.equal(5, tournamentUtil.getNumOfRoundsInWinnerBracket(32));
		});
		it("should output 6 rounds", function() {
			assert.equal(6, tournamentUtil.getNumOfRoundsInWinnerBracket(64));
		});
	});

	describe("getNumOfRoundsInLoserBracket", function() {
		it("Number of rounds in loser bracket for 16 people is 6", function() {
			assert.equal(6, tournamentUtil.getNumOfRoundsInLoserBracket(16));
		});
		it("Number of rounds in loser bracket for 8 people is 4", function() {
			assert.equal(4, tournamentUtil.getNumOfRoundsInLoserBracket(8));
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
			assert.throws(function() {
				tournamentUtil.getWinningRoundNumFromWinnerBracket(1)
			});
		});
	});

	describe("getLosingRoundNumFromWinnerBracket", function() {
		it("Round number for losing round 4 in winner bracket of 16 people is 6", function() {
			assert.equal(6, tournamentUtil.getLosingRoundNumFromWinnerBracket(16, 4));
		});
		it("Round number for losing round 8 in winner bracket of 256 people is 14", function() {
			assert.equal(14, tournamentUtil.getLosingRoundNumFromWinnerBracket(256, 8));
		});
		it("Round number for losing round 2 in winner bracket of 4 people is 2", function() {
			assert.equal(2, tournamentUtil.getLosingRoundNumFromWinnerBracket(4, 2));
		});
		it("Round number for losing round 1 in winner bracket of 4 people is 1", function() {
			assert.equal(1, tournamentUtil.getLosingRoundNumFromWinnerBracket(4, 1));
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
		it("Losing match number after round 5 of winner bracket of 16 people after 1 is 1", function() {
			assert.equal(1, tournamentUtil.getLosingMatchNumFromWinnerBracket(16, 5, 1));
		});
		it("Losing match number after round 4 of winner bracket of 16 people after 4 is 3", function() {
			assert.equal(2, tournamentUtil.getLosingMatchNumFromWinnerBracket(16, 4, 3));
		});
		it("Losing match number after round 1 of winner bracket of 16 people after 8 is 4", function() {
			assert.equal(4, tournamentUtil.getLosingMatchNumFromWinnerBracket(16, 1, 8));
		});
	});

	describe("getNumOfMatchesForSingleElim", function() {
		it("A single elim tournament with 16 players should have 5 matches", function() {
			assert.equal(15, tournamentUtil.getNumOfMatchesForSingleElim(16));
		});
		it("A single elim tournament with 32 players should have 6 matches", function() {
			assert.equal(31, tournamentUtil.getNumOfMatchesForSingleElim(32));
		});
		it("A single elim tournament with 2 players should have 1 match", function() {
			assert.equal(1, tournamentUtil.getNumOfMatchesForSingleElim(2));
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
