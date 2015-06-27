var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var playerSchema = new Schema({
	userId: {type: Schema.Types.ObjectId, ref:"User"},
  currentMatchId: {type: Schema.Types.ObjectId, ref:"Match"},
  matchIdHistory: [{type: Schema.Types.ObjectId, ref:"Match"}],
	bracketId: {type: Schema.Types.ObjectId, ref:"Bracket"},
  tournamentId: {type: Schema.Types.ObjectId, ref:"Tournament"},
  deckIds: [{type: Schema.Types.ObjectId, ref:"Deck"}],
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