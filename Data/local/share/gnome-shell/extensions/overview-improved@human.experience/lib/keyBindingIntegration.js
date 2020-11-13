/* ------------------------------------------------------------------------- */
// eslint configuration for this file
//
/* global imports */
/* global global */

/* exported KeyBindingIntegration */


/* ------------------------------------------------------------------------- */
// enforce strict mode
"use strict";


/* ------------------------------------------------------------------------- */
// library imports
const Shell = imports.gi.Shell;


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
var KeyBindingIntegration = class KeyBindingIntegration
  extends BaseIntegration.BaseIntegration {

  /* ....................................................................... */
  constructor(gioSettings) {
    super();

    // logger
    this._logger = new Utils.Logger(
      "keybindingIntegration.js::KeybindingIntegration"
    );

    // gio object from settings registry
    this._gioSettings = gioSettings;

  }

  /* ....................................................................... */
  matches() {
    // always return false since this is not an extension
    return false;
  }

  /* ....................................................................... */
  enable() {
    // add our own keybinging handler
    gsMain.wm.addKeybinding(
      "window-overview-keybinding",
      this._gioSettings,
      Compat.keyBindingAutoRepeat(),
      Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
      this._toggleWindowSearchOverview
    );

  }

  /* ....................................................................... */
  disable() {
    // remove our own keybinding handler
    gsMain.wm.removeKeybinding("window-overview-keybinding");
  }

  /* ....................................................................... */
  _toggleWindowSearchOverview() {
    let windowSearch = gsMain.overview._overviewImproved.windowSearch;

    if (gsMain.overview._shown === true) {
      // if in overview, set window search class to null
      windowSearch.wmClass = null;
      // hide overview
      gsMain.overview.hide();
    }
    else {
      // set window search class to existing focused window
      windowSearch.wmClass = Compat.getWmClass(global.display.focus_window);
      // show overview
      gsMain.overview.show();
    }
  }

};
