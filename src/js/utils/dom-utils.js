/*
    ~ dom-utils.js
    Utility functions related to DOM
    @author jhotiori
*/

import { Memoize } from "../libs/memoize.js";

/**
 * Selects an element in the DOM using a CSS selector.
 * @param {string} selector - The selector
 * @param {HTMLElement} parent - DOM Element to use as context
 * @returns {HTMLElement?} The element that matches `selector`
 */
export const $ = (selector = "*", parent = document) => parent.querySelector(selector);

/**
 * Selects all elements in the DOM using a CSS selector.
 * @param {string} selector - The selector
 * @param {HTMLElement} parent - DOM Element to use as context
 * @returns {NodeListOf<HTMLElement>} The elements that match `selector`
 */
export const $$ = (selector = "*", parent = document) => Array.from(parent.querySelectorAll(selector));
