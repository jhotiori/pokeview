/*
    Index JS for the PokeView Application
    @author jhotiori
*/

import { $ } from "./utils.js";
import { GetPokemonByName, PokeAPI } from "./api.js";
import { PokeConsole } from "./console.js";
import { Constants } from "./constants.js";
import { SetStorage, GetStorage } from "./storage.js";

import invariant from "tiny-invariant";

let Database = GetStorage(Constants.DATABASE_KEY);

if (!Database) {
	PokeConsole.info(`Database not found, trying to fetch it from the PokeAPI...`);

	(async () => {
		try {
			const response = await PokeAPI.getPokemonsList();
			invariant(response, "No data returned from `PokeAPI.getPokemonsList()`!");

			Database = response?.results?.map((pokemon) => pokemon.name.toLowerCase());
			invariant(Database, "Failed to parse Database from PokeAPI response");

			PokeConsole.log(`Database successfully fetched!`);
			SetStorage(Constants.DATABASE_KEY, Database);
		} catch (err) {
			PokeConsole.error(`Could not fetch the list of Pokemons from the PokeAPI: ${err}`);
		}
	})();
}

PokeConsole.log(`Database loaded - retrieved ${Database.length} Pokemons!`);

$(".app > #banner > #container > #filter-toggle").addEventListener("click", () => {
	$(".app > #banner > #container > #filter-menu").classList.toggle("active");
})
