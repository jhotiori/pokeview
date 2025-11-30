/*
    ~ element.js
    Small view library with simple functions
    @author jhotiori
*/

import { ErrorUnwrap, ErrorExpect } from "../utils/error-utils";

/**
 * Creates an HTML Element.
 * @param {string} tag - The tag name
 * @param {Object} props - Properties of the element
 * @param {HTMLElement[]} children - Children of the element
 * @returns {HTMLElement} The created element
 */
export const CreateElement = (tag, props = {}, children = []) => {
	ErrorExpect(typeof tag === "string", "Expected tag to be a string!");
	ErrorExpect(typeof props === "object", "Expected props to be an object!");

	const element = document.createElement(tag);

	for (const property in props) {
		const value = props[property];

		if (property.startsWith("on") && typeof value === "function") {
			element.addEventListener(property.slice(2).toLowerCase(), value);
			continue;
		}

		if (property === "class") {
			element.className = value;
			continue;
		}

		if (property === "classList" && Array.isArray(value)) {
			for (const className of value) {
				element.classList.add(className);
			}
			continue;
		}

		if (property === "style" && typeof value === "object") {
			for (const styleKey in value) {
				element.style[styleKey] = value[styleKey];
			}
			continue;
		}

		if (property === "dataset" && typeof value === "object") {
			for (const key in value) {
				element.dataset[key] = value[key];
			}
			continue;
		}

		if (typeof value === "boolean") {
			if (value) element.setAttribute(property, "");
			continue;
		}

		element[property] = value;
	}

	const append = (child) => {
		if (child === null) return;

		if (typeof child === "string" || typeof child === "number") {
			element.appendChild(document.createTextNode(child));
			return;
		}

		if (Array.isArray(child)) {
			child.forEach(append);
			return;
		}

		element.appendChild(child);
	};

	append(children);
	return element;
};
