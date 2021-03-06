var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var tournamentMatchSchema = new Schema({
	tournamentId: {type: Schema.Types.ObjectId, ref:"Tournament"},
	bracketId: {type: Schema.Types.ObjectId, ref:"TournamentBracket"},
	matchKey: [{type: Number}],
	winningTeamId: {type: Schema.Types.ObjectId, ref:"TournamentTeam"},
	losingTeamId: {type:Schema.Types.ObjectId, ref: "TournamentTeam"},
	team1Id: {type: Schema.Types.ObjectId, ref:"TournamentTeam"},
	team2Id: {type: Schema.Types.ObjectId, ref:"TournamentTeam"},
	team1Wins: {type: Number, default: 0},
	team2Wins: {type: Number, default: 0},
	gameIdHistory: {type: Schema.Types.ObjectId, ref:"TournamentGame"},
   	chatHistory: {type: String},
    winnerId: {type: Schema.Types.ObjectId, ref:'TournamentPlayer'},
    createdTime: {type: Date},
    startTime: {type:Date},
    endTime: {type:Date}
});

var TournamentMatch = mongoose.model('TournamentMatch', tournamentMatchSchema);

module.exports = TournamentMatch;