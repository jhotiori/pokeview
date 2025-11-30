/*
    ~ favorites-service.js
    Favorites Service for PokeView
    @author jhotiori
*/

import { GetStorageItem, SetStorageItem, UpdateStorageItem } from "../api/storage.js";
import { StringSanitize } from "../utils/string-utils.js";
import { ErrorExpect } from "../utils/error-utils.js";
import { Emitter } from "../libs/emitter.js";
import { Logger } from "../libs/logger.js";

export const FavoritesLogger = new Logger("services/favorites-service.js");
export const FavoritesEmitter = new Emitter();
export let FavoritesCache = [];

const STORAGE_KEY = "favorites";

/**
 * Initializes the favorites database. This will check inside the Storage for the favorites list.
 * If it doesn't exist, it will create a new one.
 * @returns {Promise<string[]>} The favorites list
 */
export const FavoritesInit = async () => {
	let favorites = await GetStorageItem(STORAGE_KEY);

	if (!favorites) {
		FavoritesLogger.warn("Favorites cache not found - Creating a new Instance (...)");
		favorites = [];
		await SetStorageItem(STORAGE_KEY, favorites);
	} else {
		FavoritesLogger.success(`Favorites cache found! (${favorites.length} Favorites available)`);
	}

	FavoritesCache = favorites;
	FavoritesEmitter.emit("favorites:updated", FavoritesCache);
	return FavoritesCache;
};

/**
 * Adds a Pokémon to favorites using UpdateStorageItem (atomic).
 * Emits "update" after the update.
 * @param {string} name - Pokémon name
 * @returns {Promise<string[]>} Updated favorites list
 */
export const FavoritesAdd = async (name) => {
	ErrorExpect(typeof name === "string", "Expected name to be a string!");
	const sanitized = StringSanitize(name);

	await UpdateStorageItem(STORAGE_KEY, (previous) => {
		const current = Array.isArray(previous) ? previous : [];
		if (!current.includes(sanitized)) current.push(sanitized);

		FavoritesCache = current;
		FavoritesEmitter.emit("favorites:updated", FavoritesCache);

		return FavoritesCache;
	});

	return FavoritesCache;
};

/**
 * Removes a Pokémon from favorites using UpdateStorageItem (atomic).
 * Emits "update" after the update.
 * @param {string} name - Pokémon name
 * @returns {Promise<string[]>} Updated favorites list
 */
export const FavoritesRemove = async (name) => {
	ErrorExpect(typeof name === "string", "Expected name to be a string!");
	const sanitized = StringSanitize(name);

	await UpdateStorageItem(STORAGE_KEY, (previous) => {
		const current = Array.isArray(previous) ? previous : [];
		const index = current.indexOf(sanitized);
		if (index !== -1) current.splice(index, 1);

		FavoritesCache = current;
		FavoritesEmitter.emit("favorites:updated", FavoritesCache);

		return FavoritesCache;
	});

	return FavoritesCache;
};

/**
 * Checks if a Pokémon is in the favorites list.
 * Uses the internal FavoritesCache.
 * @param {string} name - Pokémon name
 * @returns {boolean} True if Pokémon is favorite
 */
export const FavoritesHas = (name) => {
	ErrorExpect(typeof name === "string", "Expected name to be a string!");
	return FavoritesCache.includes(StringSanitize(name));
};
