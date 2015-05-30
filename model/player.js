var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var playerSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref:"User"},
  match: {type: Schema.Types.ObjectId, ref:"Match"},
	bracket: {type: Schema.Types.ObjectId, ref:"Bracket"},
  tournament: {type: Schema.Types.ObjectId, ref:"Tournament"},
  decks: [{type: Schema.Types.ObjectId, ref:"Deck"}],
  rawScore: {type: Number},
  buchholzScore: {type: Number},
  wins: {type:Number},
  losses: {type:Number},
  unplayed: {type:Number},
  regionName: {type:String, default:'na'},
  createdTime: {type: Date}
});

var Match = mongoose.model('Player', playerSchema);

module.exports = Match;