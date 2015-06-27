var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var tournamentTeamSchema = new Schema({
	managerId: {type: Schema.Types.ObjectId, ref:"User"},
  playerIds: [{type: Schema.Types.ObjectId, ref:"TournamentPlayer"}],
  currentMatch: {type: Schema.Types.ObjectId, ref:"TournamentMatch"},
  matchIdHistory: [{type: Schema.Types.ObjectId, ref:"TournamentMatch"}],
	bracketId: {type: Schema.Types.ObjectId, ref:"TournamentBracket"},
  tournamentId: {type: Schema.Types.ObjectId, ref:"Tournament"},
  rawScore: {type: Number, default: 0},
  buchholzScore: {type: Number, default: 0},
  wins: {type:Number, default: 0},
  losses: {type:Number, default: 0},
  regionName: {type:String, default:'na'},
  createdTime: {type: Date}
});

var TournamentTeam = mongoose.model('TournamentTeam', tournamentTeamSchema);

module.exports = TournamentTeam;