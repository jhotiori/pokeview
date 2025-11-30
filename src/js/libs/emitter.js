/*
    ~ emitter.js
    Lightweight Optimized Event Emitter Implementation
    @author jhotiori
*/

import { ErrorExpect, ErrorUnwrap } from "../utils/error-utils.js";
import { Logger } from "../libs/logger.js";

export const EmitterLogger = new Logger("libs/emitter.js");
export class Emitter {
	/**
	 * Constructs a new `Emitter` Object.
	 * @returns {Emitter} The new emitter
	 */
	constructor() {
		this.events = new Map();
	}

	/**
	 * Attaches a callback to an event.
	 * @param {string} eventName - The event name
	 * @param {Function} callback - The callback to attach
	 * @returns {Function} A function that detaches the callback
	 */
	on(eventName, callback) {
		ErrorExpect(typeof eventName === "string", "Expected a valid event name!");
		ErrorExpect(typeof callback === "function", "Expected callback to be a function!");

		let listeners = this.events.get(eventName);
		if (!listeners) {
			listeners = new Set();
			this.events.set(eventName, listeners);
		}

		listeners.add(callback);
		return () => listeners.delete(callback);
	}

	/**
	 * Attaches a callback that runs only once.
	 * @param {string} eventName - The event name
	 * @param {Function} callback - The callback to run once
	 * @returns {Function} A function that detaches the callback
	 */
	once(eventName, callback) {
		ErrorExpect(typeof eventName === "string", "Expected a valid event name!");
		ErrorExpect(typeof callback === "function", "Expected callback to be a function!");

		const wrapper = (...args) => (off(), callback(...args));
		const off = this.on(eventName, wrapper);

		return off;
	}

	/**
	 * Emits an event.
	 * @param {string} eventName - The event name
	 * @param {...any} args - The arguments to pass to the callbacks
	 * @returns {void}
	 */
	emit(eventName, ...args) {
		ErrorExpect(typeof eventName === "string", "Expected a valid event name!");

		const listeners = this.events.get(eventName);
		if (!listeners || listeners.size === 0) return;

		for (const callback of listeners) {
			try {
				callback(...args);
			} catch (error) {
				EmitterLogger.error(`Emitter Error: ${ErrorUnwrap(error)}`);
			}
		}
	}

	/**
	 * Detaches all callbacks from an event.
	 * If `eventName` is not provided, cleans all callbacks.
	 * @param {string} eventName - The event name
	 * @returns {void}
	 */
	clear(eventName) {
		if (typeof eventName === "string") {
			this.events.delete(eventName);
		} else {
			this.events.clear();
		}
	}
}
