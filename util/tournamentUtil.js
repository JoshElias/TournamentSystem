var mathUtil = require("./mathUtil");


// TOURNAMENT HELPERS



// Double Elimination

function getNumOfRoundsInWinnerBracket( totalNumOfPlayers ) {
	if(typeof totalNumOfPlayers !== "number" || !mathUtil.isPowerOf2(totalNumOfPlayers)) {
		throw new Error("Total number of players must be a power of 2");
	}

	return mathUtil.timesCanBeDividedBy2(totalNumOfPlayers) + 1;
}

function getNumOfRoundsInLoserBracket( totalNumOfPlayers ) {
	if(typeof totalNumOfPlayers !== "number" || !mathUtil.isPowerOf2(totalNumOfPlayers)) {
		throw new Error("Total number of players must be a power of 2");
	}

	return (mathUtil.timesCanBeDividedBy2(totalNumOfPlayers / 2) * 2) + 1;
}

function getWinningRoundNumFromWinnerBracket( currentRoundNum ) {
	if(typeof currentRoundNum !== "number") {
		throw new Error("Current round number must be a number");
	}
	if(currentRoundNum <= 1) {
		return 1;
	}

	return --currentRoundNum;
}

function getLosingRoundNumFromWinnerBracket( totalNumOfPlayers, currentRoundNum ) {
	if(typeof currentRoundNum !== "number" || currentRoundNum <= 1) {
		throw new Error("Current round number must be a number above 1");
	}

	var totalNumOfRounds = getNumOfRoundsInWinnerBracket(totalNumOfPlayers);
	if(currentRoundNum === totalNumOfRounds) {
		return currentRoundNum + currentRoundNum - 3;
	} else {
		return currentRoundNum + currentRoundNum - 2;
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

 	if(currentRoundNum === totalNumOfRounds-1) {
 		return currentMatchNum;
 	} else {
 		return mathUtil.nearestEvenNumberUp(currentMatchNumber) / 2;
 	}
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

module.exports = {
	getNumOfRoundsInWinnerBracket : getNumOfRoundsInWinnerBracket,
	getNumOfRoundsInLoserBracket: getNumOfRoundsInLoserBracket,
	getWinningRoundNumFromWinnerBracket : getWinningRoundNumFromWinnerBracket,
	getLosingRoundNumFromWinnerBracket : getLosingRoundNumFromWinnerBracket,
	getWinningMatchNumFromWinnerBracket : getWinningMatchNumFromWinnerBracket,
	getLosingMatchNumFromWinnerBracket : getLosingMatchNumFromWinnerBracket,
	/*
	getFlippedLosingMatchNumFromWinnerBracket: getFlippedLosingMatchNumFromWinnerBracket,
	getNumOfMatchesForWinnerRound : getNumOfMatchesForWinnerRound,
	getNumOfPlayersInWinnerRound : getNumOfPlayersInWinnerRound, 
	getNumOfPlayersInLoserRound : getNumOfPlayersInLoserRound 
	*/
}