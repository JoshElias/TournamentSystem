function validateAdminId(userId, tournamentId, finalCallback) {
	TournamentSchema.findById(tournamentId)
	.select("adminIds")
	.exec(function(err, tournament) {
		if(err) callback(err);
		else if(!tournament) {
			finalCallback("Could not find user with provided id");
		} else if(tournament.adminIds.indexOf(userId) === -1) {
			finalCallback("This user is not an admin to this tournamnet")
		} else {
			finalCallback();
		}
	});
}
function validateAdminId(userId, tournamentId, finalCallback) {
	TournamentSchema.findById(tournamentId)
	.select("adminIds")
	.exec(function(err, tournament) {
		if(err) callback(err);
		else if(!tournament) {
			finalCallback("Could not find user with provided id");
		} else if(tournament.adminIds.indexOf(userId) === -1) {
			finalCallback("This user is not an admin to this tournamnet")
		} else {
			finalCallback();
		}
	});
}
