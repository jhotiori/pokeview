/*
    Console Implementation for the PokeView Application
    @author jhotiori
*/

import dayjs from "dayjs";
import invariant from "tiny-invariant";

export class Console {
	constructor(context = "<unknown>", styles) {
		invariant(context, "Expected a console context (e.g. 'index.js'), got nothing!");

		this.context = context;
		this.styles = styles !== undefined ? {...styles, "default": "color: inherit;"} : {"default": "color: inherit;"};
	}

	addStyle(name, css) {
		invariant(name, "Expected name to be a string!")
		invariant(css, "Expected css to be a string!")
		this.styles[name] = css
	}

	deleteStyle(name) {
		invariant(name, "Expected name to be a string!")
		this.styles[name] = undefined
	}

	getStyle(name) {
		invariant(name, "Expected name to be a string!")
		return this.styles[name]
	}

	_format(message) {
		const time = `[${dayjs().format("HH:mm:ss")}]`;
		const context = `(${this.context})`;
		return `%c${time} ${context} ${message}`;
	}

	log(message = "<no message>", style) {
		const stylizer = this.getStyle(style || "default");
		console.log(this._format(message), stylizer)
	}

	info(message = "<no message>") {
		const stylizer = this.getStyle("info") || this.getStyle("default");
		console.log(this._format(message), stylizer)
	}

	warn(message = "<no message>") {
		const stylizer = this.getStyle("warn") || this.getStyle("default");
		console.warn(this._format(message), stylizer)
	}

	error(message = "<no message>") {
		const stylizer = this.getStyle("error") || this.getStyle("default");
		console.error(this._format(message), stylizer)
	}
}

export const PokeConsole = new Console("PokeView");
