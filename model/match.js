var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var matchSchema = new Schema({
	tournamentId: {type: Schema.Types.ObjectId, ref:"Tournament"},
	bracketId: {type: Schema.Types.ObjectId, ref:"Bracket"},
	coordinates: [{type: Number}],
	winningMatchId: {type: Schema.Types.ObjectId},
	losingMatchId: {type:Schema.Types.ObjectId},
	player1Id: {type: Schema.Types.ObjectId, ref:"User"},
	player2Id: {type: Schema.Types.ObjectId, ref:"User"},
	player1ResultImgUrl: {type: String},
	player2ResultImgUrl: {type: String},
   	chatHistory: {type: String},
   	deckBanIds: [{type: Schema.Types.ObjectId, ref:"Deck"}],
    winnerId: {type: Schema.Types.ObjectId, ref:'User'},
    createdTime: {type: Date},
    startTime: {type:Date},
    endTime: {type:Date}
});

var Match = mongoose.model('Match', matchSchema);

module.exports = Match;