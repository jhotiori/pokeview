/*
    ~ banner-controller.js
    Controller for the PokeView Banner
    @author jhotiori
*/

import { FavoritesAdd, FavoritesRemove, FavoritesHas, FavoritesEmitter } from "../services/favorites-service.js";
import { PokemonServiceGetInformation } from "../services/pokemons-service.js";
import { APIGetRandomPokemonAsync } from "../api/pokeapi.js";

import { ErrorExpect, ErrorUnwrap } from "../utils/error-utils.js";
import { StringCapitalize } from "../utils/string-utils.js";
import { CreateElement } from "../libs/element.js";
import { TimerCreate } from "../services/timer-service.js";
import { StateCreate } from "../libs/state.js";
import { FeaturesUse } from "../api/features.js";
import { Emitter } from "../libs/emitter.js";
import { Logger } from "../libs/logger.js";
import { $, $$ } from "../utils/dom-utils.js";

export const BannerLogger = new Logger("controllers/banner-controller.js");
export const BannerEmitter = new Emitter();

let [HeartListener, SetHeartListener] = StateCreate(null);
let [ActiveTimer, SetActiveTimer] = StateCreate(null);

const DOMGetBanner = () => $("main #banner");

/**
 * Constructs the DOM for a Pokemon to be shown to the banner.
 * @param {Object} defs - The definitions
 * @returns {Object} The DOM
 */
const DOMConstructPokemon = (defs) => {
	return {
		name: defs.name,
		sprite: defs.sprite,
		types: defs.types,
		stats: defs.stats,
		favorite: FavoritesHas(defs.name),
	};
};

/**
 * Initializes the Banner Controller.
 * @param {object} options - The options
 * @param {string} options.Name - The name selector
 * @param {string} options.Sprite - The sprite selector
 * @param {string} options.Types - The types selector
 * @param {string} options.Heart - The heart selector
 * @param {string} options.Timer - The timer selector
 * @returns {void}
 */
export const BannerControllerInit = (
	options = { Name: "", Sprite: "", Types: "", Heart: "", Timer: "", Stats: "" },
) => {
	ErrorExpect(typeof options === "object", "Expected a valid options object!");
	ErrorExpect(typeof options.Name === "string", "Expected a valid name selector!");
	ErrorExpect(typeof options.Sprite === "string", "Expected a valid sprite selector!");
	ErrorExpect(typeof options.Types === "string", "Expected valid types selector!");
	ErrorExpect(typeof options.Heart === "string", "Expected a valid heart selector!");
	ErrorExpect(typeof options.Timer === "string", "Expected a valid timer selector!");
	ErrorExpect(typeof options.Stats === "string", "Expected a valid stats selector!");

	const DOMGetElement = (selector, name) => {
		const element = $(selector);
		ErrorExpect(element, `Expected a valid ${name} element! (Selector "${selector}")`);
		return element;
	};

	const BannerName = DOMGetElement(options.Name, "Name");
	const BannerSprite = DOMGetElement(options.Sprite, "Sprite");
	const BannerTypes = DOMGetElement(options.Types, "Types");
	const BannerHeart = DOMGetElement(options.Heart, "Heart");
	const BannerTimer = DOMGetElement(options.Timer, "Timer");
	const BannerStats = DOMGetElement(options.Stats, "Stats");

	BannerEmitter.on("pokemon:ready", (defs) => {
		BannerControllerSetName(BannerName, defs.name);
		BannerControllerSetSprite(BannerSprite, defs.sprite);
		BannerControllerSetTypes(BannerTypes, defs.types);
		BannerControllerSetStats(BannerStats, defs.stats);
		FeaturesUse("enable-favorites", () => BannerControllerSetHeart(BannerHeart, defs.name));
	});

	BannerEmitter.on("pokemon:missing", () => {
		BannerControllerSetName(BannerName, "N/A");
		BannerControllerSetSprite(BannerSprite, "assets/question-mark.svg");
		BannerControllerSetTypes(BannerTypes, ["???"]);
		BannerControllerSetStats(BannerStats, null);
	});

	BannerEmitter.on("timer:start", () => {
		BannerControllerStartTimer(BannerTimer, 10, () => {
			BannerControllerInitLoop();
		});
	});

	BannerEmitter.on("timer:clear", () => {
		const Timer = ActiveTimer.get();
		if (!Timer) return;

		Timer.Clear();
		SetActiveTimer(null);
	});

	BannerControllerInitLoop();
};

/**
 * Initializes the Banner Controller Loop.
 */
export const BannerControllerInitLoop = async () => {
	BannerEmitter.emit("timer:clear");

	const pokemon = await APIGetRandomPokemonAsync();

	if (!pokemon) {
		BannerLogger.warn(`Current Pokemon in Loop was not found - fallbacking (...)`);
		BannerEmitter.emit("pokemon:missing");
		BannerEmitter.emit("timer:start");
		return;
	}

	const information = PokemonServiceGetInformation(pokemon);

	if (!information) {
		BannerLogger.warn(`Current Pokemon in Loop Information was not found - fallbacking (...)`);
		BannerEmitter.emit("pokemon:missing");
		BannerEmitter.emit("timer:start");
		return;
	}

	BannerEmitter.emit("pokemon:ready", DOMConstructPokemon(information));
	BannerEmitter.emit("timer:start");
};

/**
 * Sets the name of the banner.
 * @param {HTMLElement} element - The banner element
 * @param {string} name - The name
 */
export const BannerControllerSetName = (element, name) => {
	ErrorExpect(element, "Expected a valid element!");
	ErrorExpect(typeof name === "string", "Expected a valid name!");
	const banner = DOMGetBanner();
	if (!banner) return;

	const pokemonBanner = $("#banner__pokemon", banner);
	if (!pokemonBanner) return;

	const OnGMAX = () => pokemonBanner.classList.add("gmax");
	const OnMega = () => pokemonBanner.classList.add("mega");
	const NotGMAX = () => pokemonBanner.classList.remove("gmax");
	const NotMega = () => pokemonBanner.classList.remove("mega");

	element.textContent = StringCapitalize(name);
	name.includes("-gmax") ? OnGMAX() : NotGMAX();
	name.includes("-mega") ? OnMega() : NotMega();
};

/**
 * Sets the sprite of the banner.
 * @param {HTMLElement} element - The banner element
 * @param {string} src - The sprite source
 */
export const BannerControllerSetSprite = (element, src) => {
	ErrorExpect(element, "Expected a valid element!");
	ErrorExpect(typeof src === "string", "Expected a valid src!");
	element.src = src;
	element.onerror = (error) => {
		BannerLogger.warn(`Failed to load image "${src}" - fallbacking (Error: ${ErrorUnwrap(error)})`);
		element.src = "assets/question-mark.svg";
	};
};

/**
 * Sets the types of the banner.
 * @param {HTMLElement} element - The banner element
 * @param {HTMLDocumentFragment} types - The types
 */
export const BannerControllerSetTypes = (element, types) => {
	ErrorExpect(element, "Expected a valid element!");
	ErrorExpect(typeof types === "object", "Expected valid array of types!");
	const typesFragment = BannerControllerRenderTypes(types);
	element.replaceChildren(typesFragment);
};

/**
 * Sets the heart of the banner and hooks into it for future changes.
 * Reacts automatically to FavoritesEmitter updates.
 * @param {HTMLElement} element - The heart element
 * @param {string} name - The name of the pokemon
 */
export const BannerControllerSetHeart = (element, name) => {
	ErrorExpect(element, "Expected a valid element!");
	ErrorExpect(typeof name === "string", "Expected a valid name!");

	const SetIcon = (isFavorite) => BannerControllerSetHeartIcon(element, isFavorite);
	element.onclick = async () => (FavoritesHas(name) ? await FavoritesRemove(name) : await FavoritesAdd(name));

	const previous = HeartListener.get();
	if (typeof previous === "function") {
		previous(); // Cleanup
	}

	const listener = () => SetIcon(FavoritesHas(name));
	const unsubscribe = FavoritesEmitter.on("favorites:updated", listener);

	SetHeartListener(unsubscribe);
	SetIcon(FavoritesHas(name));
};

/**
 * Sets the heart icon of the banner basing on if it is favorite or not.
 * @param {HTMLElement} element - The heart element
 * @param {boolean} isFavorite - True if the pokemon is favorite
 */
export const BannerControllerSetHeartIcon = (element, isFavorite) => {
	ErrorExpect(element, "Expected a valid element!");
	ErrorExpect(typeof isFavorite === "boolean", "Expected a valid boolean!");

	if (isFavorite) {
		element.classList.replace("bi-heart", "bi-heart-fill");
		element.classList.add("favorited");
	} else {
		element.classList.replace("bi-heart-fill", "bi-heart");
		element.classList.remove("favorited");
	}
};

/**
 * Sets the stats of the banner.
 * @param {HTMLElement} element - The stats element
 * @param {Object} stats - The stats
 */
export const BannerControllerSetStats = (element, stats) => {
	ErrorExpect(element, "Expected stats list element!");

	const spans = $$("#value", element);
	if (!stats) {
		spans.forEach((span) => (span.textContent = "???"));
		return;
	}

	const ordered = [
		stats.health,
		stats.attack,
		stats.defense,
		stats.speed,
		stats.height,
		stats.weight,
		stats.special_attack,
		stats.special_defense,
	];

	spans.forEach((span, index) => {
		span.textContent = ordered[index] ?? "???";
	});
};

/**
 * Renders the types of a Pokemon.
 * This will only return the document fragment containing the types.
 * @param {string[]} types - The types of the Pokemon
 * @returns {DocumentFragment} The rendered types
 */
export const BannerControllerRenderTypes = (types) => {
	ErrorExpect(Array.isArray(types), "Expected types to be an array!");

	const fragment = new DocumentFragment();
	for (const type of types) {
		const element = CreateElement("p", {}, [type]);
		fragment.append(element);
	}
	return fragment;
};

/**
 * Starts the timer for the banner.
 * @param {HTMLElement} element - The timer element
 * @param {number} seconds - The seconds
 * @param {Function} onCompleted - The callback to run when the timer is completed
 */
export const BannerControllerStartTimer = (element, seconds, onCompleted) => {
	ErrorExpect(element, "Expected a valid element!");
	ErrorExpect(typeof seconds === "number", "Expected a valid seconds!");
	ErrorExpect(typeof onCompleted === "function", "Expected a valid onCompleted function!");

	SetActiveTimer(
		TimerCreate({
			Tick: (remaining) => BannerControllerOnTimerTick(element, remaining),
			Completed: () => onCompleted(),
			Interval: seconds,
		}),
	);
};

/**
 * Updates the timer element on tick.
 * @param {HTMLElement} element - The timer element
 * @param {number} remaining - The remaining seconds
 */
export const BannerControllerOnTimerTick = (element, remaining) => {
	let tickType = remaining <= 3 ? "tick-danger" : "tick";
	element.textContent = `${remaining}s`;
	element.classList.add(tickType);

	setTimeout(() => {
		element.classList.remove(tickType);
	}, 200);
};
