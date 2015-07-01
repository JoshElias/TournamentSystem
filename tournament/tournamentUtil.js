var TournamentSchema = require("./../model/tournament");


function validateAdminId(userId, tournamentId, finalCallback) {
	TournamentSchema.findById(tournamentId)
	.select("adminIds")
	.exec(function(err, tournament) {
		if(err) callback(err);
		else if(!tournament || tournament.adminIds.indexOf(userId) === -1) {
			finalCallback(undefined, false);
		} else {
			finalCallback(undefined, true);
		}
	});
}


// MAIN EXPORTS
module.exports = {
	validateAdminId : validateAdminId
}
