/* ------------------------------------------------------------------------- */
// eslint configuration for this file
//

/* global imports */

/* exported MultiMonitorAddOnIntegration */


/* ------------------------------------------------------------------------- */
// enforce strict mode
"use strict";


/* ------------------------------------------------------------------------- */
// gnome shell imports
const gsExtensionUtils = imports.misc.extensionUtils;
const gsMain = imports.ui.main;


/* ------------------------------------------------------------------------- */
// extension imports
const Extension = gsExtensionUtils.getCurrentExtension();
const BaseIntegration = Extension.imports.lib.baseIntegration;
const Compat = Extension.imports.lib.compat;
const Utils = Extension.imports.lib.utils;


/* ------------------------------------------------------------------------- */
// globals
const multiMonitorAddOnExtensionUuid = "multi-monitors-add-on@spin83";


/* ------------------------------------------------------------------------- */
var MultiMonitorAddOnIntegration = class MultiMonitorAddOnIntegration
  extends BaseIntegration.BaseIntegration {

  /* ....................................................................... */
  constructor(injectionsRegistry, boundSettings) {

    // call parent constructor
    super();

    // logger
    this._logger = new Utils.Logger(
      "multiMonitorAddOnIntegration.js::MultiMonitorAddOnIntegration"
    );

    // bound settings
    this._boundSettings = boundSettings;

    // reference to dash to dock extension
    this._multiMonitorAddOnExtension = null;

    // signals registry
    this._signalsRegistry = new Utils.SignalsRegistry();

    // injection registry
    this._injectionsRegistry = injectionsRegistry;

    // injection registry name for this class
    this._injectionRegistryName = "multiMonitorAddOnIntegration";

    // signal registry name for this class
    this._signalRegistryName = "multiMonitorAddOnIntegration";

  }

  /* ....................................................................... */
  matches(uuid) {
    return uuid === multiMonitorAddOnExtensionUuid;
  }

  /* ....................................................................... */
  enable() {
    let multiMonitorAddOn;
    let extensionLookup = Compat.extensionSystemImports().extensionLookup;

    // check if we already have an extension reference
    if (this._multiMonitorAddOnExtension === null) {
      // get the extension
      multiMonitorAddOn = extensionLookup(multiMonitorAddOnExtensionUuid);

      if (multiMonitorAddOn !== undefined) {
        // store the extension
        this._multiMonitorAddOnExtension = multiMonitorAddOn;

        this._injectionsRegistry.addWithLabel(
          this._injectionRegistryName,
          [
            Compat.workspacesDisplayActor(
              gsMain.overview.viewSelector._workspacesDisplay
            ),
            "reactive",
            this._workspaceDisplayReactiveInjection()
          ]
        );

        this._signalsRegistry.addWithLabel(
          this._signalRegistryName,
          [
            Compat.workspacesDisplayActor(
              gsMain.overview.viewSelector._workspacesDisplay,
            ),
            "button-press-event",
            this._workspaceDisplayOnButtonPressInjection()
          ]
        );

      }
    }

  }

  /* ....................................................................... */
  disable() {
    if (this._multiMonitorAddOnExtension !== null) {
      // remove signals
      this._signalsRegistry.removeWithLabel(this._signalRegistryName);
      // remove injections
      this._injectionsRegistry.removeWithLabel(this._injectionRegistryName);
      this._multiMonitorAddOnExtension = null;
    }
  }

  /* ....................................................................... */
  _workspaceDisplayReactiveInjection() {
    let settings = this._boundSettings;
    // make temp object to contain the getter
    let tmpObject = {
      get _workspaceDisplayReactive() {
        return settings._hideWindowOverviewOnEmptySpaceClick;
      }
    };
    // return the getter
    return tmpObject._workspaceDisplayReactive;
  }

  /* ....................................................................... */
  _workspaceDisplayOnButtonPressInjection () {
    let settings = this._boundSettings;
    return function _workspaceDisplayOnButtonPress() {
      if (settings._hideWindowOverviewOnEmptySpaceClick === true) {
        gsMain.overview.hide();
      }
    };
  }

};
