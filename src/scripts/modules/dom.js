/*
    dom.js
    DOM Rendering Module for the PokeView Application
    @author jhotiori
*/

import { GetStorage, SetStorage } from "./storage.js";
import { Constants } from "../constants.js";
import { PokeConsole } from "./console.js";
import { GetPokemonByName } from "./api.js";
import { SanitizePokemonName, $ } from "./utils.js";

import invariant from "tiny-invariant";

let CurrentView = []; // holds current visible Pokemon names

/**
 * Renders a single Pokémon card.
 * @param {Object} pokemon - Full Pokémon data
 * @param {boolean} [updateFavorites=true] - Toggle favorite button
 * @returns {HTMLElement}
 */
export function DOMRenderCard(pokemon, updateFavorites = true) {
	invariant(pokemon, "Expected a Pokémon object to render!");

	// Main card container
	const card = document.createElement("div");
	card.classList.add("pokemon-card");
	card.setAttribute("role", "listitem");
	card.dataset.name = pokemon.name;
	card.dataset.id = pokemon.id;
	card.style.opacity = "0";

	// Favorites array & check
	const favorites = GetStorage(Constants.FAVORITES_KEY) || [];
	const isFavorite = favorites.includes(pokemon.name);

	// Image
	const fallbackImg = "assets/question.png";
	const img = document.createElement("img");
	img.classList.add("pokemon-image");
	img.src =
		pokemon?.sprites?.other?.["official-artwork"]?.front_default ||
		pokemon?.sprites?.front_default ||
		pokemon?.sprites?.other?.home?.front_default;
	img.alt = `${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} ARTWORK`;
	img.onerror = () => {
		img.src = fallbackImg;
	};
	card.appendChild(img);

	// Types / Specs
	const specs = document.createElement("p");
	specs.classList.add("pokemon-specs");
	specs.textContent = pokemon.types.map((t) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)).join(", ");
	card.appendChild(specs);

	// ID
	const id = document.createElement("p");
	id.classList.add("pokemon-id");
	id.textContent = `#${pokemon.id}`;
	card.appendChild(id);

	// Favorite button
	if (updateFavorites) {
		const favIcon = document.createElement("i");
		favIcon.className = isFavorite ? "pokemon-favorite bx bxs-heart" : "pokemon-favorite bx bx-heart";
		favIcon.setAttribute("aria-label", "Favorite toggle");
		favIcon.style.color = isFavorite ? "hotpink" : "var(--text-1)";

		favIcon.addEventListener("click", () => {
			let favs = GetStorage(Constants.FAVORITES_KEY) || [];
			if (favs.includes(pokemon.name)) {
				favs = favs.filter((p) => p !== pokemon.name);
				favIcon.className = "pokemon-favorite bx bx-heart";
				favIcon.style.color = "var(--text-1)";
			} else {
				favs.push(pokemon.name);
				favIcon.className = "pokemon-favorite bx bxs-heart";
				favIcon.style.color = "hotpink";
			}
			SetStorage(Constants.FAVORITES_KEY, favs);
		});
		card.appendChild(favIcon);
	}

	// Description & Name
	const description = document.createElement("div");
	description.classList.add("pokemon-description");
	description.setAttribute("aria-label", "Description");

	const name = document.createElement("p");
	name.classList.add("pokemon-name");
	name.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

	description.appendChild(name);
	card.appendChild(description);

	return card;
}

/**
 * Render an array of Pokémon names (queries) into a container.
 * Updates CurrentView automatically.
 * @param {string[]} queryArray - Array of Pokémon names
 * @param {Object} options - { containerSelector, start, end }
 */
export async function DOMRenderQueries(
	queryArray,
	database,
	{ selector = ".app > #viewport > #caroussel", start = 0, end = queryArray.length } = {},
) {
	invariant(Array.isArray(queryArray), "Expected an array of Pokémon names!");

	const container = $(selector);
	if (!container) throw new Error(`Container not found: ${containerSelector}`);

	const slice = queryArray.slice(start, end);
	container.innerHTML = "";

	for (const name of slice) {
		const pokemon = await GetPokemonByName(name, database);
		if (!pokemon) continue;

		const card = DOMRenderCard(pokemon);
		container.appendChild(card);

		requestAnimationFrame(() => {
			card.style.opacity = "1";
		});
	}

	// Update CurrentView
	CurrentView = slice;
}

/**
 * Get current visible Pokémon names
 * @returns {string[]}
 */
export function DOMGetCurrentView() {
	return CurrentView;
}

/**
 * Clear CurrentView and container
 * @param {string} selector
 */
export function DOMClear(selector = ".app > #viewport > #caroussel") {
	const container = $(selector);
	if (container) container.innerHTML = "";
	CurrentView = [];
}

/**
 * Initialize filter toggle button
 * @param {string} toggleSelector
 * @param {string} menuSelector
 */
export function DOMInitFilterToggle(toggleSelector, menuSelector) {
	const toggle = $(toggleSelector);
	const menu = $(menuSelector);
	if (!toggle || !menu) return;

	toggle.addEventListener("click", () => {
		menu.classList.toggle("active");
	});
}

/**
 * Initialize search input with callback
 * @param {string} inputSelector
 * @param {Function} callback
 */
export function DOMInitSearchInput(inputSelector, callback) {
	const input = $(inputSelector);
	if (!input) return;

	let renderTimeout = null;
	let isRendering = false;

	input.addEventListener("input", (e) => {
		e.preventDefault();
		clearTimeout(renderTimeout);

		const rawQuery = e.target.value.trim();

		if (!rawQuery || rawQuery.length === 0) {
			PokeConsole.Warn(`Query '${rawQuery}' is too small, ignoring`);
			return;
		}

		if (isRendering) {
			PokeConsole.Warn(`Currently rendering, skipping new request`);
			return;
		}

		renderTimeout = setTimeout(async () => {
			if (isRendering) return;
			isRendering = true;

			await callback(rawQuery);

			isRendering = false;
		}, 400);
	});
}
