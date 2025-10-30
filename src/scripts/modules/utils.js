/*
	utility.js
	Utility functions for the PokeView Application
    @author jhotiori
*/

export const $ = (selector = "*", object = document) => object.querySelector(selector);
export const $$ = (selector = "*", object = document) => Array.from(object.querySelectorAll(selector));

export const SanitizePokemonName = (unsanitized = "") => {
	return unsanitized
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // "Flabébé" → "Flabebe"
		.replace(/♀/g, "f")
		.replace(/♂/g, "m") // Replace gender symbols
		.replace(/[^a-zA-Z0-9]/g, "-") // Remove everything except letters/numbers
		.replace(/-+/g, "-") // Collapse multiple dashes into one
		.replace(/^-|-$/g, ""); // Trim dashes at the start/end
};
