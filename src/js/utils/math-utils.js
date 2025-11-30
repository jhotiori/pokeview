/*
    ~ math-utils.js
    Utility functions related to Math
    @author jhotiori
*/

import { ErrorExpect } from "./error-utils.js";

const BUFFER = new Uint32Array(1);

/**
 * Generates a random number between 0 and `limit`
 * @param {number} limit - The limit
 * @returns {any} The random chosen value
 */
export const MathRandom = (limit) => {
	ErrorExpect(Number.isSafeInteger(limit) || limit !== 0, "Random limit must be a positive integer and not zero!");
	crypto.getRandomValues(BUFFER);
	return BUFFER[0] % limit;
};

/**
 * Checks if a value is a safe integer
 * @param {any} value - The value to check
 * @returns {boolean} Whether the value is a safe integer
 */
export const MathIsNotZero = (value) => typeof value === "number" && Number.isSafeInteger(value) && value > 0;
