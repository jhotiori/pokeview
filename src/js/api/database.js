/*
    ~ database.js
    Pokemons Database of PokeView
    @author jhotiori
*/

import { GetStorageItem, SetStorageItem } from "./storage.js";
import { APIGetAllPokemonsAsync } from "./pokeapi.js";
import { StringSanitize } from "../utils/string-utils.js";
import { ErrorExpect } from "../utils/error-utils.js";

import { Emitter } from "../libs/emitter.js";
import { Memoize } from "../libs/memoize.js";
import { Logger } from "../libs/logger.js";

export const DBEmitter = new Emitter();
export const DBLogger = new Logger("api/database.js");
export let DBCache = [];

const STORAGE_KEY = "namelist";

/**
 * Initializes the Pokemons Database and updates the internal cache.
 * @returns {Promise<string[]>}
 */
export const DBInit = async () => {
	let pokemons = await GetStorageItem(STORAGE_KEY);

	if (!pokemons) {
		DBLogger.warn("Pokemons Database cache not found - Fetching from PokeAPI (...)");
		pokemons = await APIGetAllPokemonsAsync();
		await SetStorageItem(STORAGE_KEY, pokemons, 24);
		DBEmitter.emit("cache:new");
	} else {
		DBLogger.success(`Pokemons Database cache found! (${pokemons.length} Pokemons available)`);
		DBEmitter.emit("cache:found");
	}

	DBCache = pokemons;
	DBEmitter.emit("cache:loaded");

	return pokemons;
};

/**
 * Queries into the internal Pokémon DB cache.
 * Results are memoized for speed.
 * @param {string} query - The query to search for
 * @returns {string[]} The results
 */
export const DBQuery = Memoize((query) => {
	ErrorExpect(typeof query === "string", "Expected query to be a string!");
	query = StringSanitize(query);
	return query.length <= 2
		? DBCache.filter((pokemon) => pokemon.startsWith(query))
		: DBCache.filter((pokemon) => pokemon.includes(query));
});
