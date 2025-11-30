/*
    ~ memoize.js
    Blazingly fast memoize implementation with LRU (last-recently-used) Cache + TTL (time-to-last)
    @author jhotiori
*/

import { LRUCache } from "lru-cache";
import stringify from "fast-json-stable-stringify";

/**
 * Transforms `target` into a memoized function. Memoized functions store the last result of a call basing on the
 * parameters provided. If the same parameters are provided again, the result is returned from the cache.
 * @param {Function} target - Function to memoize
 * @param {Object} options - Options for memoize
 * @returns {Function} The Memoized function
 */
export const Memoize = (target, { limit = 1000, expiry = 60 * 60 * 1000 } = {}) => {
	if (typeof target !== "function") return;

	const cache = new LRUCache({
		max: limit,
		ttl: expiry,
		updateAgeOnGet: false,
		updateAgeOnHas: false,
	});

	const __HashArgs = (...args) => {
		if (args.length === 1) {
			const argument = args[0];
			const type = typeof x;
			if (argument == null || type === "string" || type === "number" || type === "boolean") return argument;
		}

		try {
			return stringify(args);
		} catch {
			return args.map(String).join("|");
		}
	};

	return (...args) => {
		const key = __HashArgs(...args);
		const cached = cache.get(key);
		if (cached !== undefined) return cached;

		let value = null;

		try {
			value = target(...args);
		} catch (res) {
			cache.delete(key);
			throw res;
		}

		const isPromise = value instanceof Promise;

		if (isPromise) {
			const inflight = value.then(
				(res) => (cache.set(key, res), res),
				(err) => (cache.delete(key), Promise.reject(err)),
			);

			cache.set(key, inflight);
			return inflight;
		}

		cache.set(key, value);
		return value;
	};
};
