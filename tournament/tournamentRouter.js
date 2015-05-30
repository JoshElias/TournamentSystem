var tournament = require("./tournament");


// Connect to the database
mongoose.connect('mongodb://localhost/tempostorm');


// Router
function route( app ) {
	app.post("/createTournament", createTournamentHandler);
	app.post("/addPlayer", addPlayerHandler);
}


// Handlers

// Admin
function createTournamentHandler( req, res) {	
	if(typeof req.user === "undefined" || typeof req.user._id !== "string") {
		res.json({err: "Can't create tournament with invalid user id"});
		return;
	}
	if(typeof req.body !== "object") {
		res.json({err: "Can't create tournament with no arguments"});
		return;
	}

	tournament.createTournament(req.user._id, req.body, function(err, newTournament) {
		if(err) res.json({err:err});
		else res.json({success:true});
	});
}

function addPlayerHandler( req, res ) {
	if(typeof req.body.userId !== "string") {
		res.json({err: "Can't add player with invalid user id"});
		return;
	}
	if(typeof req.body.tournamentId !== "string") {
		res.json({err: "Can't add player to invalid tournament id"})
		return;
	}

	tournament.addPlayer(req.body.userId, req.body.tournamentId, function(err, newPlayer) {
		if(err) res.json({err:err});
		else res.json({success:true});
	});
}




module.exports = {
	route : route
}