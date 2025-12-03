/*
    ~ pokemons-service.js
    Pokemons Service for PokeView
    @author jhotiori
*/

import { APIGetPokemonByNameAsync, APIPokedex } from "../api/pokeapi.js";
import { StringCapitalize } from "../utils/string-utils.js";
import { ErrorExpect, ErrorUnwrap } from "../utils/error-utils.js";
import { Logger } from "../libs/logger.js";

const InformationCache = new WeakMap();
const EvolutionCache = new WeakMap();
const SpritesCache = new WeakMap();
const StatsCache = new WeakMap();
const TypesCache = new WeakMap();

const FALLBACK_SPRITE = "assets/question-mark.svg";
const FALLBACK_TYPES = ["???"];
const FALLBACK_STATS = {
	health: 0,
	attack: 0,
	defense: 0,
	speed: 0,
	special_attack: 0,
	special_defense: 0,
};

export const PokemonServiceLogger = new Logger("services/pokemons-service.js");

/**
 * Returns the base stats of a Pokemon in a structured format.
 * @param {Object} pokemon - The Pokemon object
 * @returns {Object} The Pokemon's stats mapped by name
 */
export const PokemonServiceGetStats = (pokemon) => {
	ErrorExpect(typeof pokemon === "object", "Expected a valid Pokemon object!");

	if (!pokemon.stats) {
		StatsCache.set(pokemon, FALLBACK_STATS);
		return FALLBACK_STATS;
	}

	if (StatsCache.has(pokemon)) return StatsCache.get(pokemon);

	const statsArray = pokemon.stats;
	const result = {
		health: statsArray[0].base_stat,
		attack: statsArray[1].base_stat,
		defense: statsArray[2].base_stat,
		speed: statsArray[5].base_stat,
		special_attack: statsArray[3].base_stat,
		special_defense: statsArray[4].base_stat,
		height: pokemon.height,
		weight: pokemon.weight,
	};

	StatsCache.set(pokemon, result);
	return result;
};

/**
 * Returns the capitalized types of a Pokemon.
 * @param {Object} pokemon - The Pokemon object
 * @returns {string[]} Array of formatted type names
 */
export const PokemonServiceGetTypes = (pokemon) => {
	ErrorExpect(typeof pokemon === "object", "Expected a valid Pokemon object!");

	if (!pokemon.types) {
		TypesCache.set(pokemon, FALLBACK_TYPES);
		return FALLBACK_TYPES;
	}

	if (TypesCache.has(pokemon)) return TypesCache.get(pokemon);

	const result = pokemon.types?.map((entry) => StringCapitalize(entry.type.name)) ?? [];
	TypesCache.set(pokemon, result);
	return result;
};

/**
 * Selects the most appropriate sprite for a Pokemon.
 * Prefers GIF (Showdown), then official artwork, then fallbacks.
 * @param {Object} pokemon - The Pokemon object
 * @returns {string} The selected sprite URL
 */
export const PokemonServiceGetSprite = (pokemon) => {
	ErrorExpect(pokemon && typeof pokemon === "object", "Expected a valid Pokemon object!");
	if (SpritesCache.has(pokemon)) return SpritesCache.get(pokemon);

	const sprites = pokemon.sprites;

	if (!sprites) {
		SpritesCache.set(pokemon, FALLBACK_SPRITE);
		return FALLBACK_SPRITE;
	}

	const gifSprite = sprites?.other?.showdown?.front_default;
	const fallbackSprite =
		sprites.front_default ||
		sprites.other?.["official-artwork"]?.front_default ||
		sprites.other?.["dream-world"]?.front_default ||
		sprites.other?.home?.front_default;
	const chosenSprite = gifSprite || fallbackSprite || FALLBACK_SPRITE;

	SpritesCache.set(pokemon, chosenSprite);
	return chosenSprite;
};

/**
 * Returns the necessary basic information of a Pokemon.
 * @param {Object} pokemon - The Pokemon object
 * @returns {Object} The Pokemon's information
 */
export const PokemonServiceGetInformation = (pokemon) => {
	ErrorExpect(typeof pokemon === "object", "Expected a valid Pokemon object!");
	if (InformationCache.has(pokemon)) return InformationCache.get(pokemon);

	const information = {
		name: pokemon.name,
		id: pokemon.id,
		sprite: PokemonServiceGetSprite(pokemon),
		types: PokemonServiceGetTypes(pokemon),
		stats: PokemonServiceGetStats(pokemon),
	};

	InformationCache.set(pokemon, information);
	return information;
};

/**
 * Returns the evolutions of a Pokemon.
 * @param {Object} pokemon - The Pokemon object
 * @returns {Object} The Pokemon's evolutions
 */
export const PokemonServiceGetEvolutions = async (pokemon) => {
	ErrorExpect(typeof pokemon === "object", "Expected a valid Pokemon object!");
	if (EvolutionCache.has(pokemon)) return EvolutionCache.get(pokemon);

	// Normalize name before getting specie
	const baseName = pokemon?.species?.name ?? pokemon?.name?.split("-")[0];
	let species;

	try {
		species = await APIPokedex.getPokemonSpeciesByName(baseName);
	} catch (err) {
		PokemonServiceLogger.warn(`Species not found for "${pokemon.name}" (Error: ${ErrorUnwrap(err)})`);
		return null; // or return {}; depends on your UI
	}

	if (!species || !species.evolution_chain?.url) return;

	const url = species.evolution_chain.url;
	const id = url.split("/").filter(Boolean).pop();
	if (!id) return;

	const evolutionChain = await APIPokedex.getEvolutionChainById(id);
	if (!evolutionChain) return;

	const names = [];
	const GetNextEvolution = (node) => {
		names.push(node.species.name);
		node.evolves_to.forEach((child) => GetNextEvolution(child));
	};

	GetNextEvolution(evolutionChain.chain);
	const evolutions = await Promise.all(
		names.map(async (name) => {
			const pokemon = await APIGetPokemonByNameAsync(name);
			return PokemonServiceGetInformation(pokemon);
		}),
	);

	PokemonServiceLogger.info(`Evolutions retrieved for ${pokemon.name}:`, evolutions);
	EvolutionCache.set(pokemon, evolutions);

	return evolutions;
};
