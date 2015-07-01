var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var tournamentGameSchema = new Schema({
	tournamentId: {type: Schema.Types.ObjectId, ref:"Tournament"},
	bracketId: {type: Schema.Types.ObjectId, ref:"TournamentBracket"},
	matchId: {type: Schema.Types.ObjectId, ref:"TournamentMatch"},
	winningTeamId: {type: Schema.Types.ObjectId, ref:"TournamentTeam"},
	losingTeamId: {type:Schema.Types.ObjectId, ref: "TournamentTeam"},
	team1Id: {type: Schema.Types.ObjectId, ref:"TournamentTeam"},
	team2Id: {type: Schema.Types.ObjectId, ref:"TournamentTeam"},
	team1ResultImgUrl: {type: String},
	team2ResultImgUrl: {type: String},
	team1ReportedWinnerId: {type: Schema.Types.ObjectId, ref:"TournamentTeam"},
	team2ReportedWinnerId: {type: Schema.Types.ObjectId, ref:"TournamentTeam"},
   	deckBanIds: [{type: Schema.Types.ObjectId, ref:"Deck"}],
    winnerId: {type: Schema.Types.ObjectId, ref:'Player'},
    createdTime: {type: Date},
    startTime: {type:Date},
    endTime: {type:Date}
});

var TournamentGame = mongoose.model('TournamentGame', tournamentGameSchema);

module.exports = TournamentGame;