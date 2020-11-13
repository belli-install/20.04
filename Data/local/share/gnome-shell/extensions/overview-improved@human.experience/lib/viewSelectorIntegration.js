/* ------------------------------------------------------------------------- */
// eslint configuration for this file
//

/* global imports */

/* exported ViewSelectorIntegration */


/* ------------------------------------------------------------------------- */
// enforce strict mode
"use strict";


/* ------------------------------------------------------------------------- */
// library imports
const Clutter = imports.gi.Clutter;


/* ------------------------------------------------------------------------- */
// gnome shell imports
const gsExtensionUtils = imports.misc.extensionUtils;
const gsMain = imports.ui.main;
const gsViewSelector = imports.ui.viewSelector;


/* ------------------------------------------------------------------------- */
// extension imports
const Extension = gsExtensionUtils.getCurrentExtension();
const BaseIntegration = Extension.imports.lib.baseIntegration;
const Compat = Extension.imports.lib.compat;
const Utils = Extension.imports.lib.utils;


/* ------------------------------------------------------------------------- */
// globals
const OVERVIEW_SEARCH_BOX = {
  WINDOW_SEARCH: 0,
  GNOME_DEFAULT: 1,
  DISABLED: 2
};


/* ------------------------------------------------------------------------- */
var ViewSelectorIntegration = class ViewSelectorIntegration
  extends BaseIntegration.BaseIntegration {

  /* ....................................................................... */
  constructor(injectionsRegistry, boundSettings) {

    // call parent constructor
    super();

    // logger
    this._logger = new Utils.Logger(
      "ViewSelectorIntegration.js::ViewSelectorIntegration"
    );

    // bound settings
    this._boundSettings = boundSettings;

    // injection registry
    this._injectionsRegistry = injectionsRegistry;

    // injection registry name for this class
    this._injectionRegistryName = "ViewSelectorIntegration";

  }

  /* ....................................................................... */
  matches() {
    // always return false since this is not an extension
    return false;
  }

  /* ....................................................................... */
  enable() {

    // inject _onStageKeyPress
    this._injectionsRegistry.addWithLabel(
      this._injectionRegistryName,
      [
        gsViewSelector.ViewSelector.prototype,
        "_onStageKeyPress",
        this._onStageKeyPressInjection(
          gsViewSelector.ViewSelector.prototype._onStageKeyPress
        )
      ]
    );

    // inject _showPage
    this._injectionsRegistry.addWithLabel(
      this._injectionRegistryName,
      [
        gsViewSelector.ViewSelector.prototype,
        "_showPage",
        this._showPageInjection(
          gsViewSelector.ViewSelector.prototype._showPage
        )
      ]
    );

  }

  /* ....................................................................... */
  disable() {
    let overviewSearchElement = Compat.overviewSearchElement();
    // remove injections
    this._injectionsRegistry.removeWithLabel(this._injectionRegistryName);
    // show overview search element
    overviewSearchElement.show();
  }

  /* ....................................................................... */
  _showPageInjection(showPageOriginal) {
    let settings = this._boundSettings;

    return function _showPage(page) {
      let windowSearch = gsMain.overview._overviewImproved.windowSearch;
      let workspacesDisplay = gsMain.overview.viewSelector._workspacesDisplay;

      let overviewSearchElement = Compat.overviewSearchElement();

      if (page === this._appsPage) {
        windowSearch.hideEntry();
        overviewSearchElement.show();

        // if switching workspaces page then show all workspaces
        if (settings._multipleMonitorsApplicationViewHideWindows === true) {
          workspacesDisplay._workspacesViews.forEach(
            workspaceView => Compat.workspaceViewActor(workspaceView).hide()
          );
        }

      }
      else if (page === this._workspacesPage) {
        // general overview
        if (windowSearch.wmClass === null) {
          switch (settings._generalOverviewSearchBox) {
          case OVERVIEW_SEARCH_BOX.WINDOW_SEARCH:
            overviewSearchElement.hide();
            windowSearch.showEntry();
            break;
          case OVERVIEW_SEARCH_BOX.GNOME_DEFAULT:
            windowSearch.hideEntry();
            overviewSearchElement.show();
            break;
          case OVERVIEW_SEARCH_BOX.DISABLED:
            windowSearch.hideEntry();
            overviewSearchElement.hide();
            break;
          }
        }
        // window overview
        else {
          switch (settings._windowOverviewSearchBox) {
          case OVERVIEW_SEARCH_BOX.WINDOW_SEARCH:
            overviewSearchElement.hide();
            windowSearch.showEntry();
            break;
          case OVERVIEW_SEARCH_BOX.GNOME_DEFAULT:
            windowSearch.hide();
            overviewSearchElement.show();
            break;
          case OVERVIEW_SEARCH_BOX.DISABLED:
            windowSearch.hide();
            overviewSearchElement.hide();
            break;
          }
        }

        // if switching workspaces page then show all workspaces
        if (settings._multipleMonitorsApplicationViewHideWindows === true) {
          workspacesDisplay._workspacesViews.forEach(
            workspaceView => Compat.workspaceViewActor(workspaceView).show()
          );
        }

      }
      else {
        // for other pagers (current searchPage) also hide
        if (settings._multipleMonitorsApplicationViewHideWindows === true) {
          workspacesDisplay._workspacesViews.forEach(
            workspaceView => Compat.workspaceViewActor(workspaceView).hide()
          );
        }
      }
      // run original function
      return showPageOriginal.apply(
        this,
        [page]
      );

    };
  }

  /* ....................................................................... */
  _onStageKeyPressInjection(onStageKeyPressOriginal) {
    return function _onStageKeyPress(entry, event) {
      let windowSearch = gsMain.overview._overviewImproved.windowSearch;

      let overviewSearchElement = Compat.overviewSearchElement();

      // if we are in apps then always run original function and return
      if (this._showAppsButton.checked == true) {
        return onStageKeyPressOriginal.apply(
          this,
          [entry, event]
        );
      }
      else {
        // if application search entry bin is visible then run original
        // function and return
        if (overviewSearchElement.visible === true) {
          return onStageKeyPressOriginal.apply(
            this,
            [entry, event]
          );
        }
        else if (windowSearch.isEntryVisible() === true) {
          return windowSearch._runSearch(entry, event);
        }
        // this is in case no entries are visible (i.e. disabled)
        else {
          return Clutter.EVENT_PROPAGATE;
        }
      }
    };
  }

};
