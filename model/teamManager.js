var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var managerSchema = new Schema({
	userId: {type: Schema.Types.ObjectId, ref:"User"},
  	teamId: {type: Schema.Types.ObjectId, ref: "TournamentTeam"},
  	tournamentId: {type: Schema.Types.ObjectId, ref:"Tournament"}
});

var TournamentManager = mongoose.model('TeamManager', managerSchema);

module.exports = TournamentManager;