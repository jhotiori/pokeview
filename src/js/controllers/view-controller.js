/*
    ~ view-controller.js
    Controller for rendering Pokemons
    @author jhotiori
*/

import { FavoritesAdd, FavoritesRemove, FavoritesHas, FavoritesEmitter } from "../services/favorites-service.js";
import { PokemonServiceGetInformation } from "../services/pokemons-service.js";
import { SidebarControllerShow } from "./sidebar-controller.js";
import { APIGetPokemonsAsync } from "../api/pokeapi.js";
import { StringCapitalize } from "../utils/string-utils.js";
import { CreateElement } from "../libs/element.js";
import { ErrorExpect } from "../utils/error-utils";
import { FeaturesUse } from "../api/features.js";
import { StateCreate } from "../libs/state.js";
import { Emitter } from "../libs/emitter.js";
import { Logger } from "../libs/logger.js";
import { sleep } from "../utils/helper-utils.js";
import { $, $$ } from "../utils/dom-utils.js";

export const [ViewControllerState, SetViewControllerState] = StateCreate({ queries: [], inview: [] });
export const ViewControllerLogger = new Logger("controllers/view-controller.js");
export const ViewControllerEmitter = new Emitter();

const [ScrollListener, SetScrollListener] = StateCreate(null);
const [IsLoading, SetIsLoading] = StateCreate(false);

const DOMGetView = () => $("main #view");

/**
 *
 */
export const ViewControllerRender = async (queries, defs) => {
	ViewControllerReset(); // Clears the view
	ViewControllerHideEmpty(); // Hides the 'No Pokemons' message
	ViewControllerShowLoader(); // Shows loader
	SetViewControllerState({ queries, inview: [] });

	const { ChunkSize } = defs;
	const slice = queries.slice(0, ChunkSize);
	const pokemons = await APIGetPokemonsAsync(slice);
	await sleep(1000);

	await ViewControllerRenderCards({
		Start: 0,
		ChunkSize,
		Pokemons: pokemons,
	});

	ViewControllerEnableScroll({
		ChunkSize,
	});

	const state = ViewControllerState.get();
	SetViewControllerState({ queries, inview: [...state.inview, ...slice] });
	ViewControllerHideLoader();
};

/**
 * Resets the View. This will remove all cards inside of it.
 * It will also cleanup any listeners atached to the view.
 */
export const ViewControllerReset = () => {
	const view = DOMGetView();
	if (!view) return;

	view.innerHTML = "";

	const listener = ScrollListener.get();
	if (!listener) return;

	view.removeEventListener("scroll", listener);
	SetScrollListener(null);
};

/**
 * Shows a message saying 'No pokemons found' inside the view.
 * This will also clean up any listeners attached to any element. (loader, scroll)
 */
export const ViewControllerShowNoPokemons = () => {
	ViewControllerReset();
	ViewControllerHideLoader();
	ViewControllerShowEmpty();
};

/**
 *
 */
export const ViewControllerEnableScroll = (defs) => {
	const view = DOMGetView();
	if (!view) return;

	let listener = ScrollListener.get();
	if (listener) view.removeEventListener("scroll", listener);

	const { ChunkSize } = defs;

	listener = async () => {
		if (IsLoading.get()) return;
		if (!ViewControllerIsAtScrollEnd(view)) return;

		const state = ViewControllerState.get();
		const start = state.inview.length;
		const remaining = state.queries.length - start;
		if (remaining <= 0) return;

		// Render the remaining amount
		const count = Math.min(ChunkSize, remaining);
		view.removeEventListener("scroll", listener);
		SetIsLoading(true);

		await ViewControllerRenderNext({
			Start: start,
			ChunkSize: count,
		});

		SetIsLoading(false);
		view.addEventListener("scroll", listener);
	};

	SetScrollListener(listener);
	view.addEventListener("scroll", listener);
};

/**
 *
 */
export const ViewControllerRenderNext = async (defs) => {
	const view = DOMGetView();
	if (!view) return;

	const state = ViewControllerState.get();
	if (!state) return;

	const { Start, ChunkSize } = defs;

	const slice = state.queries?.slice(Start, Start + ChunkSize);
	if (!slice || slice?.length === 0) return;

	ViewControllerShowLoader();
	const pokemons = await APIGetPokemonsAsync(slice);
	await ViewControllerRenderCards({
		Start,
		ChunkSize: slice.length,
		Pokemons: pokemons,
	});

	ViewControllerHideLoader();
	SetViewControllerState({
		queries: state.queries,
		inview: [...state.inview, ...slice],
	});
};

/**
 * Renders an individual card for a Pokemon.
 * Already comes with favorite function built-in. (Must have feature enabled)
 * @param {Object} pokemon - The Pokemon to render
 * @returns {HTMLElement} The rendered card
 */
export const ViewControllerRenderCard = async (pokemon) => {
	ErrorExpect(pokemon, "Expected a valid pokemon!");
	const information = await PokemonServiceGetInformation(pokemon);

	if (!information) {
		ViewControllerLogger.error(`Could not render card for "${pokemon.name}" - no information found!`);
		return;
	}

	const { name, id, sprite, types } = information;
	let HeartElement = CreateElement("i", {
		id: "heart",
		class: "bi bi-heart",
	});

	FeaturesUse("enable-favorites", () => {
		const SetIcon = (isFavorite) => {
			if (isFavorite) {
				HeartElement.classList.replace("bi-heart", "bi-heart-fill");
				HeartElement.classList.add("favorited");
			} else {
				HeartElement.classList.replace("bi-heart-fill", "bi-heart");
				HeartElement.classList.remove("favorited");
			}
		};

		SetIcon(FavoritesHas(name));
		HeartElement.onclick = async () => {
			if (FavoritesHas(name)) {
				await FavoritesRemove(name);
			} else {
				await FavoritesAdd(name);
			}
			SetIcon(FavoritesHas(name));
		};

		FavoritesEmitter.on("favorites:updated", () => {
			SetIcon(FavoritesHas(name));
		});
	});

	const element = CreateElement(
		"article",
		{
			class: "card",
			"aria-label": `${name}'s Card`,
		},
		[
			CreateElement("img", {
				id: "sprite",
				src: sprite ?? "assets/question-mark.svg",
				loading: "lazy",
				alt: `${StringCapitalize(name)}'s Sprite`,
			}),

			CreateElement("div", { id: "information" }, [
				CreateElement("div", { id: "left" }, [
					CreateElement("p", { id: "name" }, StringCapitalize(name)),
					CreateElement("p", { id: "id" }, `#${String(id).padStart(4, "0")}`),
				]),

				CreateElement("div", { id: "right" }, [
					CreateElement("div", { id: "types" }, ViewControllerRenderTypes(types)),
					HeartElement,
				]),
			]),
		],
	);

	FeaturesUse("enable-sidebar", () => {
		element.addEventListener("click", async () => {
			await SidebarControllerShow(information, pokemon);
		});
	});

	return element;
};

/**
 * Renders several pokemon cards.
 *  Starts at the start index and ends at the end index.
 * @param {Object[]} pokemons - The Pokemons to render
 * @param {number} [start=0] - The start index
 * @param {number} [end=pokemons.length] - The end index
 */
export const ViewControllerRenderCards = async (defs) => {
	const view = DOMGetView();
	if (!view) return;

	const { Start, ChunkSize, Pokemons } = defs;
	const slice = Pokemons.slice(Start, Start + ChunkSize);
	const cards = await Promise.all(Pokemons.map(ViewControllerRenderCard));

	for (const card of cards) {
		card.classList.add("invisible");
		view.appendChild(card);
		requestAnimationFrame(() => card.classList.add("visible"));
	}
};

/**
 * Render an inidividual type of a pokemon.
 * @param {string} type - The type to render
 * @returns {HTMLElement} The rendered type
 */
export const ViewControllerRenderType = (type) => {
	ErrorExpect(typeof type === "string", "Expected a valid type!");
	return CreateElement("p", {}, [type]);
};

/**
 * Renders the `types` provided in an HTML fragment.
 * @param {string[]} types - The types of the Pokemon
 * @returns {DocumentFragment} The rendered types
 */
export const ViewControllerRenderTypes = (types) => {
	ErrorExpect(Array.isArray(types), "Expected an array of types!");

	const fragment = new DocumentFragment();
	for (const type of types) {
		const element = ViewControllerRenderType(type);
		fragment.appendChild(element);
	}
	return fragment;
};

/**
 * Shows the loader inside the view container.
 */
export const ViewControllerShowLoader = () => {
	const view = DOMGetView();
	if (!view) return;

	let overlay = $("#loader", view);
	if (overlay) overlay.remove();

	view.appendChild(
		CreateElement(
			"div",
			{
				id: "loader",
			},
			[
				CreateElement("img", {
					src: "assets/pokeball.svg",
					id: "icon",
					loading: "lazy",
					imageRendering: "pixelated",
					objectFit: "contain",
				}),
			],
		),
	);
};

/**
 * Removes the loader that was previously shown in view.
 */
export const ViewControllerHideLoader = () => {
	const view = DOMGetView();
	if (!view) return;

	const overlay = $("#loader", view);
	if (!overlay) return;
	overlay.remove();
};

/**
 * Shows an message inside the view container saying no pokemons were found.
 */
export const ViewControllerShowEmpty = () => {
	const view = DOMGetView();
	if (!view) return;

	let container = $("#message", view);
	if (container) container.remove();

	container = CreateElement("div", { id: "message" }, [
		CreateElement("p", { id: "title" }, ["No Pokémons found. :("]),
		CreateElement("p", { id: "subtitle" }, ["try searching something else..."]),
	]);

	view.appendChild(container);
};

/**
 * Removes the message that was previously shown in view. (No pokemons found)
 */
export const ViewControllerHideEmpty = () => {
	const view = DOMGetView();
	if (!view) return;

	const element = $("#message", view);
	if (element) element.remove();
};

/**
 * Checks if the user has truly reached the end of the scroll container.
 * Works for vertical or horizontal scroll dynamically.
 * @param {HTMLElement} container - The scrollable element
 * @param {number} buffer - Pixels from the end to trigger early (optional, default 0)
 * @returns {boolean} true if end reached
 */
const ViewControllerIsAtScrollEnd = (container, buffer = 2) => {
	const verticalScrollable = container.scrollHeight > container.clientHeight;
	const horizontalScrollable = container.scrollWidth > container.clientWidth;

	if (verticalScrollable) {
		return Math.ceil(container.scrollTop + container.clientHeight) >= container.scrollHeight - buffer;
	} else if (horizontalScrollable) {
		return Math.ceil(container.scrollLeft + container.clientWidth) >= container.scrollWidth - buffer;
	}

	return false;
};
