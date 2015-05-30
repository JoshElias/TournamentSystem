var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var bracketSchema = new Schema({
  name: {type:Number},
  bracketType: {type:String},
  bestOf: {type:String},
  cardBans: [{type: Schema.Types.ObjectId, ref:"Card"}],
	tournament: {type: Schema.Types.ObjectId, ref:"Tournament"},
  players: [{type: Schema.Types.ObjectId, ref: "Player"}],
	bracket: {type: Schema.Types.ObjectId, ref:"Bracket"},
  prizePool: [{type:Number}],
  winner: {type: Schema.Types.ObjectId, ref: "Player"},
  createdTime: {type: Date},
  endTime: {type:Date}
});

var Match = mongoose.model('Bracket', bracketSchema);

module.exports = Match;