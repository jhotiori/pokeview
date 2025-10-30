/*
	api.js
	API Wrapper for the PokeAPI, dedicated to the PokeView Application
    @author jhotiori
*/

import { Pokedex } from "pokeapi-js-wrapper";
import { PokeConsole } from "./console.js";
import { SanitizePokemonName } from "./utils.js";
import { Memoize } from "./memoize.js";

import invariant from "tiny-invariant";

export const PokeAPI = new Pokedex({
	protocol: "https",
	versionPath: "/api/v2/",

	cache: true,
	cacheImages: true,
	timeout: 5000,
});

const Cache = {};
const API_MEMOIZE = new Memoize({
	limit: 1000,
	ttl: 10 * 60 * 1000, // 10 minutes
	updates: true,
});

/**
 * (Internal) Gets a Pokémon by its name from the PokeAPI.
 * @param {string} name - Name of the Pokémon.
 * @param {string[]} database - Local Database for validation & lookup.
 * @returns {object} - Pokemon object from the PokeAPI.
 */
const __GetPokemonByName = async (name, database) => {
	invariant(name, "Expected a Pokemon name!");
	invariant(Array.isArray(database), "Expected an Array Database!");

	const key = SanitizePokemonName(name).toLowerCase();
	invariant(database.includes(key), `Pokémon '${name}' was not found in the provided Database!`);

	if (Cache[key]) return Cache[key];

	try {
		const value = await PokeAPI.getPokemonByName(key);
		invariant(value, `Empty response from PokeAPI for '${name}'!`);
		Cache[key] = value;
		return value;
	} catch (err) {
		PokeConsole.Warn(`Failed to fetch Pokémon '${name}' from the PokeAPI!\nAttached Error: ${err}`);
		return;
	}
};

/**
 * Gets a Pokémon by its name from the PokeAPI.
 * @param {string} name - Name of the Pokémon.
 * @param {string[]} database - Local Database for validation & lookup.
 * @returns {object} - Pokemon object from the PokeAPI.
 */
export const GetPokemonByName = API_MEMOIZE.Memoize(async (name, database) => {
	return __GetPokemonByName(name, database);
});
