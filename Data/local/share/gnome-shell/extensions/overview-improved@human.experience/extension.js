/* ------------------------------------------------------------------------- */
// eslint configuration for this file
//
/* global imports */
/* global window */

/* exported init */
/* exported disable */
/* exported enable */


/* ------------------------------------------------------------------------- */
// enforce strict mode
"use strict";


/* ------------------------------------------------------------------------- */
// enable global used for debugging
window.overviewImproved = {
  debug: false,
};


/* ------------------------------------------------------------------------- */
// gnome shell imports
const ExtensionUtils = imports.misc.extensionUtils;


/* ------------------------------------------------------------------------- */
// extension imports
const Extension = ExtensionUtils.getCurrentExtension();
const OverviewImproved = Extension.imports.lib.overviewImproved;


/* ------------------------------------------------------------------------- */
/* globals */
let overviewImprovedInstance;


/* ------------------------------------------------------------------------- */
function init() {
  overviewImprovedInstance = null;
}


/* ------------------------------------------------------------------------- */
function enable() {
  overviewImprovedInstance = new OverviewImproved.OverviewImproved();
  overviewImprovedInstance.enable();
}


/* ------------------------------------------------------------------------- */
function disable() {
  overviewImprovedInstance.disable();
  overviewImprovedInstance = null;
}
