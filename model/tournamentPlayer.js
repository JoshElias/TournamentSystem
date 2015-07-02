var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var playerSchema = new Schema({
	userId: {type: Schema.Types.ObjectId, ref:"User"},
  teamId: {type: Schema.Types.ObjectId, ref: "TournamentTeam"},
  currentMatchId: {type: Schema.Types.ObjectId, ref:"TournamentMatch"},
  matchIdHistory: [{type: Schema.Types.ObjectId, ref:"Match"}],
	bracketId: {type: Schema.Types.ObjectId, ref:"Bracket"},
  tournamentId: {type: Schema.Types.ObjectId, ref:"Tournament"},
  deckIds: [{type: Schema.Types.ObjectId, ref:"Deck"}],
  regionName: {type:String, default:'na'},
  createdTime: {type: Date}
});

var Match = mongoose.model('Player', playerSchema);

module.exports = Match;