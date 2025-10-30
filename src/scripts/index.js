/*
	index.js
	Index JS for the PokeView Application
    @author jhotiori
*/

import { DBInit, DBQuery } from "./modules/db.js";
import { DOMInitSearchInput, DOMInitFilterToggle, DOMRenderQueries } from "./modules/dom.js";
import { PokeConsole } from "./modules/console.js";

(async () => {
	// Get cached Pokemons Database (contains ~1300 pokemons names as of now)
	// Case it does not exists, fetchs the list and caches it
    const PokemonsDB = await DBInit();

	// Initializes the Filter Toggle functionality
	DOMInitFilterToggle(".app > #banner > #container > #filter-toggle", ".app > #banner > #container > #filter-menu");

	// Listen to the 'SearchInput' from html, so we can hook the typing input and
	// Display the filtered results
    DOMInitSearchInput(".app > #banner > #container > #searchbar > input", async (rawQuery) => {
        const queries = DBQuery(PokemonsDB, rawQuery); // Get filtered queries
        PokeConsole.Info(`Found ${queries.length} results for '${rawQuery}'`);

        // Step 4: render the filtered Pokémon names
        await DOMRenderQueries(queries, PokemonsDB);
    });
})();
