var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var bracketSchema = new Schema({
  name: {type:Number},
  description: {type:String},
  bracketType: {type:String},
  bestOf: {type:String},
  cardBanIds: [{type: Schema.Types.ObjectId, ref:"Card"}],
	tournamentId: {type: Schema.Types.ObjectId, ref:"Tournament"},
  matchIds: {type: Schema.Types.ObjectId, ref: "Match"},
  playerIds: [{type: Schema.Types.ObjectId, ref: "Player"}],
  prizePool: [{type:Number}],
  winnerId: {type: Schema.Types.ObjectId, ref: "Player"},
  creatorId: {type: Schema.Types.ObjectId, ref: "User"},
  createdTime: {type: Date},
  endTime: {type:Date}
});

var Match = mongoose.model('Bracket', bracketSchema);

module.exports = Match;