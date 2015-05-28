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

function getLosingRoundNumFromWinnerBracket( currentRoundNum ) {
	if(typeof currentRoundNum !== "number") {
		throw new Error("Current round number must be a number");
	}
	if(currentRoundNum <= 1) {
		throw new Error("Can't get losing round number from bracket winner")
	}

	if(currentRoundNum === 2) {
		return 2;
	}

	return (currentRoundNum - 3) + currentRoundNum;
}

function getWinningMatchNumFromWinnerBracket( currentMatchNum ) {
	if(typeof currentMatchNum !== "number") {
		throw new Error("Current match number must be a number");
	}

	return mathUtil.nearestEvenNumberUp(currentMatchNum) / 2;
}

function getFlippedLosingMatchNumFromWinnerBracket( totalNumOfPlayers, currentMatchNum ) {
	if(typeof totalNumOfPlayers !== "number" || !mathUtil.isPowerOf2(totalNumOfPlayers)) {
		throw new Error("Total number of players must be a power of 2");
	}
	if(typeof currentMatchNum !== "number") {
		throw new Error("Current match number must be a number");
	}

	return getNumOfMatchesForWinnerRound(totalNumOfPlayers + 1) - currentMatchNum;
}

function getNumOfMatchesForWinnerRound( totalNumOfPlayers, currentRoundNum ) {
	if(typeof totalNumOfPlayers !== "number" || !mathUtil.isPowerOf2(totalNumOfPlayers)) {
		throw new Error("Total number of players must be a power of 2");
	}
	if(typeof currentRoundNum !== "number") {
		throw new Error("Current round number must be a number");
	}

	var numOfPlayersInRound = getNumOfPlayersInWinnerRound(totalNumOfPlayers, currentRoundNum);
	return mathUtil.timesCanBeDividedBy2(numOfPlayersInRound) + 1;
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

module.exports = {
	getNumOfRoundsInWinnerBracket : getNumOfRoundsInWinnerBracket,
	getNumOfRoundsInLoserBracket: getNumOfRoundsInLoserBracket,
	getWinningRoundNumFromWinnerBracket : getWinningRoundNumFromWinnerBracket,
	getLosingRoundNumFromWinnerBracket : getLosingRoundNumFromWinnerBracket,
	getWinningMatchNumFromWinnerBracket : getWinningMatchNumFromWinnerBracket,
	getFlippedLosingMatchNumFromWinnerBracket: getFlippedLosingMatchNumFromWinnerBracket,
	getNumOfMatchesForWinnerRound : getNumOfMatchesForWinnerRound,
	getNumOfPlayersInWinnerRound : getNumOfPlayersInWinnerRound, 
	getNumOfPlayersInLoserRound : getNumOfPlayersInLoserRound 
}