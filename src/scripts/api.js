/*
    API Wrapper for the PokeAPI, dedicated to the PokeView Application
    @author jhotiori
*/

import { Pokedex } from "pokeapi-js-wrapper";
import { PokeConsole } from "./console.js";

import { SanitizePokemonName } from "./utils.js";
import invariant from "tiny-invariant";

export const PokeAPI = new Pokedex({
	protocol: "https",
	versionPath: "/api/v2/",

	cache: true,
	cacheImages: true,
	timeout: 5000,
});

let Cache = {}

export const GetPokemonByName = async (name, database) => {
	invariant(name, "Expected a Pokemon name!");
	invariant(Array.isArray(database), "Expected an Array Database!");

	const key = SanitizePokemonName(name);
	invariant(database.includes(key), `Pokémon '${name}' was not found in the provided Database!`);

	if (Cache[key]) return Cache[key];

	try {
		const value = await PokeAPI.getPokemonByName(key);
		invariant(value, `Empty response from PokeAPI for '${name}'!`);
		Cache[key] = value
		return value;
	} catch (err) {
		PokeConsole.warn(`Failed to fetch Pokémon '${name}' from the PokeAPI!\nAttached Error: ${err}`);
		return;
	}
};
