/*
    ~ search-controller.js
    Controller for the PokeView Search
    @author jhotiori
*/

import { DBCache, DBQuery } from "../api/database.js";
import { StringSanitize } from "../utils/string-utils.js";
import { ErrorExpect } from "../utils/error-utils.js";
import { StateCreate } from "../libs/state.js";
import { Emitter } from "../libs/emitter.js";
import { $, $$ } from "../utils/dom-utils.js";

export const SearchEmitter = new Emitter();

/**
 * Initializes the Search Controller.
 * @param {string} inputSelector - The input selector
 * @param {object} options - The options
 * @param {Function} options.Validate - The validate function
 * @param {Function} options.Query - The query function
 * @param {Function} options.Render - The render function
 * @param {Function} options.Reset - The reset function
 * @param {number} options.Delay - The delay
 * @returns {void}
 */
export const SearchControllerInit = (
	selector,
	options = { Query: () => {}, Render: () => {}, Validate: () => {}, Reset: () => {}, Delay: 500 },
) => {
	ErrorExpect(typeof selector === "string", "Expected a valid input selector!");

	const DOMInput = $(selector);
	ErrorExpect(DOMInput, `Expected a valid input element! (Selector "${selector}")`);

	const { Validate, Query, Render, Reset, Delay } = options;
	const [Timeout, SetTimeout] = StateCreate(null);
	const [Rendering, SetRendering] = StateCreate(false);

	SearchEmitter.on("timeout:clear", () => {
		const timeout = Timeout.get();
		if (!timeout) return;

		clearTimeout(timeout);
		SetTimeout(null);
	});

	SearchEmitter.on("render:start", () => {
		SetRendering(true);
	});

	SearchEmitter.on("render:finish", () => {
		SetRendering(false);
	});

	DOMInput.addEventListener("input", (e) => {
		const rendering = Rendering.get();
		if (rendering) return;

		const value = DOMInput.value;
		SearchEmitter.emit("timeout:clear");

		SetTimeout(
			setTimeout(async () => {
				if (!Validate(value)) {
					SearchEmitter.emit("input:failed");
					Reset();
					return;
				}

				const queries = Query(value);
				SearchEmitter.emit("render:start");

				if (!queries && queries?.length === 0) {
					Reset();
					SearchEmitter.emit("render:finish");
					return;
				}

				await Render(queries);
				SearchEmitter.emit("render:finish");
			}, Delay),
		);
	});
};

/**
 *
 */
export const SearchControllerInitFilters = (options = { Selector: "", Callback: () => {} }) => {
	const { Selector, Callback } = options;

	ErrorExpect(typeof Selector === "string", "Expected a valid selector!");
	ErrorExpect(typeof Callback === "function", "Expected a valid callback!");

	const groups = $$(Selector);
	ErrorExpect(groups.length > 0, "No filter groups found!");

	const states = new WeakMap();

	const CloseAllExcept = (excludedGroup) => {
		groups.forEach((group) => {
			if (group === excludedGroup) return;

			const statePair = states.get(group);
			if (!statePair) return;

			const [IsOpen, SetIsOpen] = statePair;
			if (!IsOpen.get()) return;
			SetIsOpen(false);

			const menu = $(".dropdown__menu", group);
			if (!menu) return;

			menu.style.display = "none";
		});
	};

	groups.forEach((group) => {
		const button = $(".dropdown__button", group);
		const menu = $(".dropdown__menu", group);
		const options = $$(".dropdown__option", group);
		ErrorExpect(button && menu, "Dropdown group missing button or menu!");

		const [IsOpen, SetIsOpen] = StateCreate(false);
		states.set(group, [IsOpen, SetIsOpen]);
		menu.style.display = "none";

		const render = () => {
			menu.style.display = IsOpen.get() ? "flex" : "none";
		};

		button.addEventListener("click", (e) => {
			e.stopPropagation();
			CloseAllExcept(group);
			SetIsOpen(!IsOpen.get());
			render();
		});

		options.forEach((option) => {
			option.addEventListener("click", (e) => {
				e.stopPropagation();

				SetIsOpen(false);
				render();
				CloseAllExcept(null);

				Callback({
					value: option.dataset.value,
					type: option.dataset.type,
				});
			});
		});
	});

	document.addEventListener("click", () => CloseAllExcept(null));
};

/**
 * Queries the database.
 * @param {string} input - The input
 * @param {object} DBCache - The database cache
 */
export const SearchControllerQuery = (input) => DBQuery(input, DBCache);

/**
 * Validates the Input of the searchbar.
 * @param {string} input - The input
 * @returns {boolean} True if the input is valid
 */
export const SearchControllerValidate = (input) => {
	return StringSanitize(input).length > 0;
};
