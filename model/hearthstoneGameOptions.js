var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var hearthstoneGameOptions = new Schema({
	gameType: {type:String, default:"hearthstone"},
    numOfDecks: {type:Number, min: 1, max: 2},
    numOfDeckBans: {type:Number, min: 0, max: 8},
    decksPerClass: {type:Number, min: 1, max: 9, default: 1},
    cardBanIds: [{type: Schema.Types.ObjectId, ref: "Card"}],
    bestOf: {type:Number, default: 1}
});

var HearthstoneGameOptions = mongoose.model('HearthstoneGameOptions', hearthstoneGameOptions);

module.exports = HearthstoneGameOptions;