var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var matchSchema = new Schema({
	tournamentId: {type: Schema.Types.ObjectId, ref:"Tournament"},
	bracketId: {type: Schema.Types.ObjectId, ref:"Bracket"},
	matchKey: [{type: Number}],
	winningMatchId: {type: Schema.Types.ObjectId, ref:"Match"},
	losingMatchId: {type:Schema.Types.ObjectId},
	player1Id: {type: Schema.Types.ObjectId, ref:"Player"},
	player2Id: {type: Schema.Types.ObjectId, ref:"Player"},
	player1ResultImgUrl: {type: String},
	player2ResultImgUrl: {type: String},
	player1ReportedWinnerId: {type: Schema.Types.ObjectId, ref:"Player"},
	player2ReportedWinnerId: {type: Schema.Types.ObjectId, ref:"Player"},
   	chatHistory: {type: String},
   	deckBanIds: [{type: Schema.Types.ObjectId, ref:"Deck"}],
    winnerId: {type: Schema.Types.ObjectId, ref:'Player'},
    createdTime: {type: Date},
    startTime: {type:Date},
    endTime: {type:Date}
});

var Match = mongoose.model('Match', matchSchema);

module.exports = Match;