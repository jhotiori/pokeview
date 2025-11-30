/*
    ~ features.js
    Dead simple module to enable/toggle features
    @author jhotiori
*/

import { ErrorExpect } from "../utils/error-utils";

const RUNTIME_FEATURES = {
	"enable-search": false,
	"enable-search-filters": false,
	"enable-banner": false,
	"enable-view": false,
	"enable-favorites": false,
	"enable-emitter-logs": false,
};

/**
 * Sets a feature value.
 * @param {string} feature - The feature to set
 * @param {boolean} value - The value
 */
export const FeaturesSet = (feature, value) => {
	ErrorExpect(typeof feature === "string", "Expected feature to be a string!");
	ErrorExpect(typeof value === "boolean", "Expected value to be a boolean!");
	RUNTIME_FEATURES[feature] = value;
};

/**
 * Enables a feature.
 * @param {string} feature - The feature to enable
 */
export const FeaturesEnable = (feature) => FeaturesSet(feature, true);

/**
 * Disables a feature.
 * @param {string} feature - The feature to disable
 */
export const FeaturesDisable = (feature) => FeaturesSet(feature, false);

/**
 * Toggles a feature.
 * @param {string} feature - The feature to toggle
 */
export const FeaturesToggle = (feature) => {
	ErrorExpect(FeaturesGet(feature) !== undefined, `Feature "${feature}" does not exist!`);
	FeaturesSet(feature, !RUNTIME_FEATURES[feature]);
};

/**
 * Gets a feature value.
 * @param {string} feature - The feature to get
 * @returns {boolean} The value
 */
export const FeaturesGet = (feature) => RUNTIME_FEATURES[feature];

/**
 * Runs `onActive()` if the feature is enabled.
 * @param {string} feature - The feature to check
 * @param {Function} onActive - The function to run
 */
export const FeaturesUse = (feature, onActive) => (FeaturesGet(feature) ? onActive() : null);

/**
 * Bulk enables the provided features.
 * @param {string[]} features - An array of features
 */
export const FeaturesBulkEnable = (...features) => {
	const array = [...features];

	for (const feature of array) {
		FeaturesSet(feature, true);
	}
};

/**
 * Bulk disables the provided features.
 * @param {string[]} features - An array of features
 */
export const FeaturesBulkDisable = (...features) => {
	const array = [...features];

	for (const feature of array) {
		FeaturesSet(feature, false);
	}
};

/**
 * Bulk toggles the provided features.
 * @param {string[]} features - An array of features
 */
export const FeaturesBulkToggle = (...features) => {
	const array = [...features];

	for (const feature of array) {
		FeaturesSet(feature, !FeaturesGet(feature));
	}
};
