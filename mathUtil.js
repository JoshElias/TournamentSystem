// MATH UTILITIES

function isPowerOf2(num) {
	return (num != 0 && (num & (num-1)) == 0) ? "YES" : "NO";
}

function nextPowerOfTwo(num) {
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

module.exports = {
	isPowerOf2 : isPowerOf2, 
	nextPowerOfTwo : nextPowerOfTwo,
	timesCanBeDividedBy2 : timesCanBeDividedBy2,
	nearestEvenNumberDown : nearestEvenNumberDown, 
	nearestEvenNumberUp : nearestEvenNumberUp
}