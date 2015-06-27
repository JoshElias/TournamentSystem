var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
// Deck schema
var tournamentSchema = new Schema({
	creatorId: {type: Schema.Types.ObjectId, required:true},
    name: {type:String, default: "Unnamed tournament"},
	description: {type:String, default: ""},
    startTime: {type:Date, required:true},
    endTime: {type:Date},
    regionName: {type:String, default:"na"},

    adminIds: [{type:Schema.Types.ObjectId, ref: "User"}],

    gameOptionsId: {type:Schema.Types.ObjectId},
    gameType: {type:String, default:"singleElim"},
    teamSize: {type:Number, default: 1},
    bestOf: {type: Number, default: 1},

    teamIds: [{type: Schema.Types.ObjectId, ref:"TournamentTeam"}],
    playerIdWhitelist: [{type:Schema.Types.ObjectId, ref:"User"}],
    playerIdBlacklist: [{type:Schema.Types.ObjectId, ref:"User"}],

    bracketIds: [{type:Schema.Types.ObjectId, ref: "TournamentBracket"}],
    startingBracketId: {type:Schema.Types.ObjectId, ref:"TournamentBracket"},
    endingBracketId: {type:Schema.Types.ObjectId, ref:"TournamentBracket"},
 	
    prizePool: [{type:Number}],
    creationTime: {type:Date},
        
    active: {type: Boolean, default: false},
    featured: {type: Boolean, default: false},
  
});

var Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;