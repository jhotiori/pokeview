/*
    ~ string-utils.js
    Utility for JavaScript Strings
    @author jhotiori
*/

import { ErrorExpect } from "./error-utils.js";
import { Memoize } from "../libs/memoize.js";

/**
 * Capitalize the first letter of a string, or, if received an array
 * It'll capitalize all values of the array. (if they are strings)
 * @param {string|string[]} stringOrArray - The string/array to capitalize
 * @returns {string|string[]} The capitalized string/array
 */
export const StringCapitalize = Memoize((stringOrArray) => {
	ErrorExpect(typeof stringOrArray === "string" || Array.isArray(stringOrArray), "Expected a valid stringOrArray!");
	return Array.isArray(stringOrArray)
		? stringOrArray.map((value) => (typeof value === "string" ? value.charAt(0).toUpperCase() + value.slice(1) : value))
		: stringOrArray.charAt(0).toUpperCase() + stringOrArray.slice(1);
});

/**
 * Checks whether the string is empty or not.
 * @param {string} string - The string to check
 * @returns {boolean} True if the string is empty
 */
export const StringIsEmpty = (string) => typeof string === "string" && string.trim().length === 0;

/**
 * Sanitizes a Pokemon name to match PokeAPI requirements.
 * Handles capitalization, special forms, hyphens, dots, apostrophes, and Unicode.
 * @param {string} unsanitized - The raw Pokémon name
 * @returns {string} - Sanitized name compatible with PokeAPI
 */
export const StringSanitize = Memoize((unsanitized) => {
	ErrorExpect(typeof unsanitized === "string", "Expected a valid unsanitized string!");
	return unsanitized
		.normalize("NFD")
		.trim()
		.toLowerCase()
		.replace(/\bmega-(\w+)(?:-(x|y))?/, "$1-mega-$2")
		.replace(/\b(\w+)-(x|y)-mega\b/, "$1-mega-$2")
		.replace(/\balola-(\w+)/, "$1-alola")
		.replace(/\bgmax-(\w+)/, "$1-gmax")
		.replace(/\s+/g, "-")
		.replace(/♂/g, "-m")
		.replace(/♀/g, "-f")
		.replace(/['.\u0300-\u036f]/g, "")
		.replace(/\btype[: ]?null\b/g, "type-null")
		.replace(/[^a-z0-9-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "");
});
