var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var tournamentBracketSchema = new Schema({
  name: {type:String},
  description: {type:String},
  bracketType: {type:String},
  nextBracketId: {type: Schema.Types.ObjectId, ref: "TournamentBracket", default:null},
  gameType: {type:String},
  defaultRoundOptionsId: {type: Schema.Types.ObjectId},
  cardBanIds: [{type: Schema.Types.ObjectId, ref:"Card"}],
	tournamentId: {type: Schema.Types.ObjectId, ref:"Tournament"},
  matchIds: {type: Schema.Types.ObjectId, ref: "TournamentMatch"},
  teamIds: [{type: Schema.Types.ObjectId, ref: "TournamentTeam"}],
  prizePool: [{type:Number}],
  winnerId: {type: Schema.Types.ObjectId, ref: "TournamentTeam"},
  creatorId: {type: Schema.Types.ObjectId, ref: "User"},
  createdTime: {type: Date},
  endTime: {type:Date}
});

var TournamentBracket = mongoose.model('TournamentBracket', tournamentBracketSchema);

module.exports = TournamentBracket;