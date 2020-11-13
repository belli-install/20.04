// ------------------------------------------------------------------------- //
// eslint configuration for this file
//

/* global global */
/* global imports */

/* exported Clutter_KEY_ISO_Left_Tab */
/* exported DirectionType */
/* exported elementCenterAlign */
/* exported extensionSystemImports */
/* exported getWmClass */
/* exported gnomeShellAbove336 */
/* exported keyBindingAutoRepeat */
/* exported overviewSearchElement */
/* exported registerClass */
/* exported workspaceDisplayNavigateFocus */
/* exported workspaceManager */
/* exported workspacesDisplayActor */
/* exported workspaceViewActor */

// ------------------------------------------------------------------------- //
// enforce strict mode
"use strict";


// ------------------------------------------------------------------------- //
// system libraries imports
const Clutter = imports.gi.Clutter;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Meta = imports.gi.Meta;
const St = imports.gi.St;


/* ------------------------------------------------------------------------- */
// gnome shell imports
const gsMain = imports.ui.main;

// ------------------------------------------------------------------------- //
const VERSION_LIST = imports.misc.config.PACKAGE_VERSION.split(".");


// ------------------------------------------------------------------------- //
// TODO: change to a function
var registerClass;
{
  if (VERSION_LIST[0] >= 3 && VERSION_LIST[1] > 30) {
    registerClass = GObject.registerClass;
  } else {
    registerClass = (x => x);
  }
}


// ------------------------------------------------------------------------- //
var gnomeShellAbove336 = function gnomeShellAbove336() {
  return (VERSION_LIST[0] >= 3 && VERSION_LIST[1] > 36);
};

// ------------------------------------------------------------------------- //
var extensionSystemImports = function extensionSystemImports() {
  // post Gnome Shell 3.30
  if (imports.ui.main.extensionManager !== undefined) {
    return {
      extensionManager: imports.ui.main.extensionManager,
      extensionLookup: (uuid) => {
        return imports.ui.main.extensionManager.lookup(uuid);
      },
      ExtensionState: imports.misc.extensionUtils.ExtensionState
    };
  }
  // gnome 3.28
  else {
    return {
      extensionManager: imports.ui.extensionSystem,
      extensionLookup: (uuid) => {
        if (
          Object.prototype.hasOwnProperty.call(
            imports.misc.extensionUtils.extensions,
            uuid
          ) === true
        ) {
          return imports.misc.extensionUtils.extensions[uuid];
        }
        else {
          return undefined;
        }
      },
      ExtensionState: imports.ui.extensionSystem.ExtensionState
    };
  }
};


// ------------------------------------------------------------------------- //
var workspaceManager = function workspaceManager() {
  // workspace manager was introduced in 3.30, before it it was global.screen
  if (global.workspace_manager !== undefined) {
    return global.workspace_manager;
  }
  else {
    return global.screen;
  }
};


// ------------------------------------------------------------------------- //
var DirectionType;
if (St.DirectionType === undefined) {
  DirectionType = Gtk.DirectionType;
}
else {
  DirectionType = St.DirectionType;
}


// ------------------------------------------------------------------------- //
var overviewSearchElement = function overviewSearchElement() {
  if (VERSION_LIST[0] >= 3 && VERSION_LIST[1] > 34) {
    return gsMain.overview._overview._searchEntry.get_parent();
  }
  else {
    return gsMain.overview._searchEntryBin;
  }
};


// ------------------------------------------------------------------------- //
var workspaceViewActor = function workspaceViewActor(workspaceView) {
  if (VERSION_LIST[0] >= 3 && VERSION_LIST[1] > 34) {
    return workspaceView;
  }
  else {
    return workspaceView.actor;
  }
};


// ------------------------------------------------------------------------- //
var workspacesDisplayActor = function workspacesDisplayActor(workspacesDisplay)
{
  if (VERSION_LIST[0] >= 3 && VERSION_LIST[1] > 34) {
    return workspacesDisplay;
  }
  else {
    return workspacesDisplay.actor;
  }
};


// ------------------------------------------------------------------------- //
var elementCenterAlign = function elementCenterAlign() {
  if (VERSION_LIST[0] >= 3 && VERSION_LIST[1] > 34) {
    return Clutter.ActorAlign.CENTER;
  }
  else {
    return St.Align.MIDDLE;
  }
};


// ------------------------------------------------------------------------- //
var Clutter_KEY_ISO_Left_Tab = function Clutter_KEY_ISO_Left_Tab() {
  if (VERSION_LIST[0] >= 3 && VERSION_LIST[1] > 34) {
    return Clutter.KEY_ISO_Left_Tab;
  }
  else {
    return Clutter.ISO_Left_Tab;
  }
};


// ------------------------------------------------------------------------- //
var workspaceDisplayNavigateFocus = function workspaceDisplayNavigateFocus() {
  if (VERSION_LIST[0] >= 3 && VERSION_LIST[1] > 34) {
    return function navigate_focus(from, direction) {
      return gsMain.overview.viewSelector._workspacesDisplay._getPrimaryView()
        .navigate_focus(
          from,
          direction,
          false
        );
    };
  }
  else {
    return function navigateFocus(from, direction) {
      return gsMain.overview.viewSelector._workspacesDisplay.navigateFocus(
        from,
        direction
      );
    };
  }
};


// ------------------------------------------------------------------------- //
var keyBindingAutoRepeat = function keyBindingAutoRepeat() {
  // if version is less then 3.30 the keybinding flags are NONE
  if (VERSION_LIST[0] >= 3 && VERSION_LIST[1] < 30) {
    return Meta.KeyBindingFlags.NONE;
  }
  else {
    return Meta.KeyBindingFlags.IGNORE_AUTOREPEAT;
  }
};


// ------------------------------------------------------------------------- //
var getWmClass = function getWmClass(some_window) {
  if (some_window.get_wm_class !== undefined) {
    return some_window.get_wm_class();
  }
  else if (some_window.get_meta_window !== undefined) {
    return some_window.get_meta_window().wm_class;
  }
};
