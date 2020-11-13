/* ------------------------------------------------------------------------- */
// eslint configuration for this file
//

/* global global */
/* global imports */
/* global _ */

/* exported WindowSearch */


/* ------------------------------------------------------------------------- */
// enforce strict mode
"use strict";


/* ------------------------------------------------------------------------- */
// library imports
const Clutter = imports.gi.Clutter;
const St = imports.gi.St;


/* ------------------------------------------------------------------------- */
// gnome shell imports
const gsExtensionUtils = imports.misc.extensionUtils;
const gsMain = imports.ui.main;
const gsViewSelector = imports.ui.viewSelector;


/* ------------------------------------------------------------------------- */
// extension imports
const Extension = gsExtensionUtils.getCurrentExtension();
const Compat = Extension.imports.lib.compat;


/* ------------------------------------------------------------------------- */
var WindowSearch = class WindowSearch {

  /* ....................................................................... */
  constructor() {

    this.wmClass = null;
    this.titleSearchTerms = "";

    this._titleSearchActive = false;

    this._searchWindowsEntry = null;
    this._searchWindowsEntryBin = null;

  }

  /* ....................................................................... */
  addToOverview() {
    // create ui elements
    this._addWindowSearchEntryToOverview();

    let overviewSearchElement = Compat.overviewSearchElement();

    // add it to overview, inserting it below application overview search bin
    gsMain.overview._overview.insert_child_below(
      this._searchWindowsEntryBin,
      overviewSearchElement
    );

  }

  /* ....................................................................... */
  destroy() {
    // remove search entry bin from overview
    gsMain.overview._overview.remove_actor(this._searchWindowsEntryBin);

    // destroy entry and entry bin
    this._searchWindowsEntry.destroy();
    this._searchWindowsEntryBin.destroy();

    // null out the elements
    this._searchWindowsEntry = null;
    this._searchWindowsEntryBin = null;
    this._windowSearchFocusTrap = null;

    this.wmClass = null;
    this.titleSearchTerms = "";

  }

  /* ....................................................................... */
  isEntryVisible() {
    return this._searchWindowsEntryBin.visible;
  }


  /* ....................................................................... */
  showEntry() {
    this._searchWindowsEntryBin.show();
  }

  /* ....................................................................... */
  hideEntry() {
    this._searchWindowsEntryBin.hide();
  }

  /* ....................................................................... */
  resetTitleSearch() {
    // Don't drop the key focus on Clutter's side if anything but the
    // overview has pushed a modal (e.g. system modals when activated using
    // the overview).
    if (gsMain.modalCount <= 1) {
      global.stage.set_key_focus(null);
    }

    this.titleSearchTerms = "";
    this._searchWindowsEntry.text = "";

    // deselelect any text
    this._searchWindowsEntry.clutter_text.set_cursor_visible(true);
    this._searchWindowsEntry.clutter_text.set_selection(0, 0);

  }

  /* ....................................................................... */
  startTitleSearch(event) {
    global.stage.set_key_focus(this._searchWindowsEntry.clutter_text);

    let synthEvent = event.copy();
    synthEvent.set_source(this._searchWindowsEntry.clutter_text);
    this._searchWindowsEntry.clutter_text.event(synthEvent, false);
  }

  /* ....................................................................... */
  addFocusTrapToWorkspacesDisplay() {

    let workspaceDisplay = gsMain.overview.viewSelector._workspacesDisplay;

    // Since the entry isn't inside the results container we install this
    // // dummy widget as the last results container child so that we can
    // // include the entry in the keynav tab path
    this._windowSearchFocusTrap = new gsViewSelector.FocusTrap(
      {
        can_focus: true,
      }
    );
    this._windowSearchFocusTrap.connect("key-focus-in", () => {
      this._searchWindowsEntry.grab_key_focus();
    });

    // get workspace view actor
    let workspaceViewActor = Compat.workspaceViewActor(
      workspaceDisplay._workspacesViews[workspaceDisplay._primaryIndex]
    );

    // add window search trap
    workspaceViewActor.add_actor(
      this._windowSearchFocusTrap
    );

  }

  /* ....................................................................... */
  _addWindowSearchEntryToOverview() {
    // create entry box
    this._searchWindowsEntry = new St.Entry(
      {
        style_class: "search-entry",
        hint_text: _("Type to search windows…"),
        track_hover: true,
        can_focus: true
      }
    );

    // add primary "window" looking icon to distinguish for application search
    this._searchWindowsEntry.set_primary_icon(
      new St.Icon(
        {
          style_class: "search-entry-icon",
          icon_name: "focus-windows-symbolic"
        }
      )
    );

    this._searchWindowsEntry.set_secondary_icon(
      new St.Icon(
        {
          style_class: "search-entry-icon",
          icon_name: "edit-clear-symbolic"
        }
      )
    );

    this._searchWindowsEntry.connect(
      "secondary-icon-clicked",
      this.resetTitleSearch.bind(this)
    );

    this._searchWindowsEntry.get_secondary_icon().hide();

    // create bin to contain the entry box
    this._searchWindowsEntryBin = new St.Bin(
      {
        child: this._searchWindowsEntry,
        x_align: Compat.elementCenterAlign()
      }
    );

    // todo: use signals registry
    this._searchWindowsEntry.clutter_text.connect(
      "text-changed",
      this._onSearchWindowsTextChanged.bind(this)
    );

    this._searchWindowsEntry.clutter_text.connect(
      "key-press-event",
      this._onSearchWindowsKeyPress.bind(this)
    );

    // hide the bit by default
    this._searchWindowsEntryBin.hide();

  }

  /* ....................................................................... */
  _onSearchWindowsTextChanged() {

    // get the search terms (for now just the sting)
    let terms = this._searchWindowsEntry.text;
    this._titleSearchActive = (terms.length > 0);

    // set titleSearchTerms
    if (terms.length === 0) {
      this.titleSearchTerms = "";
      this._searchWindowsEntry.get_secondary_icon().hide();
    }
    else {
      this.titleSearchTerms = terms;
      this._searchWindowsEntry.get_secondary_icon().show();
    }

    // rebuild workspace display
    this._rebuildWorkspaceDisplay();

  }

  /* ....................................................................... */
  _rebuildWorkspaceDisplay() {

    let workspaceDisplay = gsMain.overview.viewSelector._workspacesDisplay;

    // recreate workspace views
    workspaceDisplay._updateWorkspacesViews();

    // update all the actors on each workspace
    for (let workspaceView of workspaceDisplay._workspacesViews) {
      // ExtraWorkspaceView does not have _updateWorkspaceActors, we will be
      // ducktype checkign here instead of instanceof in case of some other
      // workspaces exists which do not implement _workspacesViews
      // (prolly from other extensions)
      if (workspaceView._updateWorkspaceActors !== undefined) {
        workspaceView._updateWorkspaceActors(false);
      }
    }

  }

  /* ....................................................................... */
  _onSearchWindowsKeyPress(entry, event) {
    let workspaceDisplay = gsMain.overview.viewSelector._workspacesDisplay;

    let symbol = event.get_key_symbol();

    if (symbol == Clutter.KEY_Escape) {
      if (this._isTextSearchActivated()) {
        this.resetTitleSearch();
        return Clutter.EVENT_STOP;
      }
    }
    else {
      let arrowNext, nextDirection;
      let navigateFocus = Compat.workspaceDisplayNavigateFocus();

      if (entry.get_text_direction() == Clutter.TextDirection.RTL) {
        arrowNext = Clutter.Left;
        nextDirection = Compat.DirectionType.LEFT;
      } else {
        arrowNext = Clutter.Right;
        nextDirection = Compat.DirectionType.RIGHT;
      }

      if (symbol == Clutter.KEY_Tab) {
        navigateFocus(
          null,
          Compat.DirectionType.TAB_FORWARD
        );
        return Clutter.EVENT_STOP;

      } else if (symbol == Compat.Clutter_KEY_ISO_Left_Tab()) {
        workspaceDisplay._windowSearchFocusTrap.can_focus = false;
        navigateFocus(
          null,
          Compat.DirectionType.TAB_BACKWARD
        );
        workspaceDisplay._windowSearchFocusTrap.can_focus = true;
        return Clutter.EVENT_STOP;

      } else if (symbol == Clutter.KEY_Down) {
        navigateFocus(
          null,
          Compat.DirectionType.DOWN
        );
        return Clutter.EVENT_STOP;

      } else if (symbol == arrowNext &&
          this._searchWindowsEntry.clutter_text.position == -1) {

        navigateFocus(
          null,
          nextDirection
        );
        return Clutter.EVENT_STOP;

      } else if (symbol == Clutter.KEY_Return ||
        symbol == Clutter.KEY_KP_Enter) {

        // hide overview (hence picking the selected window)
        gsMain.overview.hide();
        return Clutter.EVENT_STOP;
      }
      else {
        return Clutter.EVENT_PROPAGATE;
      }
    }

  }

  /* ....................................................................... */
  _isTextSearchActivated() {
    // the entry does not show the hint
    return this._searchWindowsEntry.clutter_text.text ===
      this._searchWindowsEntry.get_text();
  }


  /* ....................................................................... */
  _runSearch(entry, event) {
    // Ignore events while anything but the overview has
    // pushed a modal (system modals, looking glass, ...)
    if (gsMain.modalCount > 1) {
      return Clutter.EVENT_PROPAGATE;
    }

    let symbol = event.get_key_symbol();
    let navigateFocus = Compat.workspaceDisplayNavigateFocus();

    if (symbol == Clutter.KEY_Escape) {
      if (this._titleSearchActive === true) {
        this.resetTitleSearch();
      }
      else {
        gsMain.overview.hide();
      }
      return Clutter.EVENT_STOP;
    } else if (this._shouldTriggerWindowSearch(symbol)) {
      this.startTitleSearch(event);
    } else if (!this._titleSearchActive && !global.stage.key_focus) {
      if (symbol == Clutter.KEY_Tab || symbol == Clutter.KEY_Down) {
        navigateFocus(
          null,
          Compat.DirectionType.TAB_FORWARD
        );
        return Clutter.EVENT_STOP;
      } else if (symbol == Compat.Clutter_KEY_ISO_Left_Tab()) {
        navigateFocus(
          null,
          Compat.DirectionType.TAB_BACKWARD
        );
        return Clutter.EVENT_STOP;
      }
    }
    return Clutter.EVENT_PROPAGATE;
  }

  /* ....................................................................... */
  _shouldTriggerWindowSearch(symbol) {

    if (symbol == Clutter.KEY_Multi_key) {
      return true;
    }

    if (symbol == Clutter.KEY_BackSpace && this._titleSearchActive) {
      return true;
    }

    let unicode = Clutter.keysym_to_unicode(symbol);
    if (unicode == 0) {
      return false;
    }

    // todo: fix this, handles empty space
    // if (getTermsForSearchString(String.fromCharCode(unicode)).length > 0) {
    //   return true;
    // }

    if (String.fromCharCode(unicode).length > 0) {
      return true;
    }

    return false;
  }


};
