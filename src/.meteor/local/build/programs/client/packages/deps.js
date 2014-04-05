//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
//                                                                      //
// If you are using Chrome, open the Developer Tools and click the gear //
// icon in its lower right corner. In the General Settings panel, turn  //
// on 'Enable source maps'.                                             //
//                                                                      //
// If you are using Firefox 23, go to `about:config` and set the        //
// `devtools.debugger.source-maps-enabled` preference to true.          //
// (The preference should be on by default in Firefox 24; versions      //
// older than 23 do not support source maps.)                           //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;

/* Package-scope variables */
var Deps;

(function () {

//////////////////////////////////////////////////////////////////////////////////
//                                                                              //
// packages/deps/deps.js                                                        //
//                                                                              //
//////////////////////////////////////////////////////////////////////////////////
                                                                                //
//////////////////////////////////////////////////                              // 1
// Package docs at http://docs.meteor.com/#deps //                              // 2
//////////////////////////////////////////////////                              // 3
                                                                                // 4
Deps = {};                                                                      // 5
                                                                                // 6
// http://docs.meteor.com/#deps_active                                          // 7
Deps.active = false;                                                            // 8
                                                                                // 9
// http://docs.meteor.com/#deps_currentcomputation                              // 10
Deps.currentComputation = null;                                                 // 11
                                                                                // 12
var setCurrentComputation = function (c) {                                      // 13
  Deps.currentComputation = c;                                                  // 14
  Deps.active = !! c;                                                           // 15
};                                                                              // 16
                                                                                // 17
var _debugFunc = function () {                                                  // 18
  // lazy evaluation because `Meteor` does not exist right away                 // 19
  return (typeof Meteor !== "undefined" ? Meteor._debug :                       // 20
          ((typeof console !== "undefined") && console.log ? console.log :      // 21
           function () {}));                                                    // 22
};                                                                              // 23
                                                                                // 24
var _throwOrLog = function (from, e) {                                          // 25
  if (throwFirstError) {                                                        // 26
    throw e;                                                                    // 27
  } else {                                                                      // 28
    _debugFunc()("Exception from Deps " + from + " function:",                  // 29
                 e.stack || e.message);                                         // 30
  }                                                                             // 31
};                                                                              // 32
                                                                                // 33
// Like `Meteor._noYieldsAllowed(function () { f(comp); })` but shorter,        // 34
// and doesn't clutter the stack with an extra frame on the client,             // 35
// where `_noYieldsAllowed` is a no-op.  `f` may be a computation               // 36
// function or an onInvalidate callback.                                        // 37
var callWithNoYieldsAllowed = function (f, comp) {                              // 38
  if (Meteor.isClient) {                                                        // 39
    f(comp);                                                                    // 40
  } else {                                                                      // 41
    Meteor._noYieldsAllowed(function () {                                       // 42
      f(comp);                                                                  // 43
    });                                                                         // 44
  }                                                                             // 45
};                                                                              // 46
                                                                                // 47
var nextId = 1;                                                                 // 48
// computations whose callbacks we should call at flush time                    // 49
var pendingComputations = [];                                                   // 50
// `true` if a Deps.flush is scheduled, or if we are in Deps.flush now          // 51
var willFlush = false;                                                          // 52
// `true` if we are in Deps.flush now                                           // 53
var inFlush = false;                                                            // 54
// `true` if we are computing a computation now, either first time              // 55
// or recompute.  This matches Deps.active unless we are inside                 // 56
// Deps.nonreactive, which nullfies currentComputation even though              // 57
// an enclosing computation may still be running.                               // 58
var inCompute = false;                                                          // 59
// `true` if the `_throwFirstError` option was passed in to the call            // 60
// to Deps.flush that we are in. When set, throw rather than log the            // 61
// first error encountered while flushing. Before throwing the error,           // 62
// finish flushing (from a catch block), logging any subsequent                 // 63
// errors.                                                                      // 64
var throwFirstError = false;                                                    // 65
                                                                                // 66
var afterFlushCallbacks = [];                                                   // 67
                                                                                // 68
var requireFlush = function () {                                                // 69
  if (! willFlush) {                                                            // 70
    setTimeout(Deps.flush, 0);                                                  // 71
    willFlush = true;                                                           // 72
  }                                                                             // 73
};                                                                              // 74
                                                                                // 75
// Deps.Computation constructor is visible but private                          // 76
// (throws an error if you try to call it)                                      // 77
var constructingComputation = false;                                            // 78
                                                                                // 79
//                                                                              // 80
// http://docs.meteor.com/#deps_computation                                     // 81
//                                                                              // 82
Deps.Computation = function (f, parent) {                                       // 83
  if (! constructingComputation)                                                // 84
    throw new Error(                                                            // 85
      "Deps.Computation constructor is private; use Deps.autorun");             // 86
  constructingComputation = false;                                              // 87
                                                                                // 88
  var self = this;                                                              // 89
                                                                                // 90
  // http://docs.meteor.com/#computation_stopped                                // 91
  self.stopped = false;                                                         // 92
                                                                                // 93
  // http://docs.meteor.com/#computation_invalidated                            // 94
  self.invalidated = false;                                                     // 95
                                                                                // 96
  // http://docs.meteor.com/#computation_firstrun                               // 97
  self.firstRun = true;                                                         // 98
                                                                                // 99
  self._id = nextId++;                                                          // 100
  self._onInvalidateCallbacks = [];                                             // 101
  // the plan is at some point to use the parent relation                       // 102
  // to constrain the order that computations are processed                     // 103
  self._parent = parent;                                                        // 104
  self._func = f;                                                               // 105
  self._recomputing = false;                                                    // 106
                                                                                // 107
  var errored = true;                                                           // 108
  try {                                                                         // 109
    self._compute();                                                            // 110
    errored = false;                                                            // 111
  } finally {                                                                   // 112
    self.firstRun = false;                                                      // 113
    if (errored)                                                                // 114
      self.stop();                                                              // 115
  }                                                                             // 116
};                                                                              // 117
                                                                                // 118
_.extend(Deps.Computation.prototype, {                                          // 119
                                                                                // 120
  // http://docs.meteor.com/#computation_oninvalidate                           // 121
  onInvalidate: function (f) {                                                  // 122
    var self = this;                                                            // 123
                                                                                // 124
    if (typeof f !== 'function')                                                // 125
      throw new Error("onInvalidate requires a function");                      // 126
                                                                                // 127
    if (self.invalidated) {                                                     // 128
      Deps.nonreactive(function () {                                            // 129
        callWithNoYieldsAllowed(f, self);                                       // 130
      });                                                                       // 131
    } else {                                                                    // 132
      self._onInvalidateCallbacks.push(f);                                      // 133
    }                                                                           // 134
  },                                                                            // 135
                                                                                // 136
  // http://docs.meteor.com/#computation_invalidate                             // 137
  invalidate: function () {                                                     // 138
    var self = this;                                                            // 139
    if (! self.invalidated) {                                                   // 140
      // if we're currently in _recompute(), don't enqueue                      // 141
      // ourselves, since we'll rerun immediately anyway.                       // 142
      if (! self._recomputing && ! self.stopped) {                              // 143
        requireFlush();                                                         // 144
        pendingComputations.push(this);                                         // 145
      }                                                                         // 146
                                                                                // 147
      self.invalidated = true;                                                  // 148
                                                                                // 149
      // callbacks can't add callbacks, because                                 // 150
      // self.invalidated === true.                                             // 151
      for(var i = 0, f; f = self._onInvalidateCallbacks[i]; i++) {              // 152
        Deps.nonreactive(function () {                                          // 153
          callWithNoYieldsAllowed(f, self);                                     // 154
        });                                                                     // 155
      }                                                                         // 156
      self._onInvalidateCallbacks = [];                                         // 157
    }                                                                           // 158
  },                                                                            // 159
                                                                                // 160
  // http://docs.meteor.com/#computation_stop                                   // 161
  stop: function () {                                                           // 162
    if (! this.stopped) {                                                       // 163
      this.stopped = true;                                                      // 164
      this.invalidate();                                                        // 165
    }                                                                           // 166
  },                                                                            // 167
                                                                                // 168
  _compute: function () {                                                       // 169
    var self = this;                                                            // 170
    self.invalidated = false;                                                   // 171
                                                                                // 172
    var previous = Deps.currentComputation;                                     // 173
    setCurrentComputation(self);                                                // 174
    var previousInCompute = inCompute;                                          // 175
    inCompute = true;                                                           // 176
    try {                                                                       // 177
      callWithNoYieldsAllowed(self._func, self);                                // 178
    } finally {                                                                 // 179
      setCurrentComputation(previous);                                          // 180
      inCompute = false;                                                        // 181
    }                                                                           // 182
  },                                                                            // 183
                                                                                // 184
  _recompute: function () {                                                     // 185
    var self = this;                                                            // 186
                                                                                // 187
    self._recomputing = true;                                                   // 188
    try {                                                                       // 189
      while (self.invalidated && ! self.stopped) {                              // 190
        try {                                                                   // 191
          self._compute();                                                      // 192
        } catch (e) {                                                           // 193
          _throwOrLog("recompute", e);                                          // 194
        }                                                                       // 195
        // If _compute() invalidated us, we run again immediately.              // 196
        // A computation that invalidates itself indefinitely is an             // 197
        // infinite loop, of course.                                            // 198
        //                                                                      // 199
        // We could put an iteration counter here and catch run-away            // 200
        // loops.                                                               // 201
      }                                                                         // 202
    } finally {                                                                 // 203
      self._recomputing = false;                                                // 204
    }                                                                           // 205
  }                                                                             // 206
});                                                                             // 207
                                                                                // 208
//                                                                              // 209
// http://docs.meteor.com/#deps_dependency                                      // 210
//                                                                              // 211
Deps.Dependency = function () {                                                 // 212
  this._dependentsById = {};                                                    // 213
};                                                                              // 214
                                                                                // 215
_.extend(Deps.Dependency.prototype, {                                           // 216
  // http://docs.meteor.com/#dependency_depend                                  // 217
  //                                                                            // 218
  // Adds `computation` to this set if it is not already                        // 219
  // present.  Returns true if `computation` is a new member of the set.        // 220
  // If no argument, defaults to currentComputation, or does nothing            // 221
  // if there is no currentComputation.                                         // 222
  depend: function (computation) {                                              // 223
    if (! computation) {                                                        // 224
      if (! Deps.active)                                                        // 225
        return false;                                                           // 226
                                                                                // 227
      computation = Deps.currentComputation;                                    // 228
    }                                                                           // 229
    var self = this;                                                            // 230
    var id = computation._id;                                                   // 231
    if (! (id in self._dependentsById)) {                                       // 232
      self._dependentsById[id] = computation;                                   // 233
      computation.onInvalidate(function () {                                    // 234
        delete self._dependentsById[id];                                        // 235
      });                                                                       // 236
      return true;                                                              // 237
    }                                                                           // 238
    return false;                                                               // 239
  },                                                                            // 240
                                                                                // 241
  // http://docs.meteor.com/#dependency_changed                                 // 242
  changed: function () {                                                        // 243
    var self = this;                                                            // 244
    for (var id in self._dependentsById)                                        // 245
      self._dependentsById[id].invalidate();                                    // 246
  },                                                                            // 247
                                                                                // 248
  // http://docs.meteor.com/#dependency_hasdependents                           // 249
  hasDependents: function () {                                                  // 250
    var self = this;                                                            // 251
    for(var id in self._dependentsById)                                         // 252
      return true;                                                              // 253
    return false;                                                               // 254
  }                                                                             // 255
});                                                                             // 256
                                                                                // 257
_.extend(Deps, {                                                                // 258
  // http://docs.meteor.com/#deps_flush                                         // 259
  flush: function (_opts) {                                                     // 260
    // XXX What part of the comment below is still true? (We no longer          // 261
    // have Spark)                                                              // 262
    //                                                                          // 263
    // Nested flush could plausibly happen if, say, a flush causes              // 264
    // DOM mutation, which causes a "blur" event, which runs an                 // 265
    // app event handler that calls Deps.flush.  At the moment                  // 266
    // Spark blocks event handlers during DOM mutation anyway,                  // 267
    // because the LiveRange tree isn't valid.  And we don't have               // 268
    // any useful notion of a nested flush.                                     // 269
    //                                                                          // 270
    // https://app.asana.com/0/159908330244/385138233856                        // 271
    if (inFlush)                                                                // 272
      throw new Error("Can't call Deps.flush while flushing");                  // 273
                                                                                // 274
    if (inCompute)                                                              // 275
      throw new Error("Can't flush inside Deps.autorun");                       // 276
                                                                                // 277
    inFlush = true;                                                             // 278
    willFlush = true;                                                           // 279
    throwFirstError = !! (_opts && _opts._throwFirstError);                     // 280
                                                                                // 281
    try {                                                                       // 282
      while (pendingComputations.length ||                                      // 283
             afterFlushCallbacks.length) {                                      // 284
                                                                                // 285
        // recompute all pending computations                                   // 286
        while (pendingComputations.length) {                                    // 287
          var comp = pendingComputations.shift();                               // 288
          comp._recompute();                                                    // 289
        }                                                                       // 290
                                                                                // 291
        if (afterFlushCallbacks.length) {                                       // 292
          // call one afterFlush callback, which may                            // 293
          // invalidate more computations                                       // 294
          var func = afterFlushCallbacks.shift();                               // 295
          try {                                                                 // 296
            func();                                                             // 297
          } catch (e) {                                                         // 298
            _throwOrLog("afterFlush function", e);                              // 299
          }                                                                     // 300
        }                                                                       // 301
      }                                                                         // 302
    } catch (e) {                                                               // 303
      inFlush = false; // needed before calling `Deps.flush()` again            // 304
      Deps.flush({_throwFirstError: false}); // finish flushing                 // 305
      throw e;                                                                  // 306
    } finally {                                                                 // 307
      willFlush = false;                                                        // 308
      inFlush = false;                                                          // 309
    }                                                                           // 310
  },                                                                            // 311
                                                                                // 312
  // http://docs.meteor.com/#deps_autorun                                       // 313
  //                                                                            // 314
  // Run f(). Record its dependencies. Rerun it whenever the                    // 315
  // dependencies change.                                                       // 316
  //                                                                            // 317
  // Returns a new Computation, which is also passed to f.                      // 318
  //                                                                            // 319
  // Links the computation to the current computation                           // 320
  // so that it is stopped if the current computation is invalidated.           // 321
  autorun: function (f) {                                                       // 322
    if (typeof f !== 'function')                                                // 323
      throw new Error('Deps.autorun requires a function argument');             // 324
                                                                                // 325
    constructingComputation = true;                                             // 326
    var c = new Deps.Computation(f, Deps.currentComputation);                   // 327
                                                                                // 328
    if (Deps.active)                                                            // 329
      Deps.onInvalidate(function () {                                           // 330
        c.stop();                                                               // 331
      });                                                                       // 332
                                                                                // 333
    return c;                                                                   // 334
  },                                                                            // 335
                                                                                // 336
  // http://docs.meteor.com/#deps_nonreactive                                   // 337
  //                                                                            // 338
  // Run `f` with no current computation, returning the return value            // 339
  // of `f`.  Used to turn off reactivity for the duration of `f`,              // 340
  // so that reactive data sources accessed by `f` will not result in any       // 341
  // computations being invalidated.                                            // 342
  nonreactive: function (f) {                                                   // 343
    var previous = Deps.currentComputation;                                     // 344
    setCurrentComputation(null);                                                // 345
    try {                                                                       // 346
      return f();                                                               // 347
    } finally {                                                                 // 348
      setCurrentComputation(previous);                                          // 349
    }                                                                           // 350
  },                                                                            // 351
                                                                                // 352
  // http://docs.meteor.com/#deps_oninvalidate                                  // 353
  onInvalidate: function (f) {                                                  // 354
    if (! Deps.active)                                                          // 355
      throw new Error("Deps.onInvalidate requires a currentComputation");       // 356
                                                                                // 357
    Deps.currentComputation.onInvalidate(f);                                    // 358
  },                                                                            // 359
                                                                                // 360
  // http://docs.meteor.com/#deps_afterflush                                    // 361
  afterFlush: function (f) {                                                    // 362
    afterFlushCallbacks.push(f);                                                // 363
    requireFlush();                                                             // 364
  }                                                                             // 365
});                                                                             // 366
                                                                                // 367
//////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////
//                                                                              //
// packages/deps/deprecated.js                                                  //
//                                                                              //
//////////////////////////////////////////////////////////////////////////////////
                                                                                //
// Deprecated (Deps-recated?) functions.                                        // 1
                                                                                // 2
// These functions used to be on the Meteor object (and worked slightly         // 3
// differently).                                                                // 4
// XXX COMPAT WITH 0.5.7                                                        // 5
Meteor.flush = Deps.flush;                                                      // 6
Meteor.autorun = Deps.autorun;                                                  // 7
                                                                                // 8
// We used to require a special "autosubscribe" call to reactively subscribe to // 9
// things. Now, it works with autorun.                                          // 10
// XXX COMPAT WITH 0.5.4                                                        // 11
Meteor.autosubscribe = Deps.autorun;                                            // 12
                                                                                // 13
// This Deps API briefly existed in 0.5.8 and 0.5.9                             // 14
// XXX COMPAT WITH 0.5.9                                                        // 15
Deps.depend = function (d) {                                                    // 16
  return d.depend();                                                            // 17
};                                                                              // 18
                                                                                // 19
//////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.deps = {
  Deps: Deps
};

})();

//# sourceMappingURL=7afb832ce6e6c89421fa70dc066201f16f9b9105.map
