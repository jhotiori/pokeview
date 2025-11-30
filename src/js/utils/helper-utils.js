/*
    ~ helper-utils.js
    Utility functions to help with general tasks
    @author jhotiori
*/

/**
 * Yields for a given amount of time in milliseconds.
 * @param {number} ms - Time to sleep, in milliseconds.
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
