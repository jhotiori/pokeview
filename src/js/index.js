/*
    ~ index.js
    Main Logic file for PokeView
    @author jhotiori
*/

import {
	SearchControllerInit,
	SearchControllerInitFilters,
	SearchControllerQuery,
	SearchControllerValidate,
	SearchEmitter,
} from "./controllers/search-controller.js";
import { FeaturesBulkEnable, FeaturesBulkDisable, FeaturesUse } from "./api/features.js";
import {
	ViewControllerRender,
	ViewControllerReset,
	ViewControllerShowNoPokemons,
} from "./controllers/view-controller.js";
import { BannerControllerInit, BannerEmitter } from "./controllers/banner-controller.js";
import { FavoritesInit, FavoritesEmitter } from "./services/favorites-service.js";
import { SidebarControllerInit } from "./controllers/sidebar-controller.js";
import { DBInit } from "./api/database.js";
import { Logger } from "./libs/logger.js";
import { $ } from "./utils/dom-utils.js";

FeaturesBulkEnable(
	"enable-banner",
	"enable-search",
	"enable-sidebar",
	"enable-search-filters",
	"enable-favorites",
	"enable-view",
	"enable-emitter-logs",
);

const IndexLogger = new Logger("index.js");

(async () => {
	await DBInit();
	await FavoritesInit();
	ViewControllerShowNoPokemons();
	SidebarControllerInit();

	FeaturesUse("enable-banner", () =>
		BannerControllerInit({
			Name: "main #banner #banner__pokemon #information #left #name",
			Sprite: "main #banner #banner__pokemon #sprite",
			Types: "main #banner #banner__pokemon #information #right #types",
			Heart: "main #banner #banner__pokemon #information #right #heart",
			Timer: "main #banner #banner__pokemon #information #left #timer",
			Stats: "main #banner #banner__stats #list",
		}),
	);

	FeaturesUse("enable-search", () =>
		SearchControllerInit("main #search #bar #input", {
			Render: async (queries) => ViewControllerRender(queries, { ChunkSize: 5 }),
			Validate: (input) => SearchControllerValidate(input),
			Query: (input) => SearchControllerQuery(input),
			Reset: () => ViewControllerShowNoPokemons(),
			Delay: 500,
		}),
	);

	FeaturesUse("enable-search-filters", () =>
		SearchControllerInitFilters({
			Selector: "main #search #filters .filters__group",
			Callback: (option) => {
				IndexLogger.warn(`Option selected! (Value: ${option.value}, Type: ${option.type})`);
			},
		}),
	);

	FeaturesUse("enable-emitter-logs", () => {
		BannerEmitter.on("pokemon:ready", (pokemon) => {
			IndexLogger.info(`Pokemon "${pokemon.name}" is ready to be shown!`);
		});

		BannerEmitter.on("pokemon:missing", () => {
			IndexLogger.warn(`Pokemon was not found - can't be shown!`);
		});

		SearchEmitter.on("render:start", () => {
			IndexLogger.info(`Currently rendering...`);
		});

		SearchEmitter.on("render:finish", () => {
			IndexLogger.success(`Rendering completed!`);
		});

		FavoritesEmitter.on("favorites:updated", (favorites) => {
			IndexLogger.warn(`Favorites updated! (${favorites.length} Favorites available)`);
		});
	});
})();
