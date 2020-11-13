/* ------------------------------------------------------------------------- */
// eslint configuration for this file
//

/* exported BaseIntegration */


/* ------------------------------------------------------------------------- */
// enforce strict mode
"use strict";


/* ------------------------------------------------------------------------- */
var BaseIntegration = class BaseIntegration {

  /* ....................................................................... */
  matches() {
    throw new Error("no implementation of 'matches' in " + this);
  }

  /* ....................................................................... */
  enable() {
    throw new Error("no implementation of 'enable' in " + this);
  }

  /* ....................................................................... */
  disable() {
    throw new Error("no implementation of 'disable' in " + this);
  }

  /* ....................................................................... */
  reload() {
    this.disable();
    this.enable();
  }

};
