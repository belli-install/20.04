/* ------------------------------------------------------------------------- */
// eslint configuration for this file
//
/* global imports */

/* exported WorkspaceIntegration */


/* ------------------------------------------------------------------------- */
// enforce strict mode
"use strict";


/* ------------------------------------------------------------------------- */
// gnome shell imports
const gsExtensionUtils = imports.misc.extensionUtils;
const gsMain = imports.ui.main;
const gsWorkspace = imports.ui.workspace;


/* ------------------------------------------------------------------------- */
// extension imports
const Extension = gsExtensionUtils.getCurrentExtension();
const BaseIntegration = Extension.imports.lib.baseIntegration;
const Compat = Extension.imports.lib.compat;
const Utils = Extension.imports.lib.utils;


/* ------------------------------------------------------------------------- */
var WorkspaceIntegration = class WorkspaceIntegration
  extends BaseIntegration.BaseIntegration {

  /* ....................................................................... */
  constructor(injectionsRegistry) {
    super();

    // logger
    this._logger = new Utils.Logger(
      "workspaceIntegration.js::WorkspaceIntegration"
    );

    // injection registry
    this._injectionsRegistry = injectionsRegistry;

    // injection registry name for this class
    this._injectionRegistryName = "workspaceIntegration";

  }

  /* ....................................................................... */
  matches() {
    // always return false since this is not an extension
    return false;
  }

  /* ....................................................................... */
  enable() {
    // inject _isOverviewWindow
    this._injectionsRegistry.addWithLabel(
      this._injectionRegistryName,
      [
        gsWorkspace.Workspace.prototype,
        "_isOverviewWindow",
        this._isOverviewWindowInjection(
          gsWorkspace.Workspace.prototype._isOverviewWindow
        )
      ]
    );
  }

  /* ....................................................................... */
  disable() {
    // remove injections
    this._injectionsRegistry.removeWithLabel(this._injectionRegistryName);
  }

  /* ....................................................................... */
  _isOverviewWindowInjection(isOverviewWindowOriginal) {
    return function _isOvervieWindow(current_window) {
      let matchesWmClass;
      let matchesTitleSearch;

      let windowSearch = gsMain.overview._overviewImproved.windowSearch;

      // use original function to check windows should be show
      let shouldShowWindow = isOverviewWindowOriginal(current_window);

      // see if current window wm class is set then compare it to the window
      // we are checking if we want to show, otherwise overview with all
      // windows will be shown
      if (windowSearch.wmClass === null) {
        // match them all
        matchesWmClass = true;
      }
      else {
        matchesWmClass =
          (Compat.getWmClass(current_window) === windowSearch.wmClass);
      }

      // check if there is a match to window title
      if (windowSearch.titleSearchTerms === "") {
        // match all titles
        matchesTitleSearch = true;
      }
      else {
        matchesTitleSearch =
          current_window
            .get_meta_window()
            .get_title()
            .toLowerCase()
            .includes(windowSearch.titleSearchTerms.toLowerCase());
      }


      return shouldShowWindow && matchesWmClass && matchesTitleSearch;

    };

  }

};
