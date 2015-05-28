var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var tournamentSchema = new Schema({
    playerList: [{type: Schema.Types.ObjectId, ref:'User'}],
    prizePool: {type:Number, default:0},
    regionName: {type: String, default:'na'},
});

var Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;