// Dependencies
var express = require("express");
var app = express();
var multer = require("multer");
//var tournament = require("./tournament/tournament");
//var tournamentRouter = require("./tournament/tournamentRouter");

var TEST_ADMIN_ID = "54847bba9c76c20e9149f5d2";
var TEST_TOURNAMENT_ID = "5568bdc9465dcb282120ad23";

// tournamentTester0-31



var numOfRounds = 4;
var numOfMatchesThisRound = 1;
for(var i = 0; i < numOfRounds; i++) {
	for(var j = 0; j < numOfMatchesThisRound; j++) {
		console.log("1,"+(i+1)+","+(j+1));
	}
	numOfMatchesThisRound *= 2;
}


/*
var UserSchema = require("./model/user");
var async = require("async");
async.waterfall([
	function(callback) {
		UserSchema.find({username:{$regex:/tournamentTester[0-9]?[0-9]/g}}, function(err, users) {
			if(err) callback(err);
			else {
				console.log("Found "+users.length+" users");
				callback(undefined, users);
			}
		});
	},
	function(users, callback) {
		var addPlayerFuncs = [];
		function addPlayerFunc(i) {
			addPlayerFuncs.push(function(_callback) {
				tournament.addPlayer(users[i]._id.toString(), "5568bdc9465dcb282120ad23", _callback);
			});
		}
		for(var i = 0; i < users.length; i++) {
			addPlayerFunc(i);
		}
		async.series(addPlayerFuncs, callback);
	}],
function(err, results) {
	if(err) console.log(err);
	else {
		console.log("Successfully added players: "+results);
	}
});
*/


/*
// Middleware
app.use(multer());


// Routes
tournamentRouter.route(app);


// Start server
var server = app.listen(3000, function(err) {
	if(err) {
		console.log("Failed to start Tournament App");
	} else {
		var host = server.address().address;
  		var port = server.address().port;

  		console.log('Tournament app listening at http://%s:%s', host, port);
	}
});
*/