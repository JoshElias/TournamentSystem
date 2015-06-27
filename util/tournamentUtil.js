var constants = require("./../constants/constants");
var mathUtil = require("./mathUtil");

// TOURNAMENT HELPERS



// Double Elimination

function getNumOfRoundsInWinnerBracket( totalNumOfPlayers ) {
	if(typeof totalNumOfPlayers !== "number" || !mathUtil.isPowerOf2(totalNumOfPlayers)) {
		throw new Error("Total number of players must be a power of 2");
	}

	return mathUtil.timesCanBeDividedBy2(totalNumOfPlayers);
}

function getNumOfRoundsInLoserBracket( totalNumOfPlayers ) {
	if(typeof totalNumOfPlayers !== "number" || !mathUtil.isPowerOf2(totalNumOfPlayers)) {
		throw new Error("Total number of players must be a power of 2");
	}

	return (mathUtil.timesCanBeDividedBy2(totalNumOfPlayers / 2) * 2);
}

function getWinningRoundNumFromWinnerBracket( currentRoundNum ) {
	if(typeof currentRoundNum !== "number" || currentRoundNum < 1) {
		throw new Error("Can't get winning round number with invalid round number");
	}
	if(currentRoundNum === 1) {
		throw new Error("Can't get winning round number of winning round");
	}

	return --currentRoundNum;
}

function getLosingRoundNumFromWinnerBracket( totalNumOfPlayers, currentRoundNum ) {
	if(typeof totalNumOfPlayers !== "number" || !mathUtil.isPowerOf2(totalNumOfPlayers)) {
		throw new Error("Total number of players must be a power of 2");
	}

	if(typeof currentRoundNum !== "number" || currentRoundNum < 1) {
		throw new Error("Current round number is invalid");
	}

	var totalNumOfRounds = getNumOfRoundsInWinnerBracket(totalNumOfPlayers);
	if(currentRoundNum === totalNumOfRounds) {
		return currentRoundNum + currentRoundNum - 2;
	} else {
		return currentRoundNum + currentRoundNum - 1;
	}
}

function getWinningMatchNumFromWinnerBracket( currentMatchNum ) {
	if(typeof currentMatchNum !== "number") {
		throw new Error("Current match number must be a number");
	}

	return mathUtil.nearestEvenNumberUp(currentMatchNum) / 2;
}

function getLosingMatchNumFromWinnerBracket( totalNumOfPlayers, currentRoundNum, currentMatchNum ) {
 	
 	var totalNumOfRounds = getNumOfRoundsInWinnerBracket(totalNumOfPlayers);
 	console.log("Number of rounds for "+totalNumOfPlayers+" is "+totalNumOfRounds);

 	if(currentRoundNum === totalNumOfRounds-1) {
 		return currentMatchNum;
 	} else {
 		return mathUtil.nearestEvenNumberUp(currentMatchNum) / 2;
 	}
}

function getWinningMatchCoordsForSingleElim( matchKey ) {
	if(typeof matchKey !== "string") {
		throw new Error("Match coordinates are invalid");
	}

	var coordArr = matchKey.split(constants.KEY_SEPARATOR);
	var bracketNum = coordArr[0];
	var roundNum = coordArr[1];
	var matchNum = coordArr[2];

	if(--roundNum < 1) {
		throw new Error("Can't get winning match coords from last match");
	}
	matchNum = getWinningMatchNumFromWinnerBracket(matchNum);

	return "1"+constants.KEY_SEPARATOR+"roundNum"+constants.KEY_SEPARATOR+"matchNum";
}

function getWinningMatchCoordsForDoubleElim( matchCoords, totalNumOfPlayers ) {
	if(typeof mathCoords !== "string") {
		throw new Error("Match coordinates are invalid");
	}

	var coordArr = mathCoords.split(constants.KEY_SEPARATOR);
	var roundNum = coordArr[1];
	var matchNum = coordArr[2];

	roundNum = getWinningRoundNumFromWinnerBracket(roundNum);
	matchNum = getWinningMatchNumFromWinnerBracket(matchNum);

	return "1"+constants.KEY_SEPARATOR+"roundNum"+constants.KEY_SEPARATOR+"matchNum";
}

function getLosingMatchCoordsForDoubleElim( matchCoords, totalNumOfPlayers ) {
	if(typeof mathCoords !== "string") {
		throw new Error("Match coordinates are invalid");
	}

	var coordArr = mathCoords.split(constants.KEY_SEPARATOR);
	var roundNum = coordArr[1];
	var matchNum = coordArr[2];

	roundNum = getLosingRoundNumFromWinnerBracket(totalNumOfPlayers, roundNum);
	matchNum = getLosingMatchNumFromWinnerBracket(totalNumOfPlayers, roundNum, matchNum);

	return "2"+constants.KEY_SEPARATOR+"roundNum"+constants.KEY_SEPARATOR+"matchNum";
}
/*
function getFlippedLosingMatchNumFromWinnerBracket( totalNumOfPlayers, currentRoundNum, currentMatchNum ) {
	if(typeof totalNumOfPlayers !== "number" || !mathUtil.isPowerOf2(totalNumOfPlayers)) {
		throw new Error("Total number of players must be a power of 2");
	}
	if(typeof currentRoundNum !== "number" || typeof currentMatchNum !== "number") {
		throw new Error("Current match and round number must be numbers");
	}

	var totalNumOfRounds = getNumOfRoundsInWinnerBracket(totalNumOfPlayers);

	return getLosingMatchNumFromWinnerBracket(totalNumOfPlayers, currentRoundNum, currentMatchNum);
}

function getNumOfMatchesForWinnerRound( currentRoundNum ) {
	if(typeof currentRoundNum !== "number") {
		throw new Error("Current round number must be a number");
	}

	return Math.pow(2, currentRoundNum - 1) / 2;
}


function getNumOfPlayersInWinnerRound( totalNumOfPlayers, currentRoundNum ) {
	if(typeof totalNumOfPlayers !== "number" || !mathUtil.isPowerOf2(totalNumOfPlayers)) {
		throw new Error("Total number of players must be a power of 2");
	}
	if(typeof currentRoundNum !== "number") {
		throw new Error("Current round number must be a number");
	}

	var totalRounds = getNumOfRoundsInWinnerBracket(totalNumOfPlayers);
	return totalNumOfPlayers / Mat.pow(2, (totalRounds - currentRoundNum));
}

function getNumOfPlayersInLoserRound( totalNumOfPlayers, currentRoundNum ) {
	if(typeof totalNumOfPlayers !== "number" || !mathUtil.isPowerOf2(totalNumOfPlayers)) {
		throw new Error("Total number of players must be a power of 2");
	}
	if(typeof currentRoundNum !== "number") {
		throw new Error("Current round number must be a number");
	}

	var numOfRounds = getNumOfRoundsInLoserBracket(totalNumOfPlayers);
	if(currentRoundNum === 1) {
		return 1;
	} else if(currentRoundNum === numOfRounds) {
		return totalNumOfPlayers / 2;
	} else {
		return (mathUtil.nearestEvenNumberDown(numOfRounds) - mathUtil.nearestEvenNumberDown(currentRoundNum)) / (totalNumOfPlayers/2);
	}
}
*/

function getNumOfMatchesForSingleElim(numOfPlayers) {
	if(typeof numOfPlayers !== "number" || !mathUtil.isPowerOf2(numOfPlayers)) {
		throw new Error("Can't get number of matches with invalid number of players");
	}

	return numOfPlayers - 1;
}

function getNumOfMatchesForDoubleElim(numberOfPlayers) {
	if(typeof numOfPlayers !== "number" || !mathUtil.isPowerOf2(numOfPlayers)) {
		throw new Error("Can't get number of matches with invalid number of players");
	}

	return getNumOfMatchesForSingleElim(numOfPlayers) + (numOfPlayers - 2) + 2;
}


function getNumOfMatchesForTournament(numOfPlayers, tournamentType) {
	if(typeof numOfPlayers !== "number" || !mathUtil.isPowerOf2(numOfPlayers)) {
		throw new Error("Can't get number of matches with invalid number of players");
	}
	if(constants.TOURNAMENT_TYPES.indexOf(tournamentType) === -1) {
		throw new Error("Can't get number of matches with invalid tournament type");
	}

	if(tournamentType === "singleElim") {
		return getNumOfMatchesForSingleElim(numOfPlayers);
	} else if(tournamentType === "doubleElim") {
		return getNumOfMatchesForDoubleElim(numOfPlayers);
	} else if(tournamentType === "swiss") {
		throw new Error("I don't fucking know!");
	} else {
		throw new Error("Can't get number of matches with invalid tournament type");
	}
}


function getBracketSideFromMatchKey( key ) {
	if(typeof key !== "string") {
		throw new Error("Unable to get bracket side with invalid key");
	}

	var keyArr = key.split(constants.KEY_SEPARATOR);
	return keyArr[0];
}

function getBracketRoundFromMatchKey( key ) {
	if(typeof key !== "string") {
		throw new Error("Unable to get bracket round with invalid key");
	}

	var keyArr = key.split(constants.KEY_SEPARATOR);
	return keyArr[1];
}

function getBracketMatchFromMatchKey( key ) {
	if(typeof key !== "string") {
		throw new Error("Unable to get bracket match with invalid key");
	}

	var keyArr = key.split(constants.KEY_SEPARATOR);
	return keyArr[2];
}


module.exports = {
	getNumOfRoundsInWinnerBracket : getNumOfRoundsInWinnerBracket,
	getNumOfRoundsInLoserBracket: getNumOfRoundsInLoserBracket,
	getWinningRoundNumFromWinnerBracket : getWinningRoundNumFromWinnerBracket,
	getLosingRoundNumFromWinnerBracket : getLosingRoundNumFromWinnerBracket,
	getWinningMatchNumFromWinnerBracket : getWinningMatchNumFromWinnerBracket,
	getLosingMatchNumFromWinnerBracket : getLosingMatchNumFromWinnerBracket,

	getNumOfMatchesForSingleElim : getNumOfMatchesForSingleElim,
	getNumOfMatchesForDoubleElim : getNumOfMatchesForDoubleElim,

	getWinningMatchCoordsForSingleElim : getWinningMatchCoordsForSingleElim,
	
	getWinningMatchCoordsForDoubleElim : getWinningMatchCoordsForDoubleElim,
	getLosingMatchCoordsForDoubleElim : getLosingMatchCoordsForDoubleElim,
	/*
	getFlippedLosingMatchNumFromWinnerBracket: getFlippedLosingMatchNumFromWinnerBracket,
	getNumOfMatchesForWinnerRound : getNumOfMatchesForWinnerRound,
	getNumOfPlayersInWinnerRound : getNumOfPlayersInWinnerRound, 
	getNumOfPlayersInLoserRound : getNumOfPlayersInLoserRound 
	*/
	getBracketSideFromMatchKey : getBracketSideFromMatchKey,
	getBracketRoundFromMatchKey : getBracketRoundFromMatchKey,
	getBracketMatchFromMatchKey : getBracketMatchFromMatchKey
}