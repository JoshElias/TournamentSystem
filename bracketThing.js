var mongoose = require("mongoose");
var bracket = require("./tournament/bracket");

// Connect to the database
mongoose.connect('mongodb://localhost/tempostorm');

var TEST_ADMIN_ID = "558c4b58d9c7ff69bd0da9af";
var TEST_TOURNAMENT_ID = "55919c5d603f858424fd0a90";

var testBracketOptions = {
	name: "Bracket Tournament",
	description: " test description",
	startTime : Date.now(),
	prizePool: [],
	bestOf: 3
}
console.log("Creating tournament");
bracket.createBracket(TEST_ADMIN_ID, TEST_TOURNAMENT_ID, testBracketOptions, {}, function(err, newBracket) {
	if(err) console.log(err)
	else {
		testBracketId = newBracket._id;
		console.log("Successfully added bracket");
	}
});