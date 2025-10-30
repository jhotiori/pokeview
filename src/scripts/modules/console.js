/*
	console.js
	Console Implementation for the PokeView Application
    @author jhotiori
*/

import dayjs from "dayjs";
import invariant from "tiny-invariant";

const DEFAULT_CONTEXT = "UnknownContext";
const DEFAULT_MESSAGE = "<no message>";

export class Console {
	constructor(context = DEFAULT_CONTEXT, styles) {
		invariant(context, "Expected a console context (e.g. 'index.js'), got nothing!");

		this.context = context;
		this.styles = styles !== undefined ? { ...styles, default: "color: inherit;" } : { default: "color: inherit;" };
	}

	AddStyle(name, css) {
		invariant(name, "Expected name to be a string!");
		invariant(css, "Expected css to be a string!");
		this.styles[name] = css;
	}

	DeleteStyle(name) {
		invariant(name, "Expected name to be a string!");
		this.styles[name] = undefined;
	}

	GetStyle(name) {
		invariant(name, "Expected name to be a string!");
		return this.styles[name];
	}

	__format(message) {
		const time = `[${dayjs().format("HH:mm:ss")}]`;
		const context = `(${this.context})`;
		return `%c${time} ${context} ${message}`;
	}

	Info(message = DEFAULT_MESSAGE) {
		const stylizer = this.GetStyle("info") || this.GetStyle("default");
		console.log(this.__format(message), stylizer);
	}

	Warn(message = DEFAULT_MESSAGE) {
		const stylizer = this.GetStyle("warn") || this.GetStyle("default");
		console.warn(this.__format(message), stylizer);
	}

	Success(message = DEFAULT_MESSAGE) {
		const stylizer = this.GetStyle("success") || this.GetStyle("default");
		console.log(this.__format(message), stylizer);
	}

	Error(message = DEFAULT_MESSAGE) {
		const stylizer = this.GetStyle("error") || this.GetStyle("default");
		console.error(this.__format(message), stylizer);
	}
}

export const PokeConsole = new Console("PokeView");
PokeConsole.AddStyle("Info", "color:blue;");
PokeConsole.AddStyle("Warn", "color:yellow;");
PokeConsole.AddStyle("Success", "color:green;");
PokeConsole.AddStyle("Error", "color:salmon;");
