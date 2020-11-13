/* ------------------------------------------------------------------------- */
// eslint configuration for this file
//

/* global imports */

/* exported SettingsRegistry */


/* ------------------------------------------------------------------------- */
// enforce strict mode
"use strict";


/* ------------------------------------------------------------------------- */
// gnome shell imports
const gsExtensionUtils = imports.misc.extensionUtils;


/* ------------------------------------------------------------------------- */
// extensions imports
const Extension = gsExtensionUtils.getCurrentExtension();
const Convenience = Extension.imports.lib.convenience;
const Utils = Extension.imports.lib.utils;


/* ------------------------------------------------------------------------- */
var SettingsRegistry = class SettingsRegistry {

  /* ....................................................................... */
  constructor() {
    let settingsSchemaName;

    // initialize EventMessageImprovedFactory logger
    this._logger = new Utils.Logger(
      "settingsRegistry.js:SettingsRegistry"
    );

    // bound settings object
    this._boundSettings = {
      _singleWindowAction: null,
      _multipleWindowAction: null,
      _windowOverviewSearchBox: null,
      _generalOverviewSearchBox: null,
      _multipleMonitorsApplicationViewHideWindows: null,
      _hideWindowOverviewOnEmptySpaceClick: null
    };

    // signals registry
    this._signalsRegistry = new Utils.SignalsRegistry();

    // get settings for this extension
    settingsSchemaName = Extension.metadata["settings-schema"];
    this._settings = Convenience.getSettings(settingsSchemaName);

    // define settings to be bound to properties
    this._settingsIdsToProperty = [
      ["single-window-action", "_singleWindowAction", this._enum],
      ["multiple-window-action", "_multipleWindowAction", this._enum],
      ["window-overview-search-box", "_windowOverviewSearchBox", this._enum],
      ["general-overview-search-box", "_generalOverviewSearchBox", this._enum],
      [
        "multiple-monitors-applications-view-hide-windows",
        "_multipleMonitorsApplicationViewHideWindows",
        this._boolean
      ],
      [
        "hide-window-overview-on-empty-space-click",
        "_hideWindowOverviewOnEmptySpaceClick",
        this._boolean
      ]
    ];

  }

  /* ....................................................................... */
  init() {
    // go over all the settins, property names and their respective update
    // functions, set property values and bind the the properties to be updated
    // on 'changed::' signal
    for (let [settingId, propertyName, updateFunc]
      of this._settingsIdsToProperty) {

      // bind the function to "this"
      let updateMethod = updateFunc.bind(this);

      // update the setting right now
      this._boundSettings[propertyName] = updateMethod(settingId);

      // add a signal
      this._signalsRegistry.addWithLabel(
        "settingsManager",
        [
          this._settings,
          `changed::${settingId}`,
          this._updatePropertyFromSettingFactory(
            settingId,
            propertyName,
            updateMethod
          )
        ]
      );
    }
  }

  /* ....................................................................... */
  /*
   * Destroy settings registry
  */
  destroy() {
    // todo: also need to destroy _boundSettings object
    this._signalsRegistry.destroy();
  }

  /* ....................................................................... */
  get boundSettings() {
    return this._boundSettings;
  }

  /* ....................................................................... */
  get gioSettings() {
    return this._settings;
  }


  /* ....................................................................... */
  /*
   * return function handler to update the setting, bound to the instance
   * of settingsRegistry
  */
  _updatePropertyFromSettingFactory(settingId, propertyName, updateMethod) {
    return function _updatePropertyFromSetting() {
      // set the propery to the current value
      this._boundSettings[propertyName] = updateMethod(settingId);
    }.bind(this);
  }

  /* ....................................................................... */
  _boolean(settingId) {
    return this._settings.get_boolean(settingId);
  }

  /* ....................................................................... */
  _invertedBoolean(settingId) {
    return !this._boolean(settingId);
  }

  /* ....................................................................... */
  _string(settingId) {
    return this._settings.get_string(settingId);
  }

  /* ....................................................................... */
  _integer(settingId) {
    return this._settings.get_int(settingId);
  }

  /* ....................................................................... */
  _enum(settingId) {
    return this._settings.get_enum(settingId);
  }


};
