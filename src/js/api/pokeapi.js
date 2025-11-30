/*
    ~ pokeapi.js
    Memoized & Safe PokeAPI Wrapper with Sanitization
    @author jhotiori
*/

import { ErrorUnwrap, ErrorExpect } from "../utils/error-utils.js";
import { StringSanitize } from "../utils/string-utils.js";
import { MathRandom } from "../utils/math-utils.js";
import { Pokedex } from "pokeapi-js-wrapper";
import { Memoize } from "../libs/memoize.js";
import { Emitter } from "../libs/emitter.js";
import { DBCache } from "./database.js";
import { Logger } from "../libs/logger.js";

export const APILogger = new Logger("api/pokeapi.js");
export const APIEmitter = new Emitter();
export const APIPokedex = new Pokedex({
	protocol: "https",
	versionPath: "/api/v2/",
	timeout: 5000,

	cache: true,
	cacheImages: true,
});

/**
 * Fetch a Pokémon by name.
 * Returns the Pokémon object or null if not found.
 * @param {string} name - Pokémon name
 * @returns {Promise<Object|null>} The pokemon object
 */
export const APIGetPokemonByNameAsync = Memoize(async (name) => {
	ErrorExpect(typeof name === "string", "Expected name to be a valid string!");

	try {
		const sanitized = StringSanitize(name);
		const pokemon = await APIPokedex.getPokemonByName(sanitized);
		if (!pokemon) return;

		return pokemon;
	} catch (error) {
		APILogger.warn(`Failed to get Pokemon "${name}" from the PokeAPI! (Error: ${ErrorUnwrap(error)})`);
		return;
	}
});

/**
 * Fetch multiple Pokémon by an array of names.
 * Returns an array of Pokémon objects (ignores invalid pokemons).
 * @param {string[]} names - Array of Pokémon names
 * @returns {Promise<Object[]>} The pokemons' objects
 */
export const APIGetPokemonsAsync = Memoize(async (names) => {
	ErrorExpect(Array.isArray(names), "Expected an array of names!");
	const results = await Promise.all(names.map(async (name) => await APIGetPokemonByNameAsync(name)));
	return results.filter(Boolean);
});

/**
 * Fetch all Pokémon for a given type.
 * Returns an array of Pokémon objects (ignores invalid ones).
 * @param {string} type - Pokémon type
 * @returns {Promise<Object[]>} The pokemons' objects
 */
export const APIGetPokemonsByTypeAsync = Memoize(async (type) => {
	ErrorExpect(typeof type === "string", "Expected a valid type!");

	try {
		const sanitized = StringSanitize(type);
		const typeData = await APIPokedex.getTypeByName(sanitized);
		if (!typeData?.pokemon) return [];

		const pokemons = await Promise.all(
			typeData.pokemon.map(async (p) => await APIGetPokemonByNameAsync(p.pokemon.name)),
		);
		return pokemons.filter(Boolean);
	} catch (error) {
		APILogger.warn(
			`Failed to get Pokemons with the type of "${sanitized}" from the PokeAPI! (Error: ${ErrorUnwrap(error)})`,
		);
		return [];
	}
});

/**
 * Returns an array with the names of all Pokemons in the PokeAPI.
 * @returns {Promise<string[]>} The names of all Pokemons
 */
export const APIGetAllPokemonsAsync = async () => {
	try {
		const pokemons = await APIPokedex.getPokemonsList();
		return pokemons?.results?.map((pokemon) => pokemon.name.toLowerCase()) || [];
	} catch (error) {
		APILogger.warn(`Failed to get all Pokemons from the PokeAPI! (Error: ${ErrorUnwrap(error)})`);
		return [];
	}
};

/**
 * Returns a random Pokémon object from the provided database of names
 * @param {string[]} database - Array of Pokémon names
 * @returns {Promise<Object|null>} Random Pokémon
 */
export const APIGetRandomPokemonAsync = async () => {
	ErrorExpect(DBCache, `Expected DBCache to be loaded - Call DBInit(...) first!`);
	const index = MathRandom(DBCache.length);

	const name = DBCache.at(index);
	ErrorExpect(name, `Expected name coming from DBCache, got something invalid!`);

	const pokemon = await APIGetPokemonByNameAsync(name);
	ErrorExpect(pokemon, `Expected pokemon to be returned, got something invalid!`);

	return pokemon;
};
