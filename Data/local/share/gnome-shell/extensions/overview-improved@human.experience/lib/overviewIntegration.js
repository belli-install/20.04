/* ------------------------------------------------------------------------- */
// eslint configuration for this file
//

/* global imports */

/* exported OverviewIntegration */


/* ------------------------------------------------------------------------- */
// enforce strict mode
"use strict";


/* ------------------------------------------------------------------------- */
// gnome shell imports
const gsExtensionUtils = imports.misc.extensionUtils;
const gsMain = imports.ui.main;
const gsOverview = imports.ui.overview;


/* ------------------------------------------------------------------------- */
// extension imports
const Extension = gsExtensionUtils.getCurrentExtension();
const BaseIntegration = Extension.imports.lib.baseIntegration;
const Utils = Extension.imports.lib.utils;
const WindowSearch = Extension.imports.lib.windowSearch;


/* ------------------------------------------------------------------------- */
var OverviewIntegration = class OverviewIntegration
  extends BaseIntegration.BaseIntegration {

  /* ....................................................................... */
  constructor(injectionsRegistry, boundSettings) {

    // call parent constructor
    super();

    // logger
    this._logger = new Utils.Logger(
      "OverviewIntegration.js::OverviewIntegration"
    );

    // bound settings
    this._boundSettings = boundSettings;

    // injection registry
    this._injectionsRegistry = injectionsRegistry;

    // injection registry name for this class
    this._injectionRegistryName = "overviewIntegration";

    this._windowSearch = null;

  }

  /* ....................................................................... */
  matches() {
    // always return false since this is not an extension
    return false;
  }

  /* ....................................................................... */
  enable() {

    // create window search instance
    this._windowSearch = new WindowSearch.WindowSearch();
    // create references to it in Main.overview._overviewImproved
    gsMain.overview._overviewImproved.windowSearch = this._windowSearch;
    // add to overview itself
    this._windowSearch.addToOverview();

    // inject hide
    this._injectionsRegistry.addWithLabel(
      this._injectionRegistryName,
      [
        gsOverview.Overview.prototype,
        "hide",
        this._hideInjection(
          gsOverview.Overview.prototype.hide
        )
      ]
    );
  }

  /* ....................................................................... */
  disable() {
    // remove injections
    this._injectionsRegistry.removeWithLabel(this._injectionRegistryName);

    // remove window search box from over view
    this._windowSearch.destroy();
  }

  /* ....................................................................... */
  _hideInjection(hideOriginal) {
    return function hide() {
      let windowSearch = gsMain.overview._overviewImproved.windowSearch;

      // reset current window class string
      if (windowSearch.wmClass !== null) {
        windowSearch.wmClass = null;
      }

      // reset current window search terms
      if (windowSearch.titleSearchTerms !== "") {
        windowSearch.resetTitleSearch();
      }

      // run original function
      return hideOriginal.apply(this);
    };
  }

};
