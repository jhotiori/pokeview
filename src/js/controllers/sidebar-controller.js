/*
    ~ sidebar-controller
    Controller for the PokeView Sidebar
    @author jhotiori
*/

import { Emitter } from "../libs/emitter.js";
import { Logger } from "../libs/logger.js";
import { $, $$ } from "../utils/dom-utils.js";

export const SidebarControllerLogger = new Logger("controllers/sidebar-controller.js");
export const SidebarControllerEmitter = new Emitter();

const DOMGetSidebar = () => $(".sidebar");

/**
 * Initializes the sidebar controller.
 * This creates a new sidebar container in the DOM.
 */
export const SidebarControllerInit = () => {
    const sidebar = DOMGetSidebar();
    if (sidebar) return;

    const container = CreateElement("div", { class: "sidebar" });
    $("body").appendChild(container);
}

/**
 * Shows the sidebar containing information about the provided pokemon.
 * Contains name, stats, evolution, etc.
 */
export const SidebarControllerShow = (pokemon) => {

}
