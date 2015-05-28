// MATH UTILITIES

function isPowerOf2(num) {
	if(typeof num !== "number") {
		throw new Error
	}
	return (num != 0 && (num & (num-1)) == 0);
}

function nextPowerOf2(num) {
	num--;
	num |= num >> 1;
	num |= num >> 2;
	num |= num >> 4;
	num |= num >> 8;
	num |= num >> 16;
	num++;
	return num;
}

function timesCanBeDividedBy2(num) {
	return Math.floor(Math.log(num)/Math.log(2));
}

function nearestEvenNumberDown(num) {
	if(num % 2 === 0) {
		return num;
	}
	return --num;
}

function nearestEvenNumberUp(num) {
	if(num % 2 === 0) {
		return num;
	}
	return ++num;
}

console.log("Times can be divided by 2: "+(timesCanBeDividedBy2(8)));

module.exports = {
	isPowerOf2 : isPowerOf2, 
	nextPowerOf2 : nextPowerOf2,
	timesCanBeDividedBy2 : timesCanBeDividedBy2,
	nearestEvenNumberDown : nearestEvenNumberDown, 
	nearestEvenNumberUp : nearestEvenNumberUp
}