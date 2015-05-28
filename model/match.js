var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var matchSchema = new Schema({
	tournamentId: {type: Schema.Types.ObjectId, ref:'Tournament'},
	player1Id: {type: Schema.Types.ObjectId, ref:'User'},
	player2Id: {type: Schema.Types.ObjectId, ref:'User'},
    regionName: {type:String, default:'na'},
    winnerId: {type: Schema.Types.ObjectId, ref:'User'},
    createdDate: Date,
});

var Match = mongoose.model('Match', matchSchema);

module.exports = Match;