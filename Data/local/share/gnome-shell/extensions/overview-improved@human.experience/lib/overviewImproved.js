/* ------------------------------------------------------------------------- */
// eslint configuration for this file
//
/* global imports */

/* exported OverviewImproved */


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
const Compat = Extension.imports.lib.compat;
const SettingsRegistry = Extension.imports.lib.settingsRegistry;
const Utils = Extension.imports.lib.utils;

const DashToDockIntegration = Extension.imports.lib.dashToDockIntegration;
const KeyBindingIntegration = Extension.imports.lib.keyBindingIntegration;
const MultiMonitorAddOnIntegration = Extension.imports.lib.multiMonitorAddOnIntegration;
const OverviewIntegration = Extension.imports.lib.overviewIntegration;
const ViewSelectorIntegration = Extension.imports.lib.viewSelectorIntegration;
const WorkspaceIntegration = Extension.imports.lib.workspaceIntegration;
const WorkspacesViewIntegration = Extension.imports.lib.workspacesViewIntegration;


/* ------------------------------------------------------------------------- */
var OverviewImproved = class OverviewImproved {

  /* ....................................................................... */
  constructor() {

    // logger
    this._logger = new Utils.Logger(
      "overviewImproved.js::OverviewImproved"
    );

    // signals registry
    this._signalsRegistry = new Utils.SignalsRegistry();

    // injections registry
    this._injectionsRegistry = new Utils.InjectionsRegistry();

    // settings registry
    this._settingsRegistry = new SettingsRegistry.SettingsRegistry();

    // list containing integrations
    this._integrations = [];

  }

  /* ....................................................................... */
  enable() {
    let extensionManager = Compat.extensionSystemImports().extensionManager;

    // create object for state tracking
    gsMain.overview._overviewImproved = {
      windowSearch: null,
    };

    // initialize registry
    this._settingsRegistry.init();

    // create list of integrations
    this._integrations = [
      // workspace integration
      new WorkspaceIntegration.WorkspaceIntegration(
        this._injectionsRegistry
      ),
      // overview integration
      new OverviewIntegration.OverviewIntegration(
        this._injectionsRegistry,
        this._settingsRegistry.boundSettings
      ),
      new ViewSelectorIntegration.ViewSelectorIntegration(
        this._injectionsRegistry,
        this._settingsRegistry.boundSettings
      ),
      // workspace view integration
      new WorkspacesViewIntegration.WorkspacesViewIntegration(
        this._injectionsRegistry,
        this._settingsRegistry.boundSettings
      ),
      // multi monitor add on
      new MultiMonitorAddOnIntegration.MultiMonitorAddOnIntegration(
        this._injectionsRegistry,
        this._settingsRegistry.boundSettings
      ),
      // dash-to-dock integration
      new DashToDockIntegration.DashToDockIntegration(
        this._injectionsRegistry,
        this._settingsRegistry.boundSettings
      ),
      // keybinding integration
      new KeyBindingIntegration.KeyBindingIntegration(
        this._settingsRegistry.gioSettings
      )
    ];

    // enable the integration
    for (let integration of this._integrations) {
      integration.enable();
    }

    // somemight get enabled after this extension so run intergations on
    // "extension-state-changed" signal
    this._signalsRegistry.addWithLabel(
      "extensionManager",
      [
        extensionManager,
        "extension-state-changed",
        this._onExtensionStateChanged.bind(this)
      ]
    );

  }

  /* ....................................................................... */
  disable() {

    // disable all the integration
    for (let integration of this._integrations) {
      integration.disable();
    }
    this._integrations = [];

    // disconnect all signals we connected
    this._signalsRegistry.destroy();

    // remove any leftover injections
    this._injectionsRegistry.destroy();

    // destroy settings registry
    this._settingsRegistry.destroy();

    // remove patched properties
    gsMain.overview._overviewImproved.windowSearch = undefined;
    gsMain.overview._overviewImproved = undefined;

  }

  /* ....................................................................... */
  _onExtensionStateChanged(data, extension) {
    let ExtensionState = Compat.extensionSystemImports().ExtensionState;

    // go over all integrations and enable or disable them if then integration
    // matches the extension changed
    for (let integration of this._integrations) {
      if (integration.matches(extension.uuid)) {
        if(extension.state === ExtensionState.ENABLED){
          integration.enable();
        }
        else if (extension.state === ExtensionState.DISABLED) {
          integration.disable();
        }
      }
    }
  }

};
