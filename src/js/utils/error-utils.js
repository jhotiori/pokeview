/*
    ~ error-utils.js
    Utility functions related to JavaScript Errors
    @author jhotiori
*/

import { Memoize } from "../libs/memoize.js";
import { Logger } from "../libs/logger.js";
import stringify from "fast-json-stable-stringify";

export const ErrorLogger = new Logger("utils/error-utils.js");

/**
 * Unwraps an error to retieve it's content.
 * @param {any} err - Error object to unwrap
 * @returns {string} The error content
 */
export const ErrorUnwrap = Memoize((error) => {
	if (!error) return "Unknown Error";
	if (error instanceof Error) return error.message || error.toString();
	try {
		return stringify(error);
	} catch {
		return String(error);
	}
});

/**
 * Checks if `condition` is true, and throws an error if it is not.
 * @param {Boolean} condition - Condition to expect
 * @param {String} message - Message to throw
 * @param {Function} handler - (Optional) Error handler (defaults to `console.error`)
 */
export const ErrorExpect = (condition, message = "Expected condition to be true!", ...args) => {
	if (!condition) ErrorLogger.error(message, ...args);
};
