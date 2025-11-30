/*
    ~ timer-service.js
    A service that allows the creation of timers
    @author jhotiori
*/

import { ErrorExpect } from "../utils/error-utils.js";
import { StateCreate } from "../libs/state.js";

/**
 * Creates a new Timer Object.
 * @param {Object} defs - The definitions
 * @param {Function} defs.Tick - The callback to run on each tick
 * @param {Function} defs.Completed - The callback to run once completed
 * @param {number} defs.Interval - The interval in seconds
 * @returns {Object} A Timer Object
 */
export const TimerCreate = (defs) => {
	ErrorExpect(defs, "Expected a valid defs object!");
	ErrorExpect(typeof defs.Tick === "function", "Expected a valid Tick function!");
	ErrorExpect(typeof defs.Completed === "function", "Expected a valid Completed function!");
	ErrorExpect(typeof defs.Interval === "number", "Expected a valid Interval!");

	const { Completed, Tick, Interval } = defs;
	const [TimerInterval, SetTimerInterval] = StateCreate(null);
	const [Remaining, SetRemaining] = StateCreate(Interval);
	Tick(Remaining.get());

	const Clear = () => {
		const timer = TimerInterval.get();
		if (!timer) return;

		clearInterval(timer);
		SetTimerInterval(null);
	};

	SetTimerInterval(
		setInterval(() => {
			const previous = Remaining.get();
			SetRemaining(previous - 1);

			const current = Remaining.get();
			Tick(current);

			if (current <= 0) {
				Clear();
				Completed();
			}
		}, 1000),
	);

	return { Clear };
};
