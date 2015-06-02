var assert = require("assert");
var mathUtil = require("./../util/mathUtil");


describe("Math Utilities", function() {

	describe("isPowerOf2", function() {
		it("4 is a power of 2", function() {
			assert.equal(true, mathUtil.isPowerOf2(4));
		});
		it("32 is a power of 2", function() {
			assert.equal(true, mathUtil.isPowerOf2(32));
		});
		it("255 is not a power of 2", function() {
			assert.equal(false, mathUtil.isPowerOf2(255));
		});
		it("316 is not a power of 2", function() {
			assert.equal(false, mathUtil.isPowerOf2(316));
		});
	});

	describe("nextPowerOf2", function() {
		it("Next power of 2 to 5 is 8", function() {
			assert.equal(8, mathUtil.nextPowerOf2(5));
		});
		it("Next power of 2 to 38 is 64", function() {
			assert.equal(64, mathUtil.nextPowerOf2(38));
		});
		it("Next power of 2 to 511 is 512", function() {
			assert.equal(512, mathUtil.nextPowerOf2(511));
		});
	});

	describe("timesCanBeDividedBy2", function() {
		it("The number of times 6 can be divided in 2 is 1", function() {
			assert.equal(3, mathUtil.timesCanBeDividedBy2(8));
		});
		it("The number of times 16 can be divided in 2 is 4", function() {
			assert.equal(4, mathUtil.timesCanBeDividedBy2(16));
		});
		it("The number of times 64 can be divided in 2 is 6", function() {
			assert.equal(6, mathUtil.timesCanBeDividedBy2(64));
		});
	});

	describe("nearestEvenNumberDown", function() {
		it("The nearest even number down from 7 is 6", function() {
			assert.equal(6, mathUtil.nearestEvenNumberDown(7));
		});
		it("The nearest even number down from 143 is 142", function() {
			assert.equal(142, mathUtil.nearestEvenNumberDown(143));
		});
		it("The nearest even number down from 555 is 554", function() {
			assert.equal(554, mathUtil.nearestEvenNumberDown(555));
		});
	});
});