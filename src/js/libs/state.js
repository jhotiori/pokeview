/*
    state.js
    Easily manage values in a reactive way: modify & observe.
    @author jhotiori
*/

import { ErrorExpect } from "../utils/error-utils.js";

/**
 * Transforms `initialValue` into a state, which can be mutated, observated anytime.
 * @param {any} initialValue - The initial value
 * @returns State object and set function
 */
export const StateCreate = (initialValue) => {
	const subscribers = new Set();
	let current = initialValue;

	const emit = () => {
		const toEmit = [...subscribers];

		for (const callback of toEmit) {
			try {
				callback(current);
			} catch (error) {
				console.error(`[emit] Subscriber Error: ${error}`);
			}
		}
	};

	const set = (next) => {
		const value = next;
		if (value === current) return;

		current = value;
		emit();
	};

	const state = {
		get: () => current,
		clear: () => subscribers.clear(),
		subscribe: (callback) => {
			ErrorExpect(typeof callback === "function", "Expected callback to be a function!");
			subscribers.add(callback);
			return () => subscribers.delete(callback);
		},
	};

	return [state, set];
};
