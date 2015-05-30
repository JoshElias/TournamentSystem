var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var matchSchema = new Schema({
	tournament: {type: Schema.Types.ObjectId, ref:"Tournament"},
	bracket: {type: Schema.Types.ObjectId, ref:"Bracket"},
	coordinates: [{type: Number}],
	winningMatch: {type: Schema.Types.ObjectId},
	losingMatch: {type:Schema.Types.ObjectId},
	player1: {type: Schema.Types.ObjectId, ref:"User"},
	player2: {type: Schema.Types.ObjectId, ref:"User"},
	player1ResultImgUrl: {type: String},
	player2ResultImgUrl: {type: String},
    regionName: {type:String, default:'na'},
   	chatHistory: {type: String},
   	deckBans: [{type: Schema.Types.ObjectId, ref:"Deck"}],
    winnerId: {type: Schema.Types.ObjectId, ref:'User'},
    createdTime: {type: Date},
    endTime: {type:Date}
});

var Match = mongoose.model('Match', matchSchema);

module.exports = Match;