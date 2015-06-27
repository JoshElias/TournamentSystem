var TournamentSchema = require("./../model/tournament");


function validateAdminId(tournamentId, userId, finalCallback) {
	TournamentSchema.findById(tournamentId)
	.select("adminIds")
	.exec(function(err, tournament) {
		if(err) callback(err);
		else if(!tournament || tournament.adminIds.indexOf(userId) === -1) {
			finalCallback(undefined, false);
		} else {
			finalCallback();
		}
	});
}


// MAIN EXPORTS
module.exports = {
	validateAdminId : validateAdminId
}
