/*
    Index JS for the PokeView Application
    @author jhotiori
*/

import { GetPokemonByName, PokeAPI } from "./api.js";
import { PokeConsole } from "./console.js";
import { Constants } from "./constants.js";
import { GetStorage, SetStorage } from "./storage.js";
import { $, $$, SanitizePokemonName } from "./utils.js";

import invariant from "tiny-invariant";

let Database = GetStorage(Constants.DATABASE_KEY);

async function DBInitialize() {
	if (Database) {
		PokeConsole.log(`Database loaded - retrieved ${Database.length} Pokemons!`);
		return;
	}

	PokeConsole.info(`Database not found, fetching from PokeAPI...`);

	try {
		const response = await PokeAPI.getPokemonsList();
		invariant(response, "No data returned from `PokeAPI.getPokemonsList()`!");

		Database = response?.results?.map((pokemon) => pokemon.name.toLowerCase());
		invariant(Database, "Failed to parse Database from PokeAPI response");

		SetStorage(Constants.DATABASE_KEY, Database);
		PokeConsole.log(`Database successfully fetched and cached!`);
	} catch (err) {
		PokeConsole.error(`Could not fetch Pokémon list: ${err}`);
	}
}

function DBGetQueries(database, query) {
	return database.filter((pokemon) => pokemon.includes(query.toLowerCase()));
}

function RenderPokemonCard(pokemon) {
	const card = document.createElement("div");
	card.style.opacity = "0";
	card.classList.add("pokemon-card");

	// Favorites handler
	const favorites = GetStorage(Constants.FAVORITES_KEY) || [];
	const isFavorite = favorites.includes(pokemon.name);

	// Pokémon image
	const fallbackImg = "assets/question.png";
	const img = document.createElement("img");

	img.src =
		pokemon.sprites?.other?.["official-artwork"]?.front_default || pokemon.sprites?.front_default || fallbackImg;
	img.onerror = () => {
		img.src = fallbackImg;
	};

	card.appendChild(img);

	// Type/specs
	const specs = document.createElement("p");
	specs.id = "specs";
	specs.textContent = pokemon.types.map((t) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)).join(", ");
	card.appendChild(specs);

	// ID
	const id = document.createElement("p");
	id.id = "id";
	id.textContent = `#${pokemon.id}`;
	card.appendChild(id);

	// Favorite button
	const favIcon = document.createElement("i");
	favIcon.id = "favorite";
	favIcon.className = isFavorite ? "bx bxs-heart" : "bx bx-heart";
	favIcon.style.color = isFavorite ? "hotpink" : "var(--text-1)";
	favIcon.addEventListener("click", () => {
		let favs = GetStorage(Constants.FAVORITES_KEY) || [];

		if (favs.includes(pokemon.name)) {
			// Remove from favorites (was there -> remove)
			favs = favs.filter((p) => p !== pokemon.name);
			favIcon.className = "bx bx-heart";
			favIcon.style.color = "var(--text-1)";
		} else {
			// Add to favorites (wasn't there -> add)
			favs.push(pokemon.name);
			favIcon.className = "bx bxs-heart";
			favIcon.style.color = "hotpink";
		}

		SetStorage(Constants.FAVORITES_KEY, favs);
	});
	card.appendChild(favIcon);

	// Name description box
	const description = document.createElement("div");
	description.id = "description";

	const name = document.createElement("p");
	name.id = "name";
	name.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

	description.appendChild(name);
	card.appendChild(description);

	return card;
}

async function RenderPokemonQueries(queryArray, start = 0, end = queryArray.length) {
	const caroussel = $(".app > #viewport > #caroussel");
	const slice = queryArray.slice(start, end);
	const favorites = GetStorage(Constants.FAVORITES_KEY) || [];
	caroussel.innerHTML = "";

	for (const name of slice) {
		const pokemon = await GetPokemonByName(name, Database);
		if (!pokemon) continue;

		const card = RenderPokemonCard(pokemon, favorites);
		caroussel.appendChild(card);
		requestAnimationFrame(() => {
			card.style.opacity = "1";
		});
	}
}

$(".app > #banner > #container > #filter-toggle").addEventListener("click", () => {
	$(".app > #banner > #container > #filter-menu").classList.toggle("active");
});

const FilterButtons = $$("#filter-menu > button");
let CurrentFilter = "none"; // "favorites" | "asc" | "desc"

FilterButtons.forEach((btn) => {
	btn.addEventListener("click", async (e) => {
		e.preventDefault();
		const selectedFilter = btn.dataset.filter; // e.g. data-filter="favorites"

		// toggle logic
		if (CurrentFilter === selectedFilter) {
			CurrentFilter = "none";
			PokeConsole.info(`Filter cleared.`);
		} else {
			CurrentFilter = selectedFilter;
			PokeConsole.info(`Filter set to: ${CurrentFilter}`);
		}

		const query = CurrentFilter === "favorites" ? "" : SanitizePokemonName(SearchInput.value.trim());
		await ApplyFilters(Database, query);
	});
});

async function ApplyFilters(baseData = Database, query = "") {
	let db = query ? DBGetQueries(baseData, query) : null;
	PokeConsole.warn(`Current Filter: ${CurrentFilter}`)

	// Favorites fiter
	if (CurrentFilter === "favorites") {
		const favs = GetStorage(Constants.FAVORITES_KEY) || [];

		if (favs.length === 0) {
			PokeConsole.info("No favorites found!");
			CurrentFilter = "none";
			await RenderPokemonQueries([], 0, 0);
			return;
		}

		db = db ? db.filter((p) => favs.includes(p)) : favs;
	}

	if (!db) db = [/*...baseData.slice(0, 25)*/]; // only fallback to first 25 DB entries if no filter

	// Apply sorting filters
	if (CurrentFilter === "asc") db.sort((a, b) => a.localeCompare(b));
	if (CurrentFilter === "desc") db.sort((a, b) => b.localeCompare(a));

	// Render filtered version
	await RenderPokemonQueries(db, 0, db.length);
}

const SearchInput = $(".app > #banner > #container > #searchbar > input");
let IsRendering = false;
let RenderTimeout = null;

SearchInput.addEventListener("input", (e) => {
	e.preventDefault();
	clearTimeout(RenderTimeout);

	const rawQuery = e.target.value.trim();

	if (!rawQuery || rawQuery.length === 0) {
		PokeConsole.warn(`Query '${rawQuery}' is too small, ignoring`);
		return;
	}

	if (IsRendering) {
		PokeConsole.warn(`Currently rendering, skipping new request`);
		return;
	}

	RenderTimeout = setTimeout(async () => {
		if (IsRendering) return;
		IsRendering = true;

		const query = SanitizePokemonName(rawQuery);
		await ApplyFilters(Database, query);

		IsRendering = false;
	}, 400);
});

(async () => {
	await DBInitialize();
})();
