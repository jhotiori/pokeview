/*
	memoize.js
	Memoize Implementation for the PokeView Application
    @author jhotiori
*/

import { LRUCache } from "lru-cache";

const [Stringify] = [JSON.stringify];

export class Memoize {
	/**
	 * Creates an instance of Memoize.
	 * @param {} - Options
	 * @returns {Memoize}
	 */
	constructor({ limit = 100, ttl = 0, updates = true } = {}) {
		this.cache = new LRUCache({
			max: limit,
			ttl: ttl,
			updateAgeOnGet: updates,
		});
	}

	/**
	 * Hashes the arguments into a key for the memoization cache.
	 * @param {*} args - Arguments to be hased
	 * @returns {string} - Hashed string arguments
	 */
	__HashArguments(args) {
		try {
			return Stringify(args, (_, value) => {
				return typeof value === "function" ? value.toString() : v;
			});
		} catch {
			return String(args);
		}
	}

	/**
	 * Wraps any function (sync or async) with memoization.
	 * @param {Function} fn - Function to memoize
	 * @param {number} [ttlOverride] - Optional TTL (ms)
	 * @returns {Function} - Memoized version of the function
	 */
	Memoize(fn, ttlOverride) {
		return (...args) => {
			const key = this.__HashArguments(args);
			const cached = this.cache.get(key);
			if (cached !== undefined) return cached;

			const result = fn(...args);
			const isPromise = result instanceof Promise;

			if (isPromise) {
				// Cache the promise result
				const promise = result.then((res) => {
					this.cache.set(key, res, { ttl: ttlOverride });
					return res;
				});
				this.cache.set(key, promise, { ttl: ttlOverride });
				return promise;
			} else {
				this.cache.set(key, result, { ttl: ttlOverride });
				return result;
			}
		};
	}

	Clear() {
		this.cache.clear();
	}
}
