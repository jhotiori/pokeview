const imgRe = /https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/[\/-\w\d]+\/[\d\w-]+\.(?:png|svg|gif)/;
const version = 1;
const cacheName = `pokeapi-js-wrapper-images-${version}`;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("fetch", (event) => {
	const url = event.request.url;
	if (!imgRe.test(url)) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(cacheName);
			const cached = await cache.match(event.request);
			if (cached) return cached;

			try {
				const networkResponse = await fetch(event.request, { mode: "no-cors" });
				// Only cache if it's valid OR opaque
				if (networkResponse && (networkResponse.ok || networkResponse.type === "opaque")) {
					try {
						await cache.put(event.request, networkResponse.clone());
					} catch (cacheErr) {
						console.warn("SW cache put failed:", cacheErr);
					}
				}
				return networkResponse;
			} catch (err) {
				console.error("SW fetch error:", err);
				return new Response(null, { status: 504 });
			}
		})(),
	);
});
