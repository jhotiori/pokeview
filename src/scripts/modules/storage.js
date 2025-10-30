/*
    storage.js
    LocalStorage Wrapper with TTL (time-to-last) for the PokeView Application
    @author jhotiori
*/

import { PokeConsole } from "./console.js";
import { Constants } from "../constants.js";

import invariant from "tiny-invariant";
import dayjs from "dayjs";

const [Stringify, Parse] = [JSON.stringify, JSON.parse];
const STORAGE_PREFIX = Constants.STORAGE_PREFIX;

/**
 * Formats the 'key' provided into a prefixed key to be stored.
 * The formatted prefix results in 'pokeview@key'.
 * @param {*} key
 * @returns {string} The prefixed key
 */
export const USE_PREFIX = (key) => `${STORAGE_PREFIX}${key}`;

/**
 * Get an item from storage and check TTL (time-to-last) if defined.
 * @param {string} key - The storage key (without prefix).
 * @returns {any|null}
 */
export function GetStorage(key) {
	invariant(key, "Expected a valid key for storage!");

	// Get item from storage using the prefix
	const item = localStorage.getItem(USE_PREFIX(key));
	if (!item) return;

	try {
		const parsed = Parse(item);
		if (!parsed) return;

		// Check if the item has an expiry time and has expired
		if (parsed.expiry && dayjs().isAfter(dayjs(parsed.expiry))) {
			RemoveStorage(key);
			return;
		}

		return parsed.value ?? parsed;
	} catch (err) {
		PokeConsole.Error("[Storage:GetStorage] Failed to parse key:", key, err);
		RemoveStorage(key);
		return;
	}
}

/**
 * Set an item in storage with optional TTL (time-to-last) in hours.
 * @param {string} key - The storage key (without prefix).
 * @param {any} value - The value to store.
 * @param {number|null} ttl - Time to live in hours.
 */
export function SetStorage(key, value, ttl = null) {
	invariant(key, "Expected a valid key for storage!");
	invariant(value !== undefined, "Cannot store undefined value!");

	const entry = {
		value: value,
	};

    if (ttl) {
        entry.expiry = dayjs().add(ttl, "hour").valueOf()
    }

	localStorage.setItem(USE_PREFIX(key), Stringify(entry));
}

/**
 * Removes an item from storage.
 * @param {string} key
 */
export function RemoveStorage(key) {
	invariant(key, "Expected a valid key for storage removal!");
	localStorage.removeItem(USE_PREFIX(key));
}
