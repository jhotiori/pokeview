/*
	pokeapi-js-wrapper-sw.js
	Reworked + Hyper-Optimized Pokémon Sprites Service Worker
	@author: jhotiori
*/

const VERSION = "v2";
const PREFIX = "pokeapi-sprites";
const CACHE_NAME = `${PREFIX}-${VERSION}`;
const SPRITE_PATTERN = /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/.*\.(?:png|svg|gif)$/i;

self.addEventListener("install", (event) => {
	event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
	event.waitUntil(ActivateServiceWorker());
});

self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = request.url;

	if (!SPRITE_PATTERN.test(url)) return;

	event.respondWith(HandleSpriteRequest(request));
});

/**
 * Handles activation logic, clears outdated caches
 * and ensures the current SW version takes immediate control.
 */
async function ActivateServiceWorker() {
	const keys = await caches.keys();

	await Promise.all(
		keys.filter((key) => key.startsWith(PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)),
	);

	await self.clients.claim();
	console.info(`[SW] Activated: ${CACHE_NAME}`);
}

/**
 * Handles any intercepted Pokémon sprite request.
 * Uses a cache-first strategy with background revalidation.
 * @param {Request} request - The incoming fetch request.
 * @returns {Promise<Response>} Cached or freshly fetched sprite.
 */
async function HandleSpriteRequest(request) {
	const cache = await caches.open(CACHE_NAME);
	const cached = await cache.match(request);

	if (cached) {
		RevalidateSprite(cache, request);
		return cached;
	}

	const fresh = await FetchAndStore(cache, request);
	return fresh ?? new Response(null, { status: 504 });
}

/**
 * Fetches sprite directly from the network and stores it in cache.
 * @param {Cache} cache - The current cache instance.
 * @param {Request} request - The network request.
 * @returns {Promise<Response|null>} The fresh response or null if failed.
 */
async function FetchAndStore(cache, request) {
	try {
		const res = await fetch(request, { cache: "no-cache" });
		if (!res.ok && res.type !== "opaque") throw new Error(`HTTP ${res.status}`);

		await SafeCachePut(cache, request, res.clone());
		return res;
	} catch (err) {
		console.warn(`[SW] FetchAndStore: ${err.message}`);
		return null;
	}
}

/**
 * Revalidates an existing cached sprite in the background.
 * Updates cache only if the network fetch succeeds.
 * @param {Cache} cache - The current cache instance.
 * @param {Request} request - The sprite request.
 */
async function RevalidateSprite(cache, request) {
	try {
		const res = await fetch(request, { cache: "no-cache" });
		if (res.ok || res.type === "opaque") {
			await SafeCachePut(cache, request, res.clone());
			console.debug(`[SW] Cache updated: ${request.url}`);
		}
	} catch {}
}

/**
 * Safely inserts a response into cache, with isolated error handling.
 * @param {Cache} cache - The target cache instance.
 * @param {Request} request - The request to store.
 * @param {Response} response - The response to cache.
 */
async function SafeCachePut(cache, request, response) {
	try {
		await cache.put(request, response);
	} catch (err) {
		console.error(`[SW] CachePut: ${err.message}`);
	}
}
