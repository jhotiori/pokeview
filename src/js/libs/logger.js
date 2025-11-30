/*
    ~ logger.js
    Basic Logger implementation for PokeView
    @author jhotiori
*/

import { ErrorExpect } from "../utils/error-utils.js";

const DEFAULT_MESSAGE = "<no message>";
const DEFAULT_CONTEXT = "UnknownContext";
const DEFAULT_STYLE_NAME = "default";
const DEFAULT_STYLES = {
	[DEFAULT_STYLE_NAME]:
		"background-color:#111;color:#DADADA;border-radius:0.25rem;padding:0.1rem 0.25rem;font-weight:800;",
	info: "background-color:#A0D8F1;color:#111;border-radius:0.25rem;padding:0.1rem 0.25rem;font-weight:800;",
	warn: "background-color:#FFFACD;color:#111;border-radius:0.25rem;padding:0.1rem 0.25rem;font-weight:800;",
	error: "background-color:#FFB3B3;color:#111;border-radius:0.25rem;padding:0.1rem 0.25rem;font-weight:800;",
	success: "background-color:#B3FFB3;color:#111;border-radius:0.25rem;padding:0.1rem 0.25rem;font-weight:800;",
};

/**
 * A basic logger for PokeView.
 * This logger is used to log messages to the console with styles.
 */
export class Logger {
	/**
	 * Constructs a new Logger
	 * @param {string} context The context of the logger
	 * @param {object} styles The styles of the logger
	 * @returns {Logger} The new logger
	 */
	constructor(context, styles) {
		this.context = context || DEFAULT_CONTEXT;
		this.styles = typeof styles === "object" ? { ...DEFAULT_STYLES, ...styles } : DEFAULT_STYLES;
	}

	/**
	 * Adds a style to the logger.
	 * @param {string} name The name of the style
	 * @param {string} style The style
	 */
	AddStyle = (name, style) => {
		ErrorExpect(typeof name === "string", "Expected a valid name!");
		ErrorExpect(typeof style === "string", "Expected a valid style!");
		this.styles[name] = style;
	};

	/**
	 * Deletes a style from the logger.
	 * @param {string} name The name of the style
	 */
	DeleteStyle = (name) => (this.styles[name] = null);

	/**
	 * Gets a style from the logger.
	 * @param {string} name The name of the style
	 * @returns {string?} The style
	 */
	GetStyle = (name) => this.styles[name] ?? this.styles["default"];

	/**
	 * INTERNAL: Formats a context to be displayed.
	 * @returns {string} The formatted context
	 */
	__FormatContext = () => `(@${this.context})`;

	/**
	 * INTERNAL: Formats a date to be displayed.
	 * @returns {string} The formatted date
	 */
	__FormatDate = () => {
		const now = new Date();
		const fmt = (number) => number.toString().padStart(2, "0");
		const hour = fmt(now.getHours());
		const minute = fmt(now.getMinutes());
		const second = fmt(now.getSeconds());
		return `[${hour}:${minute}:${second}]`;
	};

	/**
	 * INTERNAL: Formats prefixes to be displayed.
	 * @returns {string} The formatted prefixes
	 */
	__FormatPrefixes = () => `${this.__FormatDate()} ${this.__FormatContext()}`;

	/**
	 * INTERNAL: Formats a message to be displayed.
	 * @param {string} message The message
	 * @param {string} style The style
	 * @returns {string[]} The formatted message & style
	 */
	__FormatMessage = (message, styleName = DEFAULT_STYLE_NAME) => {
		ErrorExpect(typeof message === "string", "Expected a valid message!");
		ErrorExpect(typeof styleName === "string", "Expected a valid style!");
		const style = this.GetStyle(styleName);
		return [`%c${this.__FormatPrefixes()} | ${message}`, style];
	};

	/**
	 * Logs a message with the style of info.
	 * @param {string} message The message
	 * @param {any[]} ...args The arguments
	 */
	info = (message = DEFAULT_MESSAGE, ...args) => {
		const [formatted, style] = this.__FormatMessage(message, "info");
		console.log(formatted, style, ...args);
	};

	/**
	 * Logs a message with the style of warn.
	 * @param {string} message The message
	 * @param {any[]} ...args The arguments
	 */
	warn = (message = DEFAULT_MESSAGE, ...args) => {
		const [formatted, style] = this.__FormatMessage(message, "warn");
		console.warn(formatted, style, ...args);
	};

	/**
	 * Logs a message with the style of error.
	 * @param {string} message The message
	 * @param {any[]} ...args The arguments
	 */
	error = (message = DEFAULT_MESSAGE, ...args) => {
		const [formatted, style] = this.__FormatMessage(message, "error");
		console.error(formatted, style, ...args);
	};

	/**
	 * Logs a message with the style of success.
	 * @param {string} message The message
	 * @param {any[]} ...args The arguments
	 */
	success = (message = DEFAULT_MESSAGE, ...args) => {
		const [formatted, style] = this.__FormatMessage(message, "success");
		console.log(formatted, style, ...args);
	};
}
