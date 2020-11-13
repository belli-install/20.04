/* ------------------------------------------------------------------------- */
// eslint configuration for this file
//
/* global imports */

/* exported WorkspacesViewIntegration */


/* ------------------------------------------------------------------------- */
// enforce strict mode
"use strict";


/* ------------------------------------------------------------------------- */
// library imports
//const Clutter = imports.gi.Clutter;


/* ------------------------------------------------------------------------- */
// gnome shell imports
const gsExtensionUtils = imports.misc.extensionUtils;
const gsMain = imports.ui.main;
const gsWorkspacesView = imports.ui.workspacesView;


/* ------------------------------------------------------------------------- */
// extension imports
const Extension = gsExtensionUtils.getCurrentExtension();
const BaseIntegration = Extension.imports.lib.baseIntegration;
const Compat = Extension.imports.lib.compat;
const Utils = Extension.imports.lib.utils;


/* ------------------------------------------------------------------------- */
var WorkspacesViewIntegration = class WorkspacesViewIntegration
  extends BaseIntegration.BaseIntegration {

  /* ....................................................................... */
  constructor(injectionsRegistry, boundSettings) {
    super();

    // logger
    this._logger = new Utils.Logger(
      "WorkspacesViewIntegration.js::WorkspacesViewIntegration"
    );

    // bound settings
    this._boundSettings = boundSettings;

    // signals registry
    this._signalsRegistry = new Utils.SignalsRegistry();

    // injection registry
    this._injectionsRegistry = injectionsRegistry;

    // injection registry name for this class
    this._injectionRegistryName = "workspacesViewIntegration";

    // signal registry name for this class
    this._signalRegistryName = "workspacesViewIntegration";

  }

  /* ....................................................................... */
  matches() {
    return false;
  }

  /* ....................................................................... */
  enable() {

    // inject _onScrollEvent
    this._injectionsRegistry.addWithLabel(
      this._injectionRegistryName,
      [
        gsWorkspacesView.WorkspacesDisplay.prototype,
        "_updateWorkspacesViews",
        this._updateWorkspacesViewsInjection(
          gsWorkspacesView.WorkspacesDisplay.prototype._updateWorkspacesViews
        )
      ]
    );

    if (Compat.gnomeShellAbove336() === false) {
      // gnome 3.36 or less
      this._injectionsRegistry.addWithLabel(
        this._injectionRegistryName,
        [
          gsWorkspacesView.WorkspacesDisplay.prototype,
          "show",
          this._showInjection(
            gsWorkspacesView.WorkspacesDisplay.prototype.show
          )
        ]
      );
    }

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
          gsMain.overview.viewSelector._workspacesDisplay
        ),
        "button-press-event",
        this._workspaceDisplayOnButtonPressInjection()
      ]
    );

    // // inject _onScrollEvent
    // this._injectionsRegistry.addWithLabel(
    //   this._injectionRegistryName,
    //   [
    //     gsWorkspacesView.WorkspacesDisplay.prototype,
    //     "_onScrollEvent",
    //     this._onScrollEvent(
    //       gsWorkspacesView.WorkspacesDisplay.prototype._onScrollEvent
    //     )
    //   ]
    // );

    // // inject _onKeyPressEvent
    // this._injectionsRegistry.addWithLabel(
    //   this._injectionRegistryName,
    //   [
    //     gsWorkspacesView.WorkspacesDisplay.prototype,
    //     "_onKeyPressEvent",
    //     this._onScrollEvent(
    //       gsWorkspacesView.WorkspacesDisplay.prototype._onScrollEvent
    //     )
    //   ]
    // );

  }

  /* ....................................................................... */
  disable() {
    // remove signals
    this._signalsRegistry.removeWithLabel(this._signalRegistryName);
    //gsMain.overview.viewSelector._workspacesDisplay.actor.reactive.reactive = false;

    // remove injections
    this._injectionsRegistry.removeWithLabel(this._injectionRegistryName);
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

  /* ....................................................................... */
  _updateWorkspacesViewsInjection(updateWorkspacesViewsOriginal) {
    return function _updateWorkspacesViews() {

      updateWorkspacesViewsOriginal.apply(
        this,
      );

      let windowSearch = gsMain.overview._overviewImproved.windowSearch;
      // add focus trap so we can Tab/Shift+Tab to the search box
      windowSearch.addFocusTrapToWorkspacesDisplay();
    };

  }

  /* ....................................................................... */
  // < gnome 3.6 function replaced by animateToOverview in gnome 3.38
  _showInjection(showOriginal) {
    let settings = this._boundSettings;
    let thatInjection = this;
    return function show() {
      showOriginal.apply(
        this,
        []
      );
      thatInjection._materializeOverview(settings);
    };

  }

  /* ....................................................................... */
  _materializeOverview(settings) {
    if (settings._multipleMonitorsApplicationViewHideWindows === true) {
      // if in apps view hide the workspaces
      if (gsMain.overview.viewSelector._showAppsButton.checked === true) {
        this._workspacesViews.forEach(
          workspaceView => Compat.workspaceViewActor(workspaceView).hide()
        );
      }
    }

  }

  /* ....................................................................... */
  /* disabled for now, seems unneeded
  _onScrollEvent(onScrollEventOriginal) {
    return function _onScrollEvent(actor, event) {
      let windowSearch = gsMain.overview._overviewImproved.windowSearch;

      // disable scrolling if current window class is set
      if (windowSearch.wmClass !== null) {
        return Clutter.EVENT_STOP;
      }
      else {
        onScrollEventOriginal.apply(
          this,
          [actor, event]
        );
      }
    };
  }
  */

  /* ....................................................................... */
  /* disabled for now, seems unneeded
  _onKeyPressEvent(onKeyPressEventOriginal) {
    return function _onKeyPressEvent (actor, event) {
      let windowSearch = gsMain.overview._overviewImproved.windowSearch;

      // stop page up, page down, everything else iof current window class is
      // set, do allow escape though
      if (windowSearch.wmClass !== null) {
        switch (event.get_key_symbol()) {
        case Clutter.KEY_Page_Up:
          return Clutter.EVENT_STOP;
        case Clutter.KEY_Page_Down:
          return Clutter.EVENT_STOP;
        case Clutter.KEY_Escape:
          return Clutter.EVENT_PROPAGATE;
        default:
          return Clutter.EVENT_STOP;
        }
      }
      else {
        onKeyPressEventOriginal.apply(
          this,
          [actor, event]
        );
      }
    };

  }
  */

};
