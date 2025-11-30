/*
    ~ api/storage.js
    IDB-Keyval Storage with TTL (hours)
    @author jhotiori
*/

import { ErrorUnwrap, ErrorExpect } from "../utils/error-utils.js";
import { del, get, set, update } from "idb-keyval";
import { Logger } from "../libs/logger.js";
import stringify from "fast-json-stable-stringify";

export const StorageLogger = new Logger("api/storage.js");
const STORAGE_PREFIX = "pokeview@";

/**
 * Convert TTL (hours) into an epoch timestamp.
 * @param {number} ttlHours - Time to live, in hours.
 * @returns {number} Expiration timestamp in milliseconds.
 */
export const TtlToExpiryTimestamp = (ttlHours) => Date.now() + ttlHours * 60 * 60 * 1000;

/**
 * Resolve the final storage key with prefixing.
 * @param {string} key - Unprocessed user key.
 * @returns {string} Fully prefixed storage-safe key.
 */
export const ResolveStorageKey = (key) => {
	ErrorExpect(typeof key === "string", "Expected key to be a string!");
	return `${STORAGE_PREFIX}${key}`;
};

/**
 * Stores an item with the key of `key` and the value of `value` inside the storage.
 * @param {string} key - Key for the stored item.
 * @param {any} value - Any serializable data.
 * @param {number} ttlHours - (Optional) TTL in hours.
 * @returns {Promise<void>}
 */
export const SetStorageItem = async (key, value, ttlHours) => {
	ErrorExpect(typeof key === "string", "Expected key to be a string!");
	ErrorExpect(value !== undefined, "Expected a valid value!");

	const resolvedStorageKey = ResolveStorageKey(key);
	const payload = { value };

	if (typeof ttlHours === "number" && Number.isSafeInteger(ttlHours) && ttlHours >= 1) {
		payload.expiry = TtlToExpiryTimestamp(Math.floor(ttlHours));
	}

	await set(resolvedStorageKey, stringify(payload));
};

/**
 * Retrieves an item if not expired; auto-removes if expired or corrupted.
 * @param {string} key - Key identifying the stored item.
 * @returns {Promise<any|null>} Decoded value or null when expired/not found.
 */
export const GetStorageItem = async (key) => {
	ErrorExpect(typeof key === "string", "Expected key to be a string!");
	const resolvedStorageKey = ResolveStorageKey(key);
	const rawStoredValue = await get(resolvedStorageKey);

	if (!rawStoredValue) return null;
	let parsedPayload;

	try {
		parsedPayload = JSON.parse(rawStoredValue);
	} catch {
		await del(resolvedStorageKey);
		return null;
	}

	if (parsedPayload.expiry && Date.now() > parsedPayload.expiry) {
		await del(resolvedStorageKey);
		return null;
	}

	return parsedPayload.value;
};

/**
 * Removes an item from storage.
 * @param {string} key - Key to remove.
 * @returns {Promise<void>}
 */
export const DeleteStorageItem = async (key) => {
	ErrorExpect(typeof key === "string", "Expected key to be a string!");

	const resolvedStorageKey = ResolveStorageKey(key);
	await del(resolvedStorageKey).catch((error) =>
		StorageLogger.error(`Failed to delete storage key "${key}" (Error: ${ErrorUnwrap(error)})`),
	);
};

/**
 * Updates an item in storage.
 * @param {string} key - Key to update.
 * @param {Function} updateCallback - Function to update the value.
 * @returns {Promise<void>}
 */
export const UpdateStorageItem = async (key, updateCallback) => {
	ErrorExpect(typeof key === "string", "Expected key to be a string!");
	ErrorExpect(typeof updateCallback === "function", "Expected updateCallback to be a function!");
	const resolvedStorageKey = ResolveStorageKey(key);

	await update(resolvedStorageKey, (storedValue) => {
		if (!storedValue) return null;

		let parsedPayload;
		try {
			parsedPayload = JSON.parse(storedValue);
		} catch {
			return null;
		}

		const newValue = updateCallback(parsedPayload.value);
		parsedPayload.value = newValue ?? parsedPayload.value;
		return stringify(parsedPayload);
	}).catch((error) => {
		StorageLogger.error(`Failed to update key "${key}" (Error: ${ErrorUnwrap(error)})`);
	});
};
