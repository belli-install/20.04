// ------------------------------------------------------------------------- //
// eslint configuration for this file
//

/* global imports */
/* global window */

/* exported InjectionsRegistry */
/* exported Logger */
/* exported SignalsRegistry */
/* exported rotateArray */
/* exported swapArrayElements */


// ------------------------------------------------------------------------- //
// enforce strict mode
"use strict";


// ------------------------------------------------------------------------- //
// system libraries imports
const Lang = imports.lang;


// ------------------------------------------------------------------------- //
var Logger = class Logger {

  // ....................................................................... //
  constructor(moduleName) {
    this.applicationName = "[overview-improved]";
    this.moduleName = moduleName;
  }

  // ....................................................................... //
  debug(message) {
    if (window.overviewImproved.debug === true) {
      let msg = `[${this.applicationName}] > ${this.moduleName}: ${message}`;
      window.log(msg);
    }
  }

};



// ------------------------------------------------------------------------- //
// borrowed from dash-to-dock
/**
 * Simplify global signals and function injections handling
 * abstract class
 */
const BasicRegistry = new Lang.Class({
  Name: "OverviewImproved.BasicRegistry",

  /* ....................................................................... */
  // todo: constructor?
  _init: function() {
    this._storage = new Object();
  },

  /* ....................................................................... */
  add: function(/* unlimited 3-long array arguments */) {
    // Convert arguments object to array, concatenate with generic
    let args = Array.concat("generic", Array.slice(arguments));
    // Call addWithLabel with ags as if they were passed arguments
    this.addWithLabel.apply(this, args);
  },

  /* ....................................................................... */
  destroy: function() {
    for (let label in this._storage) {
      this.removeWithLabel(label);
    }
  },

  /* ....................................................................... */
  addWithLabel: function(label /* plus unlimited 3-long array arguments*/) {
    if (this._storage[label] == undefined) {
      this._storage[label] = new Array();
    }

    // Skip first element of the arguments
    for (let i = 1; i < arguments.length; i++) {
      let item = this._storage[label];
      item.push(this._create(arguments[i]));
    }
  },

  /* ....................................................................... */
  removeWithLabel: function(label) {
    if (this._storage[label]) {
      for (let i = 0; i < this._storage[label].length; i++) {
        this._remove(this._storage[label][i]);
      }

      delete this._storage[label];
    }
  },

  // Virtual methods to be implemented by subclass

  /* ....................................................................... */
  /**
   * Create single element to be stored in the storage structure
   */
  _create: function(/* item */) {
    throw new Error("no implementation of _create in " + this);
  },

  /* ....................................................................... */
  /**
   * Correctly delete single element
   */
  _remove: function(/* item */) {
    throw new Error("no implementation of _remove in " + this);
  }
});


// ------------------------------------------------------------------------- //
// borrowed from dash-to-dock
/**
 * Manage global signals
 */
var SignalsRegistry = new Lang.Class({
  Name: "OverviewImproved.SignalRegistry",
  Extends: BasicRegistry,

  /* ....................................................................... */
  _create: function(item) {
    let object = item[0];
    let event = item[1];
    let callback = item[2];
    let id = object.connect(event, callback);

    return [object, id];
  },

  /* ....................................................................... */
  _remove: function(item) {
    // some sort of bug when instance is null, tried checking item[0] and
    // item[1] for null to no effect, also loggin seems to be broken
    // so just bury the error for now.
    // Causes major breakage after lock/suspecd
    try {
      item[0].disconnect(item[1]);
    }
    catch (e) {
      /* continue regardless of error */
    }
  }
});


// ------------------------------------------------------------------------- //
// borrowed from dash-to-dock
/**
 * Manage function injection: both instances and prototype can be overridden
 * and restored
 */
var InjectionsRegistry = class InjectionsRegistry extends BasicRegistry {

  /* ....................................................................... */
  _create(item) {
    let object = item[0];
    let name = item[1];
    let injectedFunction = item[2];
    let original = object[name];

    object[name] = injectedFunction;
    return [object, name, injectedFunction, original];
  }

  /* ....................................................................... */
  _remove(item) {
    let object = item[0];
    let name = item[1];
    let original = item[3];
    object[name] = original;
  }
};


// ------------------------------------------------------------------------- //
var rotateArray = function rotateArray (array, n) {
  return array.slice(n, array.length).concat(array.slice(0, n));
};


// ------------------------------------------------------------------------- //
var swapArrayElements = function swapArrayElements (array, index1, index2) {
  let cloneArray = [...array];
  cloneArray[index1] = array[index2];
  cloneArray[index2] = array[index1];
  return cloneArray;
};
