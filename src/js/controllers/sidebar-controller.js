/*
    ~ sidebar-controller
    Controller for the PokeView Sidebar
    @author jhotiori
*/

import { PokemonServiceGetEvolutions } from "../services/pokemons-service.js";
import { StringCapitalize } from "../utils/string-utils.js";
import { CreateElement } from "../libs/element.js";
import { ErrorExpect } from "../utils/error-utils.js";
import { Emitter } from "../libs/emitter.js";
import { Logger } from "../libs/logger.js";
import { $, $$ } from "../utils/dom-utils.js";

export const SidebarControllerLogger = new Logger("controllers/sidebar-controller.js");
export const SidebarControllerEmitter = new Emitter();

const DOMGetSidebar = () => $("#sidebar");

/**
 * Initializes the sidebar controller.
 * This creates a new sidebar container in the DOM.
 */
export const SidebarControllerInit = () => {
	const sidebar = DOMGetSidebar();
	/*sidebar.innerHTML = `
		<div id="sidebar__overlay"></div>
		<div id="sidebar__content">
			<button id="close"><i class="bi bi-x-square-fill"></i></button>
			<div id="hero">
				<img id="sprite" src="assets/question-mark.svg" alt="???">
				<div id="details">
					<h2 id="name">N/A</h2>
					<div id="types"></div>
					<div id="box">
						<ul id="stats"></ul>
					</div>
				</div>
			</div>
		</div>
	`;*/

	const EscapeListener = async (event) => (event.key === "Escape" ? await SidebarControllerHide() : null);
	const CloseListener = async () => await SidebarControllerHide();
	const button = $("#sidebar__content #close", sidebar);

	document.addEventListener("keydown", EscapeListener);
	button.addEventListener("click", CloseListener);
};

/**
 * INTERNAL: Awaits the end of a CSS transition.
 * @param {HTMLElement} element - The element
 * @returns {Promise<void>}
 */
const WaitForTransitionEnd = (element) => {
	return new Promise((resolve) => {
		const handler = (e) => {
			// Ensures only the main transition triggers
			if (e.target !== element) return;

			element.removeEventListener("transitionend", handler);
			resolve();
		};

		element.addEventListener("transitionend", handler);
	});
};

/**
 * Shows the sidebar containing information about the provided pokemon.
 * Contains name, stats, evolution, etc.
 * Only works if the sidebar has been initialized before.
 * @param {Object} pokemon - The pokemon to show
 */
export const SidebarControllerShow = async (information, pokemon) => {
	const sidebar = DOMGetSidebar();
	if (!sidebar) return;

	sidebar.classList.add("open");
	SidebarControllerEmitter.emit("sidebar:show");

	SidebarControllerSetName(StringCapitalize(information.name).toUpperCase());
	SidebarControllerSetTypes(information.types);
	SidebarControllerSetSprite(information.sprite);
	SidebarControllerSetStats(information.stats);
	SidebarControllerSetEvolutions();

	const evolutions = (await PokemonServiceGetEvolutions(pokemon)) ?? [];
	SidebarControllerSetEvolutions(evolutions);
};

/**
 * Hides the sidebar.
 * Only works if the sidebar has been initialized before.
 */
export const SidebarControllerHide = async () => {
	const sidebar = DOMGetSidebar();
	if (!sidebar) return;

	sidebar.classList.remove("open");
	SidebarControllerEmitter.emit("sidebar:hide");

	const content = $("#sidebar__content", sidebar);
	if (!content) return;

	await WaitForTransitionEnd(content);
};

/**
 * Resets the sidebar.
 * Only works if the sidebar has been initialized before.
 */
export const SidebarControllerReset = () => {
	const sidebar = DOMGetSidebar();
	if (!sidebar) return;
};

/**
 * Sets the name of the pokemon in the sidebar.
 * Only works if the sidebar has been initialized before.
 * @param {string} name - The name of the pokemon
 */
export const SidebarControllerSetName = (name) => {
	const sidebar = DOMGetSidebar();
	if (!sidebar) return;

	const element = $("#sidebar__content #hero #details #name", sidebar);
	if (!element) return;

	element.textContent = name;
};

/**
 * Sets the sprite of the pokemon in the sidebar.
 * Only works if the sidebar has been initialized before.
 * @param {string} sprite - The sprite of the pokemon
 */
export const SidebarControllerSetSprite = (sprite) => {
	const sidebar = DOMGetSidebar();
	if (!sidebar) return;

	const element = $("#sidebar__content #hero #sprite", sidebar);
	if (!element) return;

	element.src = sprite;
	element.onerror = () => (element.src = "assets/question-mark.svg");
};

/**
 * Sets the types of the pokemon in the sidebar.
 * Only works if the sidebar has been initialized before.
 * @param {string[]} types - The types of the pokemon
 */
export const SidebarControllerSetTypes = (types) => {
	ErrorExpect(Array.isArray(types), "Expected an array of types!");

	const sidebar = DOMGetSidebar();
	if (!sidebar) return;

	const element = $("#sidebar__content #hero #details #types", sidebar);
	if (!element) return;

	const fragment = SidebarControllerRenderTypes(types);
	element.replaceChildren(fragment);
};

/**
 * Sets the stats of the pokemon in the sidebar.
 * Only works if the sidebar has been initialized before.
 * @param {object} stats - The stats of the pokemon
 */
export const SidebarControllerSetStats = (stats) => {
	const sidebar = DOMGetSidebar();
	if (!sidebar) return;

	const element = $("#sidebar__content #hero #details #box #stats", sidebar);
	if (!element) return;

	const order = [
		stats.health,
		stats.attack,
		stats.defense,
		stats.speed,
		stats.height,
		stats.weight,
		stats.special_attack,
		stats.special_defense,
	];

	const items = $$("li", element);
	for (const item of items) {
		const value = $("#value", item);
		value.textContent = order.shift();
	}
};

/**
 * Sets the evolutions of the pokemon in the sidebar.
 * Only works if the sidebar has been initialized before.
 * @param {object[]} evolutions - The evolutions of the pokemon
 */
export const SidebarControllerSetEvolutions = async (evolutions) => {
	const sidebar = DOMGetSidebar();
	if (!sidebar) return;

	const container = $("#sidebar__content #hero #details #evolutions", sidebar);
	if (!container) return;

	container.innerHTML = "";
	container.appendChild(SidebarControllerRenderEvolutions(evolutions));
};
/**
 * Renders an individual type to the sidebar.
 * @param {string} type - The type to render
 * @returns {HTMLElement} The rendered type
 */
export const SidebarControllerRenderType = (type) => {
	ErrorExpect(typeof type === "string", "Expected a valid type!");
	return CreateElement("p", {}, [type]);
};

/**
 * Renders the types of a Pokemon to the sidebar.
 * @param {string[]} types - The types of the Pokemon
 * @returns {DocumentFragment} The rendered types
 */
export const SidebarControllerRenderTypes = (types) => {
	ErrorExpect(Array.isArray(types), "Expected an array of types!");
	const fragment = new DocumentFragment();
	for (const type of types) {
		const element = SidebarControllerRenderType(type);
		fragment.appendChild(element);
	}
	return fragment;
};

/**
 * Renders an evolution to the sidebar.
 * @param {object} evolution - The evolution to render
 * @returns {HTMLElement} The rendered evolution
 */
export const SidebarControllerRenderEvolution = (evolution) => {
	ErrorExpect(typeof evolution === "object", "Expected a valid evolution object!");
	const element = CreateElement("img", {
		src: evolution.sprite,
		loading: "lazy",
		alt: `${StringCapitalize(evolution.name)}'s Evolution`,
		ariaLabel: `${StringCapitalize(evolution.name)}'s Evolution`,
	});
	element.onerror = () => (element.src = "assets/question-mark.svg");
	return element;
};

/**
 * Renders the evolutions of a Pokémon to a DocumentFragment,
 * including arrows between evolutions.
 * @param {object[]} evolutions - The evolutions of the Pokémon
 * @returns {DocumentFragment} The fragment ready to append to the sidebar
 */
export const SidebarControllerRenderEvolutions = (evolutions) => {
	ErrorExpect(Array.isArray(evolutions), "Expected an array of evolutions!");
	const fragment = new DocumentFragment();

	if (!evolutions.length) {
		const fallback1 = CreateElement("img", {
			src: "assets/question-mark.svg",
			loading: "lazy",
			alt: "???'s Evolution",
		});
		const fallback2 = CreateElement("img", {
			src: "assets/question-mark.svg",
			loading: "lazy",
			alt: "???'s Evolution",
		});
		const arrow = CreateElement("i", { class: "bi bi-arrow-right" });

		fragment.appendChild(fallback1);
		fragment.appendChild(arrow);
		fragment.appendChild(fallback2);
		return fragment;
	}

	for (let i = 0; i < evolutions.length; i++) {
		const element = SidebarControllerRenderEvolution(evolutions[i]);
		fragment.appendChild(element);

		if (i < evolutions.length - 1) {
			const arrow = CreateElement("i", { class: "bi bi-arrow-right" });
			fragment.appendChild(arrow);
		}
	}

	return fragment;
};
