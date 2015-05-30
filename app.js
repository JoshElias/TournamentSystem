// Dependencies
var express = require("express");
var app = express();
var multer = require("multer");
var tournament = require("./tournament/tournament");
//var tournamentRouter = require("./tournament/tournamentRouter");

var TEST_ADMIN_ID = "54847bba9c76c20e9149f5d2";
var TEST_TOURNAMENT_ID = "5568bdc9465dcb282120ad23";


var UserSchema = require("./model/user");
var addUserFuncs = [];
function addUserFunc(i) {
	addUserFuncs.push(function(callback) {
		var newTestUser = new UserSchema({
			email: "tournamentTester"+i+"@gmail.com",
			username: "tournamentTester"+i,
			bnetID: "fakeId",
			paypalID: "fakeId",
			twitchID: "fakeId",
			tournamentBlacklist: false
		});
		newTestUser.save(callback);
	});
}
for(var i = 0; i < 32; i++) {
	addUserFunc(i);
}
require("async").series(addUserFuncs, function(err) {
	if(err) console.log(err);
	else {
		console.log("Successfully added test users");
	}
});

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