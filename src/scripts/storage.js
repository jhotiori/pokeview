/*
    LocalStorage Wrapper for the PokeView Application
    @author jhotiori
*/

import dayjs from "dayjs";
import invariant from "tiny-invariant";

const [Stringify, Parse] = [JSON.stringify, JSON.parse];
const [SetItem, GetItem, RemoveItem] = [
	localStorage.setItem.bind(localStorage),
	localStorage.getItem.bind(localStorage),
	localStorage.removeItem.bind(localStorage),
];

const DEFAULT_TTL = 24; // in hours

export const SetStorage = (key, value) => {
	invariant(key, "Expected a valid key for storage!");
	invariant(value !== undefined, "Cannot store 'undefined' value!");

	const entry = {
		value,
		expiry: dayjs().add(DEFAULT_TTL, "hour").valueOf(),
	};

	SetItem(key, Stringify(entry));
};

export const GetStorage = (key) => {
	invariant(key, "Expected a Key to retrieve!");

	const stored = GetItem(key);
	if (!stored) return;

	try {
		const { value, expiry } = Parse(stored);
		const now = dayjs().valueOf();

		if (now >= expiry) {
			RemoveItem(key);
			return;
		}

		return value;
	} catch {
		RemoveItem(key); // unexpected format or parse fail
	}
};
