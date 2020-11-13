/* ------------------------------------------------------------------------- */
// eslint configuration for this file
//
/* global imports */
/* global window */


/* exported buildPrefsWidget */
/* exported init */


/* ------------------------------------------------------------------------- */
// enforce strict mode
"use strict";


/* ------------------------------------------------------------------------- */
// enable global used for debugging
window.overviewImproved = {
  debug: false,
};


/* ------------------------------------------------------------------------- */
// language libraries
//const Lang = imports.lang;


/* ------------------------------------------------------------------------- */
// system libraries imports
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;


/* ------------------------------------------------------------------------- */
// gnome shell imports
const gsExtensionUtils = imports.misc.extensionUtils;


/* ------------------------------------------------------------------------- */
// gnome shell imports
const Extension = gsExtensionUtils.getCurrentExtension();


/* ------------------------------------------------------------------------- */
// extension imports
const Convenience = Extension.imports.lib.convenience;
const Utils = Extension.imports.lib.utils;


/* ------------------------------------------------------------------------- */
// tree view columns
const COLUMN_KEY = 0;
const COLUMN_MODS = 1;


/* ------------------------------------------------------------------------- */
function init() {
}


/* ------------------------------------------------------------------------- */
function buildPrefsWidget() {

  let preferencesContainer;

  // create preferences container
  preferencesContainer = new PreferencesContainer();

  // show preferences container
  preferencesContainer.showAll();

  // return preferences top level widget to be embedded into preferences window
  return preferencesContainer.getTopLevelWidget();
}


/* ------------------------------------------------------------------------- */
class PreferencesContainer {

  /* ....................................................................... */
  constructor() {

    let settingsSchemaId;
    let preferencesGladeFilePath;

    // initialize preferences logger
    this._logger = new Utils.Logger("prefs.js:PreferencesContainer");

    // get extension setting schema id
    settingsSchemaId = Extension.metadata["settings-schema"];

    // get settings object
    this._settings = Convenience.getSettings(settingsSchemaId);

    // compose preferences.glade path
    preferencesGladeFilePath = GLib.build_filenamev([
      Extension.dir.get_path(),
      "ui",
      "preferences.glade",
    ]);

    // create builder from preferences glade file
    this._builder = Gtk.Builder.new_from_file(preferencesGladeFilePath);

    // get top level widget
    this._topLevelWidget = this._builder.get_object("preferences_viewport");

    // bind settings
    this._bindSettings();

  }

  /* ....................................................................... */
  showAll() {

    // set extension_version element to metadata version
    this._builder.get_object("extension_version").label =
      Extension.metadata["version"].toString();

    // show top level widget and it"s children except those that have
    // show_all set to false
    this._topLevelWidget.show_all();
  }

  /* ....................................................................... */
  getTopLevelWidget() {
    // return top level widget
    return this._topLevelWidget;
  }

  /* ....................................................................... */
  _bindSettings() {
    this._bindGeneralTabSettings();
  }

  /* ....................................................................... */
  _bindGeneralTabSettings() {

    // bind enable settings to comboboxtex element via entry buffer
    this._bindSettingsToComboBoxTextChangeViaEntryBuffer(
      [
        [
          "single-window-action",
          "single_window_action_comboboxtext",
          "single_window_action_comboboxtext_entrybuffer",
        ],
        [
          "multiple-window-action",
          "multiple_window_action_comboboxtext",
          "multiple_window_action_comboboxtext_entrybuffer",
        ],
        [
          "window-overview-search-box",
          "window_overview_search_box_comboboxtext",
          "window_overview_search_box_comboboxtext_entrybuffer",
        ],
        [
          "general-overview-search-box",
          "general_overview_search_box_comboboxtext",
          "general_overview_search_box_comboboxtext_entrybuffer",
        ]
      ]
    );

    this._bindSettingsToElementProperty(
      [
        [
          "multiple-monitors-applications-view-hide-windows",
          "multiple_monitors_application_view_hide_windows_switch"
        ],
        [
          "hide-window-overview-on-empty-space-click",
          "hide_window_overview_on_empty_space_click_switch"
        ]
      ],
      "active"
    );

    // create and bind shortcut edit
    this._makeShortcutEdit(
      "window_overview_keybinding_treeview",
      "window_overview_keybinding_liststore",
      "window-overview-keybinding"
    );

    // bind reset settings buttons
    this._bindSettingsResetsToToolButton(
      [
        ["single-window-action", "single_window_action_reset_button"],
        ["multiple-window-action", "multiple_window_action_reset_button"],
        [
          "window-overview-search-box",
          "window_overview_search_box_reset_button"
        ],
        [
          "general-overview-search-box",
          "general_overview_search_box_reset_button"
        ],
        [
          "hide-window-overview-on-empty-space-click",
          "hide_window_overview_on_empty_space_click_reset_button"
        ],
        [
          "window-overview-keybinding",
          "window_overview_keybinding_reset_button"
        ]
      ]
    );

  }

  /* ....................................................................... */
  _bindSettingsToElementProperty(
    settingsToElements,
    propertyName,
    bindFlags=Gio.SettingsBindFlags.DEFAULT) {

    // go over each setting id and element Id set and bind the two
    for (let [settingId, elementId] of settingsToElements) {
      this._settings.bind(
        settingId,
        this._builder.get_object(elementId),
        propertyName,
        bindFlags
      );
    }
  }

  /* ....................................................................... */
  _bindSettingsToComboBoxTextChangeViaEntryBuffer(settingsToElements) {

    // go over each setting id and element Id set and bind the two
    for (let [settingId, elementId, entryBufferElementId]
      of settingsToElements) {

      // create binding between setting and entry buffer component
      this._settings.bind(
        settingId,
        this._builder.get_object(entryBufferElementId),
        "text",
        Gio.SettingsBindFlags.DEFAULT
      );

      // bind EntryBuffer of updating text property to update ComboBoxText
      this._builder.get_object(entryBufferElementId).connect(
        "notify::text",
        this._entryBufferToComboBoxTextHandlerFactory(elementId, settingId)
      );

      // connect element to settings
      this._builder.get_object(elementId).connect(
        "changed",
        (widget) => {
          this._settings.set_enum(
            settingId,
            widget.get_active()
          );
        }
      );

      // set ui element to existing setting
      this._builder.get_object(elementId).set_active(
        this._settings.get_enum(settingId)
      );

    }
  }

  /* ....................................................................... */
  _entryBufferToComboBoxTextHandlerFactory(comboBoxTextId, settingId) {

    let eventHandlerFunc;

    // create  handler function to handle EntryBuffer element updates
    eventHandlerFunc = function _comboBoxTextToEntryBufferHandler()
    {
      this._builder.get_object(comboBoxTextId).set_active(
        this._settings.get_enum(settingId)
      );

    };

    // return "this" bound event handler
    return eventHandlerFunc.bind(this);

  }


  /* ....................................................................... */
  _bindSettingsResetsToToolButton(settingsToElements) {

    // go over each element id and setting id set and bind the tw
    for (let [settingId, elementId] of settingsToElements) {
      this._builder.get_object(elementId).connect(
        "clicked",
        () => {
          this._settings.reset(settingId);
        }
      );
    }
  }


  _makeShortcutEdit(widgetId, storeId, settingKey) {

    const view = this._builder.get_object(widgetId);
    const store = this._builder.get_object(storeId);
    const renderer = new Gtk.CellRendererAccel({ editable: true});
    const column = new Gtk.TreeViewColumn();
    const iter = store.append();

    const updateShortcutRow = (accel) => {
      const [key, mods] = accel ? Gtk.accelerator_parse(accel) : [0, 0];
      store.set(iter, [COLUMN_KEY, COLUMN_MODS], [key, mods]);
    };

    renderer.connect("accel-edited", (renderer, path, key, mods) => {
      const accel = Gtk.accelerator_name(key, mods);
      updateShortcutRow(accel);
      this._settings.set_strv(settingKey, [accel]);
    });

    renderer.connect("accel-cleared", () => {
      updateShortcutRow(null);
      this._settings.set_strv(settingKey, []);
    });

    this._settings.connect("changed::" + settingKey, () => {
      updateShortcutRow(this._settings.get_strv(settingKey)[0]);
    });

    column.pack_start(renderer, true);
    column.add_attribute(renderer, "accel-key", COLUMN_KEY);
    column.add_attribute(renderer, "accel-mods", COLUMN_MODS);

    view.append_column(column);
    updateShortcutRow(this._settings.get_strv(settingKey)[0]);
  }

}
