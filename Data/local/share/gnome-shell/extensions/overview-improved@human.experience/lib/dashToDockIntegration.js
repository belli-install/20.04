/* ------------------------------------------------------------------------- */
// eslint configuration for this file
//

/* global global */
/* global imports */

/* exported DashToDockIntegration */


/* ------------------------------------------------------------------------- */
// enforce strict mode
"use strict";


/* ------------------------------------------------------------------------- */
// library imports
const Clutter = imports.gi.Clutter;
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
// globals
const dashToDockExtensionUuid = "dash-to-dock@micxgx.gmail.com";
const ubuntuDockExtensionUuid = "ubuntu-dock@ubuntu.com";
const SINGLE_WINDOW_ACTION = {
  FOCUS: 0,
  MINIMIZE_UNMINIMIZE: 1,
  OVERVIEW: 2
};
const MULTIPLE_WINDOW_ACTION = {
  UNITY_BEHAVIOUR: 0,
  OVERVIEW: 1,
};


/* ------------------------------------------------------------------------- */
var DashToDockIntegration = class DashToDockIntegration
  extends BaseIntegration.BaseIntegration {

  /* ....................................................................... */
  constructor(injectionsRegistry, boundSettings) {

    // call parent constructor
    super();

    // logger
    this._logger = new Utils.Logger(
      "dashToDockIntegration.js::DashToDockIntegration"
    );

    // bound settings
    this._boundSettings = boundSettings;

    // reference to dash to dock extension
    this._dashToDockExtension = null;

    // injection registry
    this._injectionsRegistry = injectionsRegistry;

    // injection registry name for this class
    this._injectionRegistryName = "dashToDockIntegration";

  }

  /* ....................................................................... */
  matches(uuid) {
    return uuid === dashToDockExtensionUuid ||
      uuid === ubuntuDockExtensionUuid;
  }

  /* ....................................................................... */
  enable() {
    let dashToDock;

    // check if we already have an extension reference
    if (this._dashToDockExtension === null) {
      // get the extension
      dashToDock = this._getDockExtension();

      if (dashToDock !== null) {
        // store the extension
        this._dashToDockExtension = dashToDock;

        // inject activate
        this._injectionsRegistry.addWithLabel(
          this._injectionRegistryName,
          [
            dashToDock.imports.appIcons.MyAppIcon.prototype,
            "activate",
            this._activateInjection(
              dashToDock.imports.appIcons.MyAppIcon.prototype.activate
            )
          ]
        );
      }
    }

  }

  /* ....................................................................... */
  disable() {
    if (this._dashToDockExtension !== null) {
      // remove injections
      this._injectionsRegistry.removeWithLabel(this._injectionRegistryName);
      this._dashToDockExtension = null;
    }
  }

  /* ....................................................................... */
  _getDockExtension() {
    let dashToDock;
    let extensionLookup = Compat.extensionSystemImports().extensionLookup;
    // look up dash-to-dock
    dashToDock = extensionLookup(dashToDockExtensionUuid);
    // look up ubuntu-dock
    if (dashToDock === undefined) {
      dashToDock = extensionLookup(ubuntuDockExtensionUuid);
    }

    if (dashToDock === undefined) {
      return null;
    }
    else {
      return dashToDock;
    }

  }

  /* ....................................................................... */
  _activateInjection(activateOriginal) {
    let dtdi = this;
    let workspaceManager = Compat.workspaceManager();

    return function activate(button) {

      // if this dash-to-dock that supports locations and "this: is a location
      // (i.e. trash or such), just call the original function
      if (this.isLocation !== undefined) {
        if (this.isLocation()) {
          // call original function and return it's result
          return activateOriginal.apply(
            this,
            [button]
          );
        }
      }

      let event = Clutter.get_current_event();
      let modifiers = event ? event.get_state() : 0;

      // Only consider SHIFT and CONTROL as modifiers
      // (exclude SUPER, CAPS-LOCK, etc.)
      modifiers = modifiers &
        (Clutter.ModifierType.SHIFT_MASK | Clutter.ModifierType.CONTROL_MASK);

      // only no button (keypress?) button 1 and no modifiers
      if ((button !== undefined && button === 1) && modifiers === 0) {

        // get all the windows using dash-to-dock window function
        // notably this function respects
        let windows = this.getInterestingWindows();

        // create a map of windows to workspace
        let workspacesToWindows = dtdi._makeWorkspaceWindowsMap(
          windows,
          workspaceManager.get_active_workspace_index()
        );
        // get list of windows for active workspace
        let windowsOnActiveWorkspace = workspacesToWindows.get(
          workspaceManager.get_active_workspace_index()
        );

        // get application running status but testing this app.state
        // and also seeing if there are any windows for it
        // as a note, windows here is affected by isolate setting
        let appIsRunning = this.app.state == Shell.AppState.RUNNING
             && windows.length > 0;

        // if application is running on any workspace
        if (appIsRunning === true) {
          if (windowsOnActiveWorkspace.length > 0) {
            dtdi._handlesWindowsDisplay(
              this.app,
              windowsOnActiveWorkspace
            );
          }
          else {
            // find windows on other workspaces, and index of that workspace
            let [windowsOnOtherWorkspace, otherWorkspaceIndex] =
              dtdi._findWorkspaceWithWindows(
                workspacesToWindows,
                workspaceManager.get_active_workspace_index()
              );

            // activate other workspace and show their windows
            dtdi._handlesWindowsDisplay(
              this.app,
              windowsOnOtherWorkspace,
              otherWorkspaceIndex
            );

          }
        }
        else {
          // if app is not running then launch application
          this.launchNewWindow();
          if (gsMain.overview._shown === true) {
            gsMain.overview.hide();
          }
        }
      }
      else {
        // call original function and return it's result
        return activateOriginal.apply(
          this,
          [button]
        );
      }

    };
  }

  /* ....................................................................... */
  _findWorkspaceWithWindows(workspacesToWindows, ignoreWorkspaceIndex) {
    // got over list of window on each workspace
    for (let [workspaceIndex, workspaceWindows] of workspacesToWindows)
    {
      if (workspaceIndex !== ignoreWorkspaceIndex) {
        if (workspaceWindows.length > 0) {
          return [workspaceWindows, workspaceIndex];
        }
      }
    }
  }

  /* ....................................................................... */
  _handlesWindowsDisplay(
    app,
    windows,
    workspaceIndex=null,
  ) {
    let tracker = Shell.WindowTracker.get_default();
    let focusedApp = tracker.focus_app;

    if (workspaceIndex !== null) {
      this._activateWorkspaceByIndex(workspaceIndex);
    }

    // get first window
    let firstWindow = windows[0];

    // if there is only one window
    if (windows.length === 1) {
      switch (this._boundSettings._singleWindowAction) {
      case SINGLE_WINDOW_ACTION.FOCUS:
        // activate single window
        gsMain.activateWindow(firstWindow);
        break;
      case SINGLE_WINDOW_ACTION.MINIMIZE_UNMINIMIZE:
        if (app == focusedApp) {
          // Window is raised, minimize it
          firstWindow.minimize();
        } else {
          // window is minimized, raise it
          gsMain.activateWindow(firstWindow);
        }
        break;
      case SINGLE_WINDOW_ACTION.OVERVIEW:
        this._handlesWindowsDisplayWithOverview(firstWindow);
        break;
      }
    }
    else if (windows.length > 1) {
      switch (this._boundSettings._multipleWindowAction) {
      case MULTIPLE_WINDOW_ACTION.UNITY_BEHAVIOUR:
        if (Compat.getWmClass(global.display.focus_window)
            === Compat.getWmClass(firstWindow)) {
          this._handlesWindowsDisplayWithOverview(firstWindow);
        }
        else {
          gsMain.activateWindow(firstWindow);
        }
        break;
      case MULTIPLE_WINDOW_ACTION.OVERVIEW:
        this._handlesWindowsDisplayWithOverview(firstWindow);
        break;
      }
    }

  }

  /* ....................................................................... */
  _handlesWindowsDisplayWithOverview(firstWindow) {
    let windowSearch = gsMain.overview._overviewImproved.windowSearch;
    if (gsMain.overview._shown === true) {
      // activate first window
      gsMain.activateWindow(firstWindow);
    }
    else {
      // set current wmClass
      windowSearch.wmClass = Compat.getWmClass(firstWindow);
      // toggle overview
      gsMain.overview.show();
    }
  }

  /* ....................................................................... */
  _makeWorkspaceWindowsMap(windows, activeWorkspaceIndex) {
    let workspaceToWindowMap = new Map();
    // get workspace manager
    let workspaceManager = Compat.workspaceManager();
    let workspaceCount = workspaceManager.get_n_workspaces();

    // array of workspaces
    let workspaceIndices = [...Array(workspaceCount).keys()];

    // rotate so we can check closest workspace first, wrap around style
    // (i.e. for 5 workspace, if empty index is 0, we should check 4 and 1
    // workspaces fist
    // so we rotate [0, 1, 2, 3, 4] to [4, 0, 1, 2, 3]
    workspaceIndices = Utils.rotateArray(
      workspaceIndices,
      activeWorkspaceIndex - 1
    );

    // swap first and second element so we search active workspace first
    // then it's closest neighbours
    workspaceIndices = Utils.swapArrayElements(workspaceIndices, 0, 1);

    // go over all the workspaces, and for each workspace all windows and
    // find window closes
    for (let workspaceIndex of workspaceIndices) {
      workspaceToWindowMap.set(workspaceIndex, []);
      for (let window_ of windows) {
        if (window_.get_workspace().index() === workspaceIndex) {
          workspaceToWindowMap.get(workspaceIndex).push(window_);
        }
      }
    }

    return workspaceToWindowMap;

  }

  /* ....................................................................... */
  _activateWorkspaceByIndex(workspaceIndex) {
    // get workspace manager
    let workspaceManager = Compat.workspaceManager();

    // check index is valid
    if (workspaceIndex >= 0 &&
      workspaceIndex < workspaceManager.n_workspaces) {
      // get the workspace
      let workspace = workspaceManager.get_workspace_by_index(
        workspaceIndex
      );
      // activate workspace
      workspace.activate(global.get_current_time());
    }
  }


};
