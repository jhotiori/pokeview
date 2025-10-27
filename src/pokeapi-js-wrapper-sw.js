const imgRe = /https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/[\/-\w\d]+\/[\d\w-]+\.(?:png|svg|gif)/
const version = 1
const cacheName = `pokeapi-js-wrapper-images-${version}`

// Install SW immediately
self.addEventListener('install', (event) => {
    self.skipWaiting()
})

// Fetch handler
self.addEventListener('fetch', (event) => {
    const url = event.request.url
    if (!imgRe.test(url)) return

    event.respondWith((async () => {
        try {
            const cachedResponse = await caches.match(event.request)
            if (cachedResponse) return cachedResponse

            const networkResponse = await fetch(event.request)
            // Cache the image asynchronously (don’t block response)
            const cache = await caches.open(cacheName)
            cache.add(event.request) // ignore opaque failures
            return networkResponse
        } catch (err) {
            console.error("SW fetch error:", err)
        }
    })())
})
