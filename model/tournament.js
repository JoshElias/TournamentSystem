var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var tournamentSchema = new Schema({
	name: {type:String, default: "Unnamed tournament"},
	description: {type:String, default: ""},
    creator: {type: Schema.Types.ObjectId},
    players: [{type: Schema.Types.ObjectId, ref:"User"}],
    playerWhitelist: [{type:Schema.Types.ObjectId, ref:"User"}],
    playerBlacklist: [{type:Schema.Types.ObjectId, ref:"User"}],
    brackets: [{type:Schema.Types.ObjectId, ref: "Bracket"}],
 	regionName: {type:String, default:"na"},
    prizePool: [{type:Number}],
    creationTime: {type:Date},
    endTime: {type:Date},
    numOfDecks: {type:Number, min: 1, max: 2},
    numOfDeckBans: {type:Number, min: 0, max: 8},
    decksPerClass: {type:Number, min: 1, max: 9, default: 1},
    cardBans: [{type:Schema.Types.ObjectId, ref:"Card"}],
    active: {type: Boolean, default: false},
    feature: {type: Boolean, default: false},
    admins: [{type:Schema.Types.ObjectId, ref: "User"}]
});

var Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;