/*
    db.js
    Database Module for the PokeView Application
    @author jhotiori
*/

import { GetStorage, SetStorage, USE_PREFIX } from "./storage.js";
import { SanitizePokemonName } from "./utils.js";
import { Memoize } from "./memoize.js";
import { Constants } from "../constants.js";

import { PokeAPI } from "./api.js";
import { PokeConsole } from "./console.js";

import invariant from "tiny-invariant";

const DB_KEY = Constants.POKEMONS_KEY;
const DB_MEMOIZE = new Memoize({
	limit: 100,
	ttl: 60 * 1000,
	updates: true,
});

/**
 * Initialize the local Pokémon database.
 * If data exists and TTL (24h) is valid, reuse cache.
 */
export async function DBInit() {
	const cached = GetStorage(DB_KEY);

	if (cached) {
		PokeConsole.Info("Database was found - still cached, reusing!");
		return cached;
	}

	try {
		PokeConsole.Info("Database not found - Fetching Pokémon list from PokeAPI!");
		let data = await PokeAPI.getPokemonsList();
		invariant(data, `No data returned from PokeAPI.getPokemonsList() call!`);

		// Data exists, but it comes as uppercase (e.g: 'Pikachu', 'Charizard', ...)
		// So we pre-compute into lowercase to avoid computing at each query (over 1000 computes per query)
		data = data.results.map((pokemon) => pokemon.name.toLowerCase());

		SetStorage(DB_KEY, data, 24);
		PokeConsole.Success("Successfully cached Pokémon namelist! (24h)");
		return data;
	} catch (err) {
		PokeConsole.Error("Failed to initialize Database:", err);
		return [];
	}
}

/**
 * (Internal) Query Pokémon names from the local database, sanitizing the query case it exists.
 * @param {string[]} database - Cached Pokémon list.
 * @param {string} query - Search string.
 * @returns {string[]} - Filtered Pokémon names.
 */
function __DBQuery(database, query = "") {
	invariant(database, "Expected a Database, got nothing!");
	invariant(Array.isArray(database), "Expected a valid array Pokémon list!");
	if (!query) return database;

	const sanitized = SanitizePokemonName(query).toLowerCase();
	return database.filter((name) => name.includes(sanitized));
}

/**
 * Query Pokémon names from the local database, sanitizing the query case it exists.
 * Results are cached for further optimization and speed.
 * @param {string[]} database - Cached Pokémon list.
 * @param {string} query - Search string.
 * @returns {string[]} - Filtered Pokémon names.
 */
export const DBQuery = DB_MEMOIZE.Memoize((database, query) => {
	return __DBQuery(database, query);
});
