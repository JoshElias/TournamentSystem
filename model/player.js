var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var playerSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref:"User"},
  match: {type: Schema.Types.ObjectId, ref:"Match"},
	bracket: {type: Schema.Types.ObjectId, ref:"Bracket"},
  tournament: {type: Schema.Types.ObjectId, ref:"Tournament"},
  decks: [{type: Schema.Types.ObjectId, ref:"Deck"}],
  rawScore: {type: Number, default: 0},
  buchholzScore: {type: Number, default: 0},
  wins: {type:Number, default: 0},
  losses: {type:Number, default: 0},
  unplayed: {type:Number, default: 0},
  regionName: {type:String, default:'na'},
  createdTime: {type: Date}
});

var Match = mongoose.model('Player', playerSchema);

module.exports = Match;