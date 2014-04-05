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
var $ = Package.jquery.$;
var jQuery = Package.jquery.jQuery;
var Deps = Package.deps.Deps;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var _ = Package.underscore._;
var OrderedDict = Package['ordered-dict'].OrderedDict;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var ObserveSequence = Package['observe-sequence'].ObserveSequence;
var HTML = Package.htmljs.HTML;

/* Package-scope variables */
var UI, Handlebars, reportUIException, _extend, Component, findComponentWithProp, findComponentWithHelper, getComponentData, updateTemplateInstance, AttributeHandler, makeAttributeHandler;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
// packages/ui/exceptions.js                                                                            //
//                                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                        //
                                                                                                        // 1
var debugFunc;                                                                                          // 2
                                                                                                        // 3
// Meteor UI calls into user code in many places, and it's nice to catch exceptions                     // 4
// propagated from user code immediately so that the whole system doesn't just                          // 5
// break.  Catching exceptions is easy; reporting them is hard.  This helper                            // 6
// reports exceptions.                                                                                  // 7
//                                                                                                      // 8
// Usage:                                                                                               // 9
//                                                                                                      // 10
// ```                                                                                                  // 11
// try {                                                                                                // 12
//   // ... someStuff ...                                                                               // 13
// } catch (e) {                                                                                        // 14
//   reportUIException(e);                                                                              // 15
// }                                                                                                    // 16
// ```                                                                                                  // 17
//                                                                                                      // 18
// An optional second argument overrides the default message.                                           // 19
                                                                                                        // 20
reportUIException = function (e, msg) {                                                                 // 21
  if (! debugFunc)                                                                                      // 22
    // adapted from Deps                                                                                // 23
    debugFunc = function () {                                                                           // 24
      return (typeof Meteor !== "undefined" ? Meteor._debug :                                           // 25
              ((typeof console !== "undefined") && console.log ? console.log :                          // 26
               function () {}));                                                                        // 27
    };                                                                                                  // 28
                                                                                                        // 29
  // In Chrome, `e.stack` is a multiline string that starts with the message                            // 30
  // and contains a stack trace.  Furthermore, `console.log` makes it clickable.                        // 31
  // `console.log` supplies the space between the two arguments.                                        // 32
  debugFunc()(msg || 'Exception in Meteor UI:', e.stack || e.message);                                  // 33
};                                                                                                      // 34
                                                                                                        // 35
//////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
// packages/ui/base.js                                                                                  //
//                                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                        //
UI = {};                                                                                                // 1
                                                                                                        // 2
// A very basic operation like Underscore's `_.extend` that                                             // 3
// copies `src`'s own, enumerable properties onto `tgt` and                                             // 4
// returns `tgt`.                                                                                       // 5
_extend = function (tgt, src) {                                                                         // 6
  for (var k in src)                                                                                    // 7
    if (src.hasOwnProperty(k))                                                                          // 8
      tgt[k] = src[k];                                                                                  // 9
  return tgt;                                                                                           // 10
};                                                                                                      // 11
                                                                                                        // 12
// Defines a single non-enumerable, read-only property                                                  // 13
// on `tgt`.                                                                                            // 14
// It won't be non-enumerable in IE 8, so its                                                           // 15
// non-enumerability can't be relied on for logic                                                       // 16
// purposes, it just makes things prettier in                                                           // 17
// the dev console.                                                                                     // 18
var _defineNonEnum = function (tgt, name, value) {                                                      // 19
  try {                                                                                                 // 20
    Object.defineProperty(tgt, name, {value: value});                                                   // 21
  } catch (e) {                                                                                         // 22
    // IE < 9                                                                                           // 23
    tgt[name] = value;                                                                                  // 24
  }                                                                                                     // 25
  return tgt;                                                                                           // 26
};                                                                                                      // 27
                                                                                                        // 28
// Named function (like `function Component() {}` below) make                                           // 29
// inspection in debuggers more descriptive. In IE, this sets the                                       // 30
// value of the `Component` var in the function scope in which it's                                     // 31
// executed. We already have a top-level `Component` var so we create                                   // 32
// a new function scope to not write it over in IE.                                                     // 33
(function () {                                                                                          // 34
                                                                                                        // 35
  // Components and Component kinds are the same thing, just                                            // 36
  // objects; there are no constructor functions, no `new`,                                             // 37
  // and no `instanceof`.  A Component object is like a class,                                          // 38
  // until it is inited, at which point it becomes more like                                            // 39
  // an instance.                                                                                       // 40
  //                                                                                                    // 41
  // `y = x.extend({ ...new props })` creates a new Component                                           // 42
  // `y` with `x` as its prototype, plus additional properties                                          // 43
  // on `y` itself.  `extend` is used both to subclass and to                                           // 44
  // create instances (and the hope is we can gloss over the                                            // 45
  // difference in the docs).                                                                           // 46
  UI.Component = (function (constr) {                                                                   // 47
                                                                                                        // 48
    // Make sure the "class name" that Chrome infers for                                                // 49
    // UI.Component is "Component", and that                                                            // 50
    // `new UI.Component._constr` (which is what `extend`                                               // 51
    // does) also produces objects whose inferred class                                                 // 52
    // name is "Component".  Chrome's name inference rules                                              // 53
    // are a little mysterious, but a function name in                                                  // 54
    // the source code (as in `function Component() {}`)                                                // 55
    // seems to be reliable and high precedence.                                                        // 56
    var C = new constr;                                                                                 // 57
    _defineNonEnum(C, '_constr', constr);                                                               // 58
    _defineNonEnum(C, '_super', null);                                                                  // 59
    return C;                                                                                           // 60
  })(function Component() {});                                                                          // 61
})();                                                                                                   // 62
                                                                                                        // 63
_extend(UI, {                                                                                           // 64
  nextGuid: 2, // Component is 1!                                                                       // 65
                                                                                                        // 66
  isComponent: function (obj) {                                                                         // 67
    return obj && UI.isKindOf(obj, UI.Component);                                                       // 68
  },                                                                                                    // 69
  // `UI.isKindOf(a, b)` where `a` and `b` are Components                                               // 70
  // (or kinds) asks if `a` is or descends from                                                         // 71
  // (transitively extends) `b`.                                                                        // 72
  isKindOf: function (a, b) {                                                                           // 73
    while (a) {                                                                                         // 74
      if (a === b)                                                                                      // 75
        return true;                                                                                    // 76
      a = a._super;                                                                                     // 77
    }                                                                                                   // 78
    return false;                                                                                       // 79
  },                                                                                                    // 80
  // use these to produce error messages for developers                                                 // 81
  // (though throwing a more specific error message is                                                  // 82
  // even better)                                                                                       // 83
  _requireNotDestroyed: function (c) {                                                                  // 84
    if (c.isDestroyed)                                                                                  // 85
      throw new Error("Component has been destroyed; can't perform this operation");                    // 86
  },                                                                                                    // 87
  _requireInited: function (c) {                                                                        // 88
    if (! c.isInited)                                                                                   // 89
      throw new Error("Component must be inited to perform this operation");                            // 90
  },                                                                                                    // 91
  _requireDom: function (c) {                                                                           // 92
    if (! c.dom)                                                                                        // 93
      throw new Error("Component must be built into DOM to perform this operation");                    // 94
  }                                                                                                     // 95
});                                                                                                     // 96
                                                                                                        // 97
Component = UI.Component;                                                                               // 98
                                                                                                        // 99
_extend(UI.Component, {                                                                                 // 100
  kind: "Component",                                                                                    // 101
  guid: "1",                                                                                            // 102
  dom: null,                                                                                            // 103
  // Has this Component ever been inited?                                                               // 104
  isInited: false,                                                                                      // 105
  // Has this Component been destroyed?  Only inited Components                                         // 106
  // can be destroyed.                                                                                  // 107
  isDestroyed: false,                                                                                   // 108
  // Component that created this component (typically also                                              // 109
  // the DOM containment parent).                                                                       // 110
  // No child pointers (except in `dom`).                                                               // 111
  parent: null,                                                                                         // 112
                                                                                                        // 113
  // create a new subkind or instance whose proto pointer                                               // 114
  // points to this, with additional props set.                                                         // 115
  extend: function (props) {                                                                            // 116
    // this function should never cause `props` to be                                                   // 117
    // mutated in case people want to reuse `props` objects                                             // 118
    // in a mixin-like way.                                                                             // 119
                                                                                                        // 120
    if (this.isInited)                                                                                  // 121
      // Disallow extending inited Components so that                                                   // 122
      // inited Components don't inherit instance-specific                                              // 123
      // properties from other inited Components, just                                                  // 124
      // default values.                                                                                // 125
      throw new Error("Can't extend an inited Component");                                              // 126
                                                                                                        // 127
    var constr;                                                                                         // 128
    var constrMade = false;                                                                             // 129
    if (props && props.kind) {                                                                          // 130
      // If `kind` is different from super, set a constructor.                                          // 131
      // We used to set the function name here so that components                                       // 132
      // printed better in the console, but we took it out because                                      // 133
      // of CSP (and in hopes that Chrome finally adds proper                                           // 134
      // displayName support).                                                                          // 135
      constr = function () {};                                                                          // 136
      constrMade = true;                                                                                // 137
    } else {                                                                                            // 138
      constr = this._constr;                                                                            // 139
    }                                                                                                   // 140
                                                                                                        // 141
    // We don't know where we're getting `constr` from --                                               // 142
    // it might be from some supertype -- just that it has                                              // 143
    // the right function name.  So set the `prototype`                                                 // 144
    // property each time we use it as a constructor.                                                   // 145
    constr.prototype = this;                                                                            // 146
                                                                                                        // 147
    var c = new constr;                                                                                 // 148
    if (constrMade)                                                                                     // 149
      c._constr = constr;                                                                               // 150
                                                                                                        // 151
    if (props)                                                                                          // 152
      _extend(c, props);                                                                                // 153
                                                                                                        // 154
    // for efficient Component instantiations, we assign                                                // 155
    // as few things as possible here.                                                                  // 156
    _defineNonEnum(c, '_super', this);                                                                  // 157
    c.guid = String(UI.nextGuid++);                                                                     // 158
                                                                                                        // 159
    return c;                                                                                           // 160
  }                                                                                                     // 161
});                                                                                                     // 162
                                                                                                        // 163
//callChainedCallback = function (comp, propName, orig) {                                               // 164
  // Call `comp.foo`, `comp._super.foo`,                                                                // 165
  // `comp._super._super.foo`, and so on, but in reverse                                                // 166
  // order, and only if `foo` is an "own property" in each                                              // 167
  // case.  Furthermore, the passed value of `this` should                                              // 168
  // remain `comp` for all calls (which is achieved by                                                  // 169
  // filling in `orig` when recursing).                                                                 // 170
//  if (comp._super)                                                                                    // 171
//    callChainedCallback(comp._super, propName, orig || comp);                                         // 172
//                                                                                                      // 173
//  if (comp.hasOwnProperty(propName))                                                                  // 174
//    comp[propName].call(orig || comp);                                                                // 175
//};                                                                                                    // 176
                                                                                                        // 177
                                                                                                        // 178
// Returns 0 if the nodes are the same or either one contains the other;                                // 179
// otherwise, -1 if a comes before b, or else 1 if b comes before a in                                  // 180
// document order.                                                                                      // 181
// Requires: `a` and `b` are element nodes in the same document tree.                                   // 182
var compareElementIndex = function (a, b) {                                                             // 183
  // See http://ejohn.org/blog/comparing-document-position/                                             // 184
  if (a === b)                                                                                          // 185
    return 0;                                                                                           // 186
  if (a.compareDocumentPosition) {                                                                      // 187
    var n = a.compareDocumentPosition(b);                                                               // 188
    return ((n & 0x18) ? 0 : ((n & 0x4) ? -1 : 1));                                                     // 189
  } else {                                                                                              // 190
    // Only old IE is known to not have compareDocumentPosition (though Safari                          // 191
    // originally lacked it).  Thankfully, IE gives us a way of comparing elements                      // 192
    // via the "sourceIndex" property.                                                                  // 193
    if (a.contains(b) || b.contains(a))                                                                 // 194
      return 0;                                                                                         // 195
    return (a.sourceIndex < b.sourceIndex ? -1 : 1);                                                    // 196
  }                                                                                                     // 197
};                                                                                                      // 198
                                                                                                        // 199
findComponentWithProp = function (id, comp) {                                                           // 200
  while (comp) {                                                                                        // 201
    if (typeof comp[id] !== 'undefined')                                                                // 202
      return comp;                                                                                      // 203
    comp = comp.parent;                                                                                 // 204
  }                                                                                                     // 205
  return null;                                                                                          // 206
};                                                                                                      // 207
                                                                                                        // 208
findComponentWithHelper = function (id, comp) {                                                         // 209
  while (comp) {                                                                                        // 210
    if (comp.__helperHost) {                                                                            // 211
      if (typeof comp[id] !== 'undefined')                                                              // 212
        return comp;                                                                                    // 213
      else                                                                                              // 214
        return null;                                                                                    // 215
    }                                                                                                   // 216
    comp = comp.parent;                                                                                 // 217
  }                                                                                                     // 218
  return null;                                                                                          // 219
};                                                                                                      // 220
                                                                                                        // 221
getComponentData = function (comp) {                                                                    // 222
  comp = findComponentWithProp('data', comp);                                                           // 223
  return (comp ?                                                                                        // 224
          (typeof comp.data === 'function' ?                                                            // 225
           comp.data() : comp.data) :                                                                   // 226
          null);                                                                                        // 227
};                                                                                                      // 228
                                                                                                        // 229
updateTemplateInstance = function (comp) {                                                              // 230
  // Populate `comp.templateInstance.{firstNode,lastNode,data}`                                         // 231
  // on demand.                                                                                         // 232
  var tmpl = comp.templateInstance;                                                                     // 233
  tmpl.data = getComponentData(comp);                                                                   // 234
                                                                                                        // 235
  if (comp.dom && !comp.isDestroyed) {                                                                  // 236
    tmpl.firstNode = comp.dom.startNode().nextSibling;                                                  // 237
    tmpl.lastNode = comp.dom.endNode().previousSibling;                                                 // 238
    // Catch the case where the DomRange is empty and we'd                                              // 239
    // otherwise pass the out-of-order nodes (end, start)                                               // 240
    // as (firstNode, lastNode).                                                                        // 241
    if (tmpl.lastNode && tmpl.lastNode.nextSibling === tmpl.firstNode)                                  // 242
      tmpl.lastNode = tmpl.firstNode;                                                                   // 243
  } else {                                                                                              // 244
    // on 'created' or 'destroyed' callbacks we don't have a DomRange                                   // 245
    tmpl.firstNode = null;                                                                              // 246
    tmpl.lastNode = null;                                                                               // 247
  }                                                                                                     // 248
};                                                                                                      // 249
                                                                                                        // 250
_extend(UI.Component, {                                                                                 // 251
  // We implement the old APIs here, including how data is passed                                       // 252
  // to helpers in `this`.                                                                              // 253
  helpers: function (dict) {                                                                            // 254
    _extend(this, dict);                                                                                // 255
  },                                                                                                    // 256
  events: function (dict) {                                                                             // 257
    var events;                                                                                         // 258
    if (this.hasOwnProperty('_events'))                                                                 // 259
      events = this._events;                                                                            // 260
    else                                                                                                // 261
      events = (this._events = []);                                                                     // 262
                                                                                                        // 263
    _.each(dict, function (handler, spec) {                                                             // 264
      var clauses = spec.split(/,\s+/);                                                                 // 265
      // iterate over clauses of spec, e.g. ['click .foo', 'click .bar']                                // 266
      _.each(clauses, function (clause) {                                                               // 267
        var parts = clause.split(/\s+/);                                                                // 268
        if (parts.length === 0)                                                                         // 269
          return;                                                                                       // 270
                                                                                                        // 271
        var newEvents = parts.shift();                                                                  // 272
        var selector = parts.join(' ');                                                                 // 273
        events.push({events: newEvents,                                                                 // 274
                     selector: selector,                                                                // 275
                     handler: handler});                                                                // 276
      });                                                                                               // 277
    });                                                                                                 // 278
  }                                                                                                     // 279
});                                                                                                     // 280
                                                                                                        // 281
// XXX we don't really want this to be a user-visible callback,                                         // 282
// it's just a particular signal we need from DomRange.                                                 // 283
UI.Component.notifyParented = function () {                                                             // 284
  var self = this;                                                                                      // 285
  for (var comp = self; comp; comp = comp._super) {                                                     // 286
    var events = (comp.hasOwnProperty('_events') && comp._events) || null;                              // 287
    if ((! events) && comp.hasOwnProperty('events') &&                                                  // 288
        typeof comp.events === 'object') {                                                              // 289
      // Provide limited back-compat support for `.events = {...}`                                      // 290
      // syntax.  Pass `comp.events` to the original `.events(...)`                                     // 291
      // function.  This code must run only once per component, in                                      // 292
      // order to not bind the handlers more than once, which is                                        // 293
      // ensured by the fact that we only do this when `comp._events`                                   // 294
      // is falsy, and we cause it to be set now.                                                       // 295
      UI.Component.events.call(comp, comp.events);                                                      // 296
      events = comp._events;                                                                            // 297
    }                                                                                                   // 298
    _.each(events, function (esh) { // {events, selector, handler}                                      // 299
      // wrap the handler here, per instance of the template that                                       // 300
      // declares the event map, so we can pass the instance to                                         // 301
      // the event handler.                                                                             // 302
      var wrappedHandler = function (event) {                                                           // 303
        var comp = UI.DomRange.getContainingComponent(event.currentTarget);                             // 304
        var data = comp && getComponentData(comp);                                                      // 305
        updateTemplateInstance(self);                                                                   // 306
        return Deps.nonreactive(function () {                                                           // 307
          // Don't want to be in a deps context, even if we were somehow                                // 308
          // triggered synchronously in an existing deps context                                        // 309
          // (the `blur` event can do this).                                                            // 310
          // XXX we should probably do what Spark did and block all                                     // 311
          // event handling during our DOM manip.  Many apps had weird                                  // 312
          // unanticipated bugs until we did that.                                                      // 313
          return esh.handler.call(data === null ? {} : data,                                            // 314
                                  event, self.templateInstance);                                        // 315
        });                                                                                             // 316
      };                                                                                                // 317
                                                                                                        // 318
      self.dom.on(esh.events, esh.selector, wrappedHandler);                                            // 319
    });                                                                                                 // 320
  }                                                                                                     // 321
                                                                                                        // 322
  if (self.rendered) {                                                                                  // 323
    // Defer rendered callback until flush time.                                                        // 324
    Deps.afterFlush(function () {                                                                       // 325
      if (! self.isDestroyed) {                                                                         // 326
        updateTemplateInstance(self);                                                                   // 327
        self.rendered.call(self.templateInstance);                                                      // 328
      }                                                                                                 // 329
    });                                                                                                 // 330
  }                                                                                                     // 331
};                                                                                                      // 332
                                                                                                        // 333
// past compat                                                                                          // 334
UI.Component.preserve = function () {                                                                   // 335
  Meteor._debug("The 'preserve' method on templates is now unnecessary and deprecated.");               // 336
};                                                                                                      // 337
                                                                                                        // 338
// Gets the data context of the enclosing component that rendered a                                     // 339
// given element                                                                                        // 340
UI.getElementData = function (el) {                                                                     // 341
  var comp = UI.DomRange.getContainingComponent(el);                                                    // 342
  return comp && getComponentData(comp);                                                                // 343
};                                                                                                      // 344
                                                                                                        // 345
//////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
// packages/ui/dombackend.js                                                                            //
//                                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                        //
if (Meteor.isClient) {                                                                                  // 1
                                                                                                        // 2
  // XXX in the future, make the jQuery adapter a separate                                              // 3
  // package and make the choice of back-end library                                                    // 4
  // configurable.  Adapters all expose the same DomBackend interface.                                  // 5
                                                                                                        // 6
  if (! Package.jquery)                                                                                 // 7
    throw new Error("Meteor UI jQuery adapter: jQuery not found.");                                     // 8
                                                                                                        // 9
  var $jq = Package.jquery.jQuery;                                                                      // 10
                                                                                                        // 11
  var DomBackend = {};                                                                                  // 12
  UI.DomBackend = DomBackend;                                                                           // 13
                                                                                                        // 14
  ///// Removal detection and interoperability.                                                         // 15
                                                                                                        // 16
  // For an explanation of this technique, see:                                                         // 17
  // http://bugs.jquery.com/ticket/12213#comment:23 .                                                   // 18
  //                                                                                                    // 19
  // In short, an element is considered "removed" when jQuery                                           // 20
  // cleans up its *private* userdata on the element,                                                   // 21
  // which we can detect using a custom event with a teardown                                           // 22
  // hook.                                                                                              // 23
                                                                                                        // 24
  var JQUERY_REMOVAL_WATCHER_EVENT_NAME = 'meteor_ui_removal_watcher';                                  // 25
  var REMOVAL_CALLBACKS_PROPERTY_NAME = '$meteor_ui_removal_callbacks';                                 // 26
  var NOOP = function () {};                                                                            // 27
                                                                                                        // 28
  // Causes `elem` (a DOM element) to be detached from its parent, if any.                              // 29
  // Whether or not `elem` was detached, causes any callbacks registered                                // 30
  // with `onRemoveElement` on `elem` and its descendants to fire.                                      // 31
  // Not for use on non-element nodes.                                                                  // 32
  //                                                                                                    // 33
  // This method is modeled after the behavior of jQuery's `$(elem).remove()`,                          // 34
  // which causes teardown on the subtree being removed.                                                // 35
  DomBackend.removeElement = function (elem) {                                                          // 36
    $jq(elem).remove();                                                                                 // 37
  };                                                                                                    // 38
                                                                                                        // 39
  // Registers a callback function to be called when the given element or                               // 40
  // one of its ancestors is removed from the DOM via the backend library.                              // 41
  // The callback function is called at most once, and it receives the element                          // 42
  // in question as an argument.                                                                        // 43
  DomBackend.onRemoveElement = function (elem, func) {                                                  // 44
    if (! elem[REMOVAL_CALLBACKS_PROPERTY_NAME]) {                                                      // 45
      elem[REMOVAL_CALLBACKS_PROPERTY_NAME] = [];                                                       // 46
                                                                                                        // 47
      // Set up the event, only the first time.                                                         // 48
      $jq(elem).on(JQUERY_REMOVAL_WATCHER_EVENT_NAME, NOOP);                                            // 49
    }                                                                                                   // 50
                                                                                                        // 51
    elem[REMOVAL_CALLBACKS_PROPERTY_NAME].push(func);                                                   // 52
  };                                                                                                    // 53
                                                                                                        // 54
  $jq.event.special[JQUERY_REMOVAL_WATCHER_EVENT_NAME] = {                                              // 55
    teardown: function() {                                                                              // 56
      var elem = this;                                                                                  // 57
      var callbacks = elem[REMOVAL_CALLBACKS_PROPERTY_NAME];                                            // 58
      if (callbacks) {                                                                                  // 59
        for (var i = 0; i < callbacks.length; i++)                                                      // 60
          callbacks[i](elem);                                                                           // 61
        elem[REMOVAL_CALLBACKS_PROPERTY_NAME] = null;                                                   // 62
      }                                                                                                 // 63
    }                                                                                                   // 64
  };                                                                                                    // 65
                                                                                                        // 66
  DomBackend.parseHTML = function (html) {                                                              // 67
    // Return an array of nodes.                                                                        // 68
    //                                                                                                  // 69
    // jQuery does fancy stuff like creating an appropriate                                             // 70
    // container element and setting innerHTML on it, as well                                           // 71
    // as working around various IE quirks.                                                             // 72
    return $jq.parseHTML(html) || [];                                                                   // 73
  };                                                                                                    // 74
                                                                                                        // 75
  // Must use jQuery semantics for `context`, not                                                       // 76
  // querySelectorAll's.  In other words, all the parts                                                 // 77
  // of `selector` must be found under `context`.                                                       // 78
  DomBackend.findBySelector = function (selector, context) {                                            // 79
    return $jq(selector, context);                                                                      // 80
  };                                                                                                    // 81
                                                                                                        // 82
  DomBackend.newFragment = function (nodeArray) {                                                       // 83
    var frag = document.createDocumentFragment();                                                       // 84
    for (var i = 0; i < nodeArray.length; i++)                                                          // 85
      frag.appendChild(nodeArray[i]);                                                                   // 86
    return frag;                                                                                        // 87
  };                                                                                                    // 88
                                                                                                        // 89
  // `selector` is non-null.  `type` is one type (but                                                   // 90
  // may be in backend-specific form, e.g. have namespaces).                                            // 91
  // Order fired must be order bound.                                                                   // 92
  DomBackend.delegateEvents = function (elem, type, selector, handler) {                                // 93
    $jq(elem).on(type, selector, handler);                                                              // 94
  };                                                                                                    // 95
                                                                                                        // 96
  DomBackend.undelegateEvents = function (elem, type, handler) {                                        // 97
    $jq(elem).off(type, handler);                                                                       // 98
  };                                                                                                    // 99
                                                                                                        // 100
  DomBackend.bindEventCapturer = function (elem, type, selector, handler) {                             // 101
    var $elem = $jq(elem);                                                                              // 102
                                                                                                        // 103
    var wrapper = function (event) {                                                                    // 104
      event = $jq.event.fix(event);                                                                     // 105
      event.currentTarget = event.target;                                                               // 106
                                                                                                        // 107
      // Note: It might improve jQuery interop if we called into jQuery                                 // 108
      // here somehow.  Since we don't use jQuery to dispatch the event,                                // 109
      // we don't fire any of jQuery's event hooks or anything.  However,                               // 110
      // since jQuery can't bind capturing handlers, it's not clear                                     // 111
      // where we would hook in.  Internal jQuery functions like `dispatch`                             // 112
      // are too high-level.                                                                            // 113
      var $target = $jq(event.currentTarget);                                                           // 114
      if ($target.is($elem.find(selector)))                                                             // 115
        handler.call(elem, event);                                                                      // 116
    };                                                                                                  // 117
                                                                                                        // 118
    handler._meteorui_wrapper = wrapper;                                                                // 119
                                                                                                        // 120
    type = this.parseEventType(type);                                                                   // 121
    // add *capturing* event listener                                                                   // 122
    elem.addEventListener(type, wrapper, true);                                                         // 123
  };                                                                                                    // 124
                                                                                                        // 125
  DomBackend.unbindEventCapturer = function (elem, type, handler) {                                     // 126
    type = this.parseEventType(type);                                                                   // 127
    elem.removeEventListener(type, handler._meteorui_wrapper, true);                                    // 128
  };                                                                                                    // 129
                                                                                                        // 130
  DomBackend.parseEventType = function (type) {                                                         // 131
    // strip off namespaces                                                                             // 132
    var dotLoc = type.indexOf('.');                                                                     // 133
    if (dotLoc >= 0)                                                                                    // 134
      return type.slice(0, dotLoc);                                                                     // 135
    return type;                                                                                        // 136
  };                                                                                                    // 137
                                                                                                        // 138
}                                                                                                       // 139
//////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
// packages/ui/domrange.js                                                                              //
//                                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                        //
// TODO                                                                                                 // 1
// - Lazy removal detection                                                                             // 2
// - UI hooks (expose, test)                                                                            // 3
// - Quick remove/add (mark "leaving" members; needs UI hooks)                                          // 4
// - Event removal on removal                                                                           // 5
// - Event moving on TBODY move                                                                         // 6
                                                                                                        // 7
var DomBackend = UI.DomBackend;                                                                         // 8
                                                                                                        // 9
var removeNode = function (n) {                                                                         // 10
//  if (n.nodeType === 1 &&                                                                             // 11
//      n.parentNode.$uihooks && n.parentNode.$uihooks.removeElement)                                   // 12
//    n.parentNode.$uihooks.removeElement(n);                                                           // 13
//  else                                                                                                // 14
    n.parentNode.removeChild(n);                                                                        // 15
};                                                                                                      // 16
                                                                                                        // 17
var insertNode = function (n, parent, next) {                                                           // 18
//  if (n.nodeType === 1 &&                                                                             // 19
//      parent.$uihooks && parent.$uihooks.insertElement)                                               // 20
//    parent.$uihooks.insertElement(n, parent, next);                                                   // 21
//  else                                                                                                // 22
    // `|| null` because IE throws an error if 'next' is undefined                                      // 23
  parent.insertBefore(n, next || null);                                                                 // 24
};                                                                                                      // 25
                                                                                                        // 26
var moveNode = function (n, parent, next) {                                                             // 27
//  if (n.nodeType === 1 &&                                                                             // 28
//      parent.$uihooks && parent.$uihooks.moveElement)                                                 // 29
//    parent.$uihooks.moveElement(n, parent, next);                                                     // 30
//  else                                                                                                // 31
    // `|| null` because IE throws an error if 'next' is undefined                                      // 32
    parent.insertBefore(n, next || null);                                                               // 33
};                                                                                                      // 34
                                                                                                        // 35
// A very basic operation like Underscore's `_.extend` that                                             // 36
// copies `src`'s own, enumerable properties onto `tgt` and                                             // 37
// returns `tgt`.                                                                                       // 38
var _extend = function (tgt, src) {                                                                     // 39
  for (var k in src)                                                                                    // 40
    if (src.hasOwnProperty(k))                                                                          // 41
      tgt[k] = src[k];                                                                                  // 42
  return tgt;                                                                                           // 43
};                                                                                                      // 44
                                                                                                        // 45
var _contains = function (list, item) {                                                                 // 46
  if (! list)                                                                                           // 47
    return false;                                                                                       // 48
  for (var i = 0, N = list.length; i < N; i++)                                                          // 49
    if (list[i] === item)                                                                               // 50
      return true;                                                                                      // 51
  return false;                                                                                         // 52
};                                                                                                      // 53
                                                                                                        // 54
var isArray = function (x) {                                                                            // 55
  return !!((typeof x.length === 'number') &&                                                           // 56
            (x.sort || x.splice));                                                                      // 57
};                                                                                                      // 58
                                                                                                        // 59
// Text nodes consisting of only whitespace                                                             // 60
// are "insignificant" nodes.                                                                           // 61
var isSignificantNode = function (n) {                                                                  // 62
  return ! (n.nodeType === 3 &&                                                                         // 63
            (! n.nodeValue ||                                                                           // 64
             /^\s+$/.test(n.nodeValue)));                                                               // 65
};                                                                                                      // 66
                                                                                                        // 67
var checkId = function (id) {                                                                           // 68
  if (typeof id !== 'string')                                                                           // 69
    throw new Error("id must be a string");                                                             // 70
  if (! id)                                                                                             // 71
    throw new Error("id may not be empty");                                                             // 72
};                                                                                                      // 73
                                                                                                        // 74
var textExpandosSupported = (function () {                                                              // 75
  var tn = document.createTextNode('');                                                                 // 76
  try {                                                                                                 // 77
    tn.blahblah = true;                                                                                 // 78
    return true;                                                                                        // 79
  } catch (e) {                                                                                         // 80
    // IE 8                                                                                             // 81
    return false;                                                                                       // 82
  }                                                                                                     // 83
})();                                                                                                   // 84
                                                                                                        // 85
var createMarkerNode = (                                                                                // 86
  textExpandosSupported ?                                                                               // 87
    function () { return document.createTextNode(""); } :                                               // 88
  function () { return document.createComment("IE"); });                                                // 89
                                                                                                        // 90
var rangeParented = function (range) {                                                                  // 91
  if (! range.isParented) {                                                                             // 92
    range.isParented = true;                                                                            // 93
                                                                                                        // 94
    if (! range.owner) {                                                                                // 95
      // top-level (unowned) ranges in an element,                                                      // 96
      // keep a pointer to the range on the parent                                                      // 97
      // element.  This is really just for IE 9+                                                        // 98
      // TextNode GC issues, but we can't do reliable                                                   // 99
      // feature detection (i.e. bug detection).                                                        // 100
      // Note that because we keep a direct pointer to                                                  // 101
      // `parentNode.$_uiranges`, it doesn't matter                                                     // 102
      // if we are reparented (e.g. wrapped in a TBODY).                                                // 103
      var parentNode = range.parentNode();                                                              // 104
      var rangeDict = (                                                                                 // 105
        parentNode.$_uiranges ||                                                                        // 106
          (parentNode.$_uiranges = {}));                                                                // 107
      rangeDict[range._rangeId] = range;                                                                // 108
      range._rangeDict = rangeDict;                                                                     // 109
                                                                                                        // 110
      // get jQuery to tell us when this node is removed                                                // 111
      DomBackend.onRemoveElement(parentNode, function () {                                              // 112
        rangeRemoved(range);                                                                            // 113
      });                                                                                               // 114
    }                                                                                                   // 115
                                                                                                        // 116
    if (range.component && range.component.notifyParented)                                              // 117
      range.component.notifyParented();                                                                 // 118
                                                                                                        // 119
    // recurse on member ranges                                                                         // 120
    var members = range.members;                                                                        // 121
    for (var k in members) {                                                                            // 122
      var mem = members[k];                                                                             // 123
      if (mem instanceof DomRange)                                                                      // 124
        rangeParented(mem);                                                                             // 125
    }                                                                                                   // 126
  }                                                                                                     // 127
};                                                                                                      // 128
                                                                                                        // 129
var rangeRemoved = function (range) {                                                                   // 130
  if (! range.isRemoved) {                                                                              // 131
    range.isRemoved = true;                                                                             // 132
                                                                                                        // 133
    if (range._rangeDict)                                                                               // 134
      delete range._rangeDict[range._rangeId];                                                          // 135
                                                                                                        // 136
    // XXX clean up events in $_uievents                                                                // 137
                                                                                                        // 138
    // notify component of removal                                                                      // 139
    if (range.removed)                                                                                  // 140
      range.removed();                                                                                  // 141
                                                                                                        // 142
    membersRemoved(range);                                                                              // 143
  }                                                                                                     // 144
};                                                                                                      // 145
                                                                                                        // 146
var nodeRemoved = function (node, viaBackend) {                                                         // 147
  if (node.nodeType === 1) { // ELEMENT                                                                 // 148
    var comps = DomRange.getComponents(node);                                                           // 149
    for (var i = 0, N = comps.length; i < N; i++)                                                       // 150
      rangeRemoved(comps[i]);                                                                           // 151
                                                                                                        // 152
    if (! viaBackend)                                                                                   // 153
      DomBackend.removeElement(node);                                                                   // 154
  }                                                                                                     // 155
};                                                                                                      // 156
                                                                                                        // 157
var membersRemoved = function (range) {                                                                 // 158
  var members = range.members;                                                                          // 159
  for (var k in members) {                                                                              // 160
    var mem = members[k];                                                                               // 161
    if (mem instanceof DomRange)                                                                        // 162
      rangeRemoved(mem);                                                                                // 163
    else                                                                                                // 164
      nodeRemoved(mem);                                                                                 // 165
  }                                                                                                     // 166
};                                                                                                      // 167
                                                                                                        // 168
var nextGuid = 1;                                                                                       // 169
                                                                                                        // 170
var DomRange = function () {                                                                            // 171
  var start = createMarkerNode();                                                                       // 172
  var end = createMarkerNode();                                                                         // 173
  var fragment = DomBackend.newFragment([start, end]);                                                  // 174
  fragment.$_uiIsOffscreen = true;                                                                      // 175
                                                                                                        // 176
  this.start = start;                                                                                   // 177
  this.end = end;                                                                                       // 178
  start.$ui = this;                                                                                     // 179
  end.$ui = this;                                                                                       // 180
                                                                                                        // 181
  this.members = {};                                                                                    // 182
  this.nextMemberId = 1;                                                                                // 183
  this.owner = null;                                                                                    // 184
  this._rangeId = nextGuid++;                                                                           // 185
  this._rangeDict = null;                                                                               // 186
                                                                                                        // 187
  this.isParented = false;                                                                              // 188
  this.isRemoved = false;                                                                               // 189
};                                                                                                      // 190
                                                                                                        // 191
_extend(DomRange.prototype, {                                                                           // 192
  getNodes: function () {                                                                               // 193
    if (! this.parentNode())                                                                            // 194
      return [];                                                                                        // 195
                                                                                                        // 196
    this.refresh();                                                                                     // 197
                                                                                                        // 198
    var afterNode = this.end.nextSibling;                                                               // 199
    var nodes = [];                                                                                     // 200
    for (var n = this.start;                                                                            // 201
         n && n !== afterNode;                                                                          // 202
         n = n.nextSibling)                                                                             // 203
      nodes.push(n);                                                                                    // 204
    return nodes;                                                                                       // 205
  },                                                                                                    // 206
  removeAll: function () {                                                                              // 207
    if (! this.parentNode())                                                                            // 208
      return;                                                                                           // 209
                                                                                                        // 210
    this.refresh();                                                                                     // 211
                                                                                                        // 212
    // leave start and end                                                                              // 213
    var afterNode = this.end;                                                                           // 214
    var nodes = [];                                                                                     // 215
    for (var n = this.start.nextSibling;                                                                // 216
         n && n !== afterNode;                                                                          // 217
         n = n.nextSibling) {                                                                           // 218
      // don't remove yet since then we'd lose nextSibling                                              // 219
      nodes.push(n);                                                                                    // 220
    }                                                                                                   // 221
    for (var i = 0, N = nodes.length; i < N; i++)                                                       // 222
      removeNode(nodes[i]);                                                                             // 223
                                                                                                        // 224
    membersRemoved(this);                                                                               // 225
                                                                                                        // 226
    this.members = {};                                                                                  // 227
  },                                                                                                    // 228
  // (_nextNode is internal)                                                                            // 229
  add: function (id, newMemberOrArray, beforeId, _nextNode) {                                           // 230
    if (id != null && typeof id !== 'string') {                                                         // 231
      if (typeof id !== 'object')                                                                       // 232
        // a non-object first argument is probably meant                                                // 233
        // as an id, NOT a new member, so complain about it                                             // 234
        // as such.                                                                                     // 235
        throw new Error("id must be a string");                                                         // 236
      beforeId = newMemberOrArray;                                                                      // 237
      newMemberOrArray = id;                                                                            // 238
      id = null;                                                                                        // 239
    }                                                                                                   // 240
                                                                                                        // 241
    if (! newMemberOrArray || typeof newMemberOrArray !== 'object')                                     // 242
      throw new Error("Expected component, node, or array");                                            // 243
                                                                                                        // 244
    if (isArray(newMemberOrArray)) {                                                                    // 245
      if (newMemberOrArray.length === 1) {                                                              // 246
        newMemberOrArray = newMemberOrArray[0];                                                         // 247
      } else {                                                                                          // 248
        if (id != null)                                                                                 // 249
          throw new Error("Can only add one node or one component if id is given");                     // 250
        var array = newMemberOrArray;                                                                   // 251
        // calculate `nextNode` once in case it involves a refresh                                      // 252
        _nextNode = this.getInsertionPoint(beforeId);                                                   // 253
        for (var i = 0; i < array.length; i++)                                                          // 254
          this.add(null, array[i], beforeId, _nextNode);                                                // 255
        return;                                                                                         // 256
      }                                                                                                 // 257
    }                                                                                                   // 258
                                                                                                        // 259
    var parentNode = this.parentNode();                                                                 // 260
    // Consider ourselves removed (and don't mind) if                                                   // 261
    // start marker has no parent.                                                                      // 262
    if (! parentNode)                                                                                   // 263
      return;                                                                                           // 264
    // because this may call `refresh`, it must be done                                                 // 265
    // early, before we add the new member.                                                             // 266
    var nextNode = (_nextNode ||                                                                        // 267
                    this.getInsertionPoint(beforeId));                                                  // 268
                                                                                                        // 269
    var newMember = newMemberOrArray;                                                                   // 270
    if (id == null) {                                                                                   // 271
      id = this.nextMemberId++;                                                                         // 272
    } else {                                                                                            // 273
      checkId(id);                                                                                      // 274
      id = ' ' + id;                                                                                    // 275
    }                                                                                                   // 276
                                                                                                        // 277
    var members = this.members;                                                                         // 278
    if (members.hasOwnProperty(id)) {                                                                   // 279
      var oldMember = members[id];                                                                      // 280
      if (oldMember instanceof DomRange) {                                                              // 281
        // range, does it still exist?                                                                  // 282
        var oldRange = oldMember;                                                                       // 283
        if (oldRange.start.parentNode !== parentNode) {                                                 // 284
          delete members[id];                                                                           // 285
          oldRange.owner = null;                                                                        // 286
          rangeRemoved(oldRange);                                                                       // 287
        } else {                                                                                        // 288
          throw new Error("Member already exists: " + id.slice(1));                                     // 289
        }                                                                                               // 290
      } else {                                                                                          // 291
        // node, does it still exist?                                                                   // 292
        var oldNode = oldMember;                                                                        // 293
        if (oldNode.parentNode !== parentNode) {                                                        // 294
          nodeRemoved(oldNode);                                                                         // 295
          delete members[id];                                                                           // 296
        } else {                                                                                        // 297
          throw new Error("Member already exists: " + id.slice(1));                                     // 298
        }                                                                                               // 299
      }                                                                                                 // 300
    }                                                                                                   // 301
                                                                                                        // 302
    if (newMember instanceof DomRange) {                                                                // 303
      // Range                                                                                          // 304
      var range = newMember;                                                                            // 305
      range.owner = this;                                                                               // 306
      var nodes = range.getNodes();                                                                     // 307
                                                                                                        // 308
      if (tbodyFixNeeded(nodes, parentNode))                                                            // 309
        // may cause a refresh(); important that the                                                    // 310
        // member isn't added yet                                                                       // 311
        parentNode = moveWithOwnersIntoTbody(this);                                                     // 312
                                                                                                        // 313
      members[id] = newMember;                                                                          // 314
      for (var i = 0; i < nodes.length; i++)                                                            // 315
        insertNode(nodes[i], parentNode, nextNode);                                                     // 316
                                                                                                        // 317
      if (this.isParented)                                                                              // 318
        rangeParented(range);                                                                           // 319
    } else {                                                                                            // 320
      // Node                                                                                           // 321
      if (typeof newMember.nodeType !== 'number')                                                       // 322
        throw new Error("Expected Component or Node");                                                  // 323
      var node = newMember;                                                                             // 324
      // can't attach `$ui` to a TextNode in IE 8, so                                                   // 325
      // don't bother on any browser.                                                                   // 326
      if (node.nodeType !== 3)                                                                          // 327
        node.$ui = this;                                                                                // 328
                                                                                                        // 329
      if (tbodyFixNeeded(node, parentNode))                                                             // 330
        // may cause a refresh(); important that the                                                    // 331
        // member isn't added yet                                                                       // 332
        parentNode = moveWithOwnersIntoTbody(this);                                                     // 333
                                                                                                        // 334
      members[id] = newMember;                                                                          // 335
      insertNode(node, parentNode, nextNode);                                                           // 336
    }                                                                                                   // 337
  },                                                                                                    // 338
  remove: function (id) {                                                                               // 339
    if (id == null) {                                                                                   // 340
      // remove self                                                                                    // 341
      this.removeAll();                                                                                 // 342
      removeNode(this.start);                                                                           // 343
      removeNode(this.end);                                                                             // 344
      this.owner = null;                                                                                // 345
      rangeRemoved(this);                                                                               // 346
      return;                                                                                           // 347
    }                                                                                                   // 348
                                                                                                        // 349
    checkId(id);                                                                                        // 350
    id = ' ' + id;                                                                                      // 351
    var members = this.members;                                                                         // 352
    var member = (members.hasOwnProperty(id) &&                                                         // 353
                  members[id]);                                                                         // 354
    delete members[id];                                                                                 // 355
                                                                                                        // 356
    // Don't mind double-remove.                                                                        // 357
    if (! member)                                                                                       // 358
      return;                                                                                           // 359
                                                                                                        // 360
    var parentNode = this.parentNode();                                                                 // 361
    // Consider ourselves removed (and don't mind) if                                                   // 362
    // start marker has no parent.                                                                      // 363
    if (! parentNode)                                                                                   // 364
      return;                                                                                           // 365
                                                                                                        // 366
    if (member instanceof DomRange) {                                                                   // 367
      // Range                                                                                          // 368
      var range = member;                                                                               // 369
      range.owner = null;                                                                               // 370
      // Don't mind if range (specifically its start                                                    // 371
      // marker) has been removed already.                                                              // 372
      if (range.start.parentNode === parentNode)                                                        // 373
        member.remove();                                                                                // 374
    } else {                                                                                            // 375
      // Node                                                                                           // 376
      var node = member;                                                                                // 377
      // Don't mind if node has been removed already.                                                   // 378
      if (node.parentNode === parentNode)                                                               // 379
        removeNode(node);                                                                               // 380
    }                                                                                                   // 381
  },                                                                                                    // 382
  moveBefore: function (id, beforeId) {                                                                 // 383
    var nextNode = this.getInsertionPoint(beforeId);                                                    // 384
    checkId(id);                                                                                        // 385
    id = ' ' + id;                                                                                      // 386
    var members = this.members;                                                                         // 387
    var member =                                                                                        // 388
          (members.hasOwnProperty(id) &&                                                                // 389
           members[id]);                                                                                // 390
    // Don't mind if member doesn't exist.                                                              // 391
    if (! member)                                                                                       // 392
      return;                                                                                           // 393
                                                                                                        // 394
    var parentNode = this.parentNode();                                                                 // 395
    // Consider ourselves removed (and don't mind) if                                                   // 396
    // start marker has no parent.                                                                      // 397
    if (! parentNode)                                                                                   // 398
      return;                                                                                           // 399
                                                                                                        // 400
    if (member instanceof DomRange) {                                                                   // 401
      // Range                                                                                          // 402
      var range = member;                                                                               // 403
      // Don't mind if range (specifically its start marker)                                            // 404
      // has been removed already.                                                                      // 405
      if (range.start.parentNode === parentNode) {                                                      // 406
        range.refresh();                                                                                // 407
        var nodes = range.getNodes();                                                                   // 408
        for (var i = 0; i < nodes.length; i++)                                                          // 409
          moveNode(nodes[i], parentNode, nextNode);                                                     // 410
      }                                                                                                 // 411
    } else {                                                                                            // 412
      // Node                                                                                           // 413
      var node = member;                                                                                // 414
      moveNode(node, parentNode, nextNode);                                                             // 415
    }                                                                                                   // 416
  },                                                                                                    // 417
  get: function (id) {                                                                                  // 418
    checkId(id);                                                                                        // 419
    id = ' ' + id;                                                                                      // 420
    var members = this.members;                                                                         // 421
    if (members.hasOwnProperty(id))                                                                     // 422
      return members[id];                                                                               // 423
    return null;                                                                                        // 424
  },                                                                                                    // 425
  parentNode: function () {                                                                             // 426
    return this.start.parentNode;                                                                       // 427
  },                                                                                                    // 428
  startNode: function () {                                                                              // 429
    return this.start;                                                                                  // 430
  },                                                                                                    // 431
  endNode: function () {                                                                                // 432
    return this.end;                                                                                    // 433
  },                                                                                                    // 434
  eachMember: function (nodeFunc, rangeFunc) {                                                          // 435
    var members = this.members;                                                                         // 436
    var parentNode = this.parentNode();                                                                 // 437
    for (var k in members) {                                                                            // 438
      // mem is a component (hosting a Range) or a Node                                                 // 439
      var mem = members[k];                                                                             // 440
      if (mem instanceof DomRange) {                                                                    // 441
        // Range                                                                                        // 442
        var range = mem;                                                                                // 443
        if (range.start.parentNode === parentNode) {                                                    // 444
          rangeFunc && rangeFunc(range); // still there                                                 // 445
        } else {                                                                                        // 446
          range.owner = null;                                                                           // 447
          delete members[k]; // gone                                                                    // 448
          rangeRemoved(range);                                                                          // 449
        }                                                                                               // 450
      } else {                                                                                          // 451
        // Node                                                                                         // 452
        var node = mem;                                                                                 // 453
        if (node.parentNode === parentNode) {                                                           // 454
          nodeFunc && nodeFunc(node); // still there                                                    // 455
        } else {                                                                                        // 456
          delete members[k]; // gone                                                                    // 457
          nodeRemoved(node);                                                                            // 458
        }                                                                                               // 459
      }                                                                                                 // 460
    }                                                                                                   // 461
  },                                                                                                    // 462
                                                                                                        // 463
  ///////////// INTERNALS below this point, pretty much                                                 // 464
                                                                                                        // 465
  // The purpose of "refreshing" a DomRange is to                                                       // 466
  // take into account any element removals or moves                                                    // 467
  // that may have occurred, and to "fix" the start                                                     // 468
  // and end markers before the entire range is moved                                                   // 469
  // or removed so that they bracket the appropriate                                                    // 470
  // content.                                                                                           // 471
  //                                                                                                    // 472
  // For example, if a DomRange contains a single element                                               // 473
  // node, and this node is moved using jQuery, refreshing                                              // 474
  // the DomRange will look to the element as ground truth                                              // 475
  // and move the start/end markers around the element.                                                 // 476
  // A refreshed DomRange's nodes may surround nodes from                                               // 477
  // sibling DomRanges (including their marker nodes)                                                   // 478
  // until the sibling DomRange is refreshed.                                                           // 479
  //                                                                                                    // 480
  // Specifically, `refresh` moves the `start`                                                          // 481
  // and `end` nodes to immediate before the first,                                                     // 482
  // and after the last, "significant" node the                                                         // 483
  // DomRange contains, where a significant node                                                        // 484
  // is any node except a whitespace-only text-node.                                                    // 485
  // All member ranges are refreshed first.  Adjacent                                                   // 486
  // insignificant member nodes are included between                                                    // 487
  // `start` and `end` as well, but it's possible that                                                  // 488
  // other insignificant nodes remain as siblings                                                       // 489
  // elsewhere.  Nodes with no DomRange owner that are                                                  // 490
  // found between this DomRange's nodes are adopted.                                                   // 491
  //                                                                                                    // 492
  // Performing add/move/remove operations on an "each"                                                 // 493
  // shouldn't require refreshing the entire each, just                                                 // 494
  // the member in question.  (However, adding to the                                                   // 495
  // end may require refreshing the whole "each";                                                       // 496
  // see `getInsertionPoint`.  Adding multiple members                                                  // 497
  // at once using `add(array)` is faster.                                                              // 498
  refresh: function () {                                                                                // 499
                                                                                                        // 500
    var parentNode = this.parentNode();                                                                 // 501
    if (! parentNode)                                                                                   // 502
      return;                                                                                           // 503
                                                                                                        // 504
    // Using `eachMember`, do several things:                                                           // 505
    // - Refresh all member ranges                                                                      // 506
    // - Count our members                                                                              // 507
    // - If there's only one, get that one                                                              // 508
    // - Make a list of member TextNodes, which we                                                      // 509
    //   can't detect with a `$ui` property because                                                     // 510
    //   IE 8 doesn't allow user-defined properties                                                     // 511
    //   on TextNodes.                                                                                  // 512
    var someNode = null;                                                                                // 513
    var someRange = null;                                                                               // 514
    var numMembers = 0;                                                                                 // 515
    var textNodes = null;                                                                               // 516
    this.eachMember(function (node) {                                                                   // 517
      someNode = node;                                                                                  // 518
      numMembers++;                                                                                     // 519
      if (node.nodeType === 3) {                                                                        // 520
        textNodes = (textNodes || []);                                                                  // 521
        textNodes.push(node);                                                                           // 522
      }                                                                                                 // 523
    }, function (range) {                                                                               // 524
      range.refresh();                                                                                  // 525
      someRange = range;                                                                                // 526
      numMembers++;                                                                                     // 527
    });                                                                                                 // 528
                                                                                                        // 529
    var firstNode = null;                                                                               // 530
    var lastNode = null;                                                                                // 531
                                                                                                        // 532
    if (numMembers === 0) {                                                                             // 533
      // don't scan for members                                                                         // 534
    } else if (numMembers === 1) {                                                                      // 535
      if (someNode) {                                                                                   // 536
        firstNode = someNode;                                                                           // 537
        lastNode = someNode;                                                                            // 538
      } else if (someRange) {                                                                           // 539
        firstNode = someRange.start;                                                                    // 540
        lastNode = someRange.end;                                                                       // 541
      }                                                                                                 // 542
    } else {                                                                                            // 543
      // This loop is O(childNodes.length), even if our members                                         // 544
      // are already consecutive.  This means refreshing just one                                       // 545
      // item in a list is technically order of the total number                                        // 546
      // of siblings, including in other list items.                                                    // 547
      //                                                                                                // 548
      // The root cause is we intentionally don't track the                                             // 549
      // DOM order of our members, so finding the first                                                 // 550
      // and last in sibling order either involves a scan                                               // 551
      // or a bunch of calls to compareDocumentPosition.                                                // 552
      //                                                                                                // 553
      // Fortunately, the common cases of zero and one members                                          // 554
      // are optimized.  Also, the scan is super-fast because                                           // 555
      // no work is done for unknown nodes.  It could be possible                                       // 556
      // to optimize this code further if it becomes a problem.                                         // 557
      for (var node = parentNode.firstChild;                                                            // 558
           node; node = node.nextSibling) {                                                             // 559
                                                                                                        // 560
        var nodeOwner;                                                                                  // 561
        if (node.$ui &&                                                                                 // 562
            (nodeOwner = node.$ui) &&                                                                   // 563
            ((nodeOwner === this &&                                                                     // 564
              node !== this.start &&                                                                    // 565
              node !== this.end &&                                                                      // 566
              isSignificantNode(node)) ||                                                               // 567
             (nodeOwner !== this &&                                                                     // 568
              nodeOwner.owner === this &&                                                               // 569
              nodeOwner.start === node))) {                                                             // 570
          // found a member range or node                                                               // 571
          // (excluding "insignificant" empty text nodes,                                               // 572
          // which won't be moved by, say, jQuery)                                                      // 573
          if (firstNode) {                                                                              // 574
            // if we've already found a member in our                                                   // 575
            // scan, see if there are some easy ownerless                                               // 576
            // nodes to "adopt" by scanning backwards.                                                  // 577
            for (var n = firstNode.previousSibling;                                                     // 578
                 n && ! n.$ui;                                                                          // 579
                 n = n.previousSibling) {                                                               // 580
              this.members[this.nextMemberId++] = n;                                                    // 581
              // can't attach `$ui` to a TextNode in IE 8, so                                           // 582
              // don't bother on any browser.                                                           // 583
              if (n.nodeType !== 3)                                                                     // 584
                n.$ui = this;                                                                           // 585
            }                                                                                           // 586
          }                                                                                             // 587
          if (node.$ui === this) {                                                                      // 588
            // Node                                                                                     // 589
            firstNode = (firstNode || node);                                                            // 590
            lastNode = node;                                                                            // 591
          } else {                                                                                      // 592
            // Range                                                                                    // 593
            // skip it and include its nodes in                                                         // 594
            // firstNode/lastNode.                                                                      // 595
            firstNode = (firstNode || node);                                                            // 596
            node = node.$ui.end;                                                                        // 597
            lastNode = node;                                                                            // 598
          }                                                                                             // 599
        }                                                                                               // 600
      }                                                                                                 // 601
    }                                                                                                   // 602
    if (firstNode) {                                                                                    // 603
      // some member or significant node was found.                                                     // 604
      // expand to include our insigificant member                                                      // 605
      // nodes as well.                                                                                 // 606
      for (var n;                                                                                       // 607
           (n = firstNode.previousSibling) &&                                                           // 608
           (n.$ui && n.$ui === this ||                                                                  // 609
            _contains(textNodes, n));)                                                                  // 610
        firstNode = n;                                                                                  // 611
      for (var n;                                                                                       // 612
           (n = lastNode.nextSibling) &&                                                                // 613
           (n.$ui && n.$ui === this ||                                                                  // 614
            _contains(textNodes, n));)                                                                  // 615
        lastNode = n;                                                                                   // 616
      // adjust our start/end pointers                                                                  // 617
      if (firstNode !== this.start)                                                                     // 618
        insertNode(this.start,                                                                          // 619
                   parentNode, firstNode);                                                              // 620
      if (lastNode !== this.end)                                                                        // 621
        insertNode(this.end, parentNode,                                                                // 622
                 lastNode.nextSibling);                                                                 // 623
    }                                                                                                   // 624
  },                                                                                                    // 625
  getInsertionPoint: function (beforeId) {                                                              // 626
    var members = this.members;                                                                         // 627
    var parentNode = this.parentNode();                                                                 // 628
                                                                                                        // 629
    if (! beforeId) {                                                                                   // 630
      // Refreshing here is necessary if we want to                                                     // 631
      // allow elements to move around arbitrarily.                                                     // 632
      // If jQuery is used to reorder elements, it could                                                // 633
      // easily make our `end` pointer meaningless,                                                     // 634
      // even though all our members continue to make                                                   // 635
      // good reference points as long as they are refreshed.                                           // 636
      //                                                                                                // 637
      // However, a refresh is expensive!  Let's                                                        // 638
      // make the developer manually refresh if                                                         // 639
      // elements are being re-ordered externally.                                                      // 640
      return this.end;                                                                                  // 641
    }                                                                                                   // 642
                                                                                                        // 643
    checkId(beforeId);                                                                                  // 644
    beforeId = ' ' + beforeId;                                                                          // 645
    var mem = members[beforeId];                                                                        // 646
                                                                                                        // 647
    if (mem instanceof DomRange) {                                                                      // 648
      // Range                                                                                          // 649
      var range = mem;                                                                                  // 650
      if (range.start.parentNode === parentNode) {                                                      // 651
        // still there                                                                                  // 652
        range.refresh();                                                                                // 653
        return range.start;                                                                             // 654
      } else {                                                                                          // 655
        range.owner = null;                                                                             // 656
        rangeRemoved(range);                                                                            // 657
      }                                                                                                 // 658
    } else {                                                                                            // 659
      // Node                                                                                           // 660
      var node = mem;                                                                                   // 661
      if (node.parentNode === parentNode)                                                               // 662
        return node; // still there                                                                     // 663
      else                                                                                              // 664
        nodeRemoved(node);                                                                              // 665
    }                                                                                                   // 666
                                                                                                        // 667
    // not there anymore                                                                                // 668
    delete members[beforeId];                                                                           // 669
    // no good position                                                                                 // 670
    return this.end;                                                                                    // 671
  }                                                                                                     // 672
});                                                                                                     // 673
                                                                                                        // 674
DomRange.prototype.elements = function (intoArray) {                                                    // 675
  intoArray = (intoArray || []);                                                                        // 676
  this.eachMember(function (node) {                                                                     // 677
    if (node.nodeType === 1)                                                                            // 678
      intoArray.push(node);                                                                             // 679
  }, function (range) {                                                                                 // 680
    range.elements(intoArray);                                                                          // 681
  });                                                                                                   // 682
  return intoArray;                                                                                     // 683
};                                                                                                      // 684
                                                                                                        // 685
// XXX alias the below as `UI.refresh` and `UI.insert`                                                  // 686
                                                                                                        // 687
// In a real-life case where you need a refresh,                                                        // 688
// you probably don't have easy                                                                         // 689
// access to the appropriate DomRange or component,                                                     // 690
// just the enclosing element:                                                                          // 691
//                                                                                                      // 692
// ```                                                                                                  // 693
// {{#Sortable}}                                                                                        // 694
//   <div>                                                                                              // 695
//     {{#each}}                                                                                        // 696
//       ...                                                                                            // 697
// ```                                                                                                  // 698
//                                                                                                      // 699
// In this case, Sortable wants to call `refresh`                                                       // 700
// on the div, not the each, so it would use this function.                                             // 701
DomRange.refresh = function (element) {                                                                 // 702
  var comps = DomRange.getComponents(element);                                                          // 703
                                                                                                        // 704
  for (var i = 0, N = comps.length; i < N; i++)                                                         // 705
    comps[i].refresh();                                                                                 // 706
};                                                                                                      // 707
                                                                                                        // 708
DomRange.getComponents = function (element) {                                                           // 709
  var topLevelComps = [];                                                                               // 710
  for (var n = element.firstChild;                                                                      // 711
       n; n = n.nextSibling) {                                                                          // 712
    if (n.$ui && n === n.$ui.start &&                                                                   // 713
        ! n.$ui.owner)                                                                                  // 714
      topLevelComps.push(n.$ui);                                                                        // 715
  }                                                                                                     // 716
  return topLevelComps;                                                                                 // 717
};                                                                                                      // 718
                                                                                                        // 719
// `parentNode` must be an ELEMENT, not a fragment                                                      // 720
DomRange.insert = function (range, parentNode, nextNode) {                                              // 721
  var nodes = range.getNodes();                                                                         // 722
  if (tbodyFixNeeded(nodes, parentNode))                                                                // 723
    parentNode = makeOrFindTbody(parentNode, nextNode);                                                 // 724
  for (var i = 0; i < nodes.length; i++)                                                                // 725
    insertNode(nodes[i], parentNode, nextNode);                                                         // 726
  rangeParented(range);                                                                                 // 727
};                                                                                                      // 728
                                                                                                        // 729
DomRange.getContainingComponent = function (element) {                                                  // 730
  while (element && ! element.$ui)                                                                      // 731
    element = element.parentNode;                                                                       // 732
                                                                                                        // 733
  var range = (element && element.$ui);                                                                 // 734
                                                                                                        // 735
  while (range) {                                                                                       // 736
    if (range.component)                                                                                // 737
      return range.component;                                                                           // 738
    range = range.owner;                                                                                // 739
  }                                                                                                     // 740
  return null;                                                                                          // 741
};                                                                                                      // 742
                                                                                                        // 743
///// TBODY FIX for compatibility with jQuery.                                                          // 744
//                                                                                                      // 745
// Because people might use jQuery from UI hooks, and                                                   // 746
// jQuery is unable to do $(myTable).append(myTR) without                                               // 747
// adding a TBODY (for historical reasons), we move any DomRange                                        // 748
// that gains a TR, and its immediately enclosing DomRanges,                                            // 749
// into a TBODY.                                                                                        // 750
//                                                                                                      // 751
// See http://www.quora.com/David-Greenspan/Posts/The-Great-TBODY-Debacle                               // 752
var tbodyFixNeeded = function (childOrChildren, parent) {                                               // 753
  if (parent.nodeName !== 'TABLE')                                                                      // 754
    return false;                                                                                       // 755
                                                                                                        // 756
  if (isArray(childOrChildren)) {                                                                       // 757
    var foundTR = false;                                                                                // 758
    for (var i = 0, N = childOrChildren.length; i < N; i++) {                                           // 759
      var n = childOrChildren[i];                                                                       // 760
      if (n.nodeType === 1 && n.nodeName === 'TR') {                                                    // 761
        foundTR = true;                                                                                 // 762
        break;                                                                                          // 763
      }                                                                                                 // 764
    }                                                                                                   // 765
    if (! foundTR)                                                                                      // 766
      return false;                                                                                     // 767
  } else {                                                                                              // 768
    var n = childOrChildren;                                                                            // 769
    if (! (n.nodeType === 1 && n.nodeName === 'TR'))                                                    // 770
      return false;                                                                                     // 771
  }                                                                                                     // 772
                                                                                                        // 773
  return true;                                                                                          // 774
};                                                                                                      // 775
                                                                                                        // 776
var makeOrFindTbody = function (parent, next) {                                                         // 777
  // we have a TABLE > TR situation                                                                     // 778
  var tbody = parent.getElementsByTagName('tbody')[0];                                                  // 779
  if (! tbody) {                                                                                        // 780
    tbody = parent.ownerDocument.createElement("tbody");                                                // 781
    parent.insertBefore(tbody, next || null);                                                           // 782
  }                                                                                                     // 783
  return tbody;                                                                                         // 784
};                                                                                                      // 785
                                                                                                        // 786
var moveWithOwnersIntoTbody = function (range) {                                                        // 787
  while (range.owner)                                                                                   // 788
    range = range.owner;                                                                                // 789
                                                                                                        // 790
  var nodes = range.getNodes(); // causes refresh                                                       // 791
  var tbody = makeOrFindTbody(range.parentNode(),                                                       // 792
                              range.end.nextSibling);                                                   // 793
  for (var i = 0; i < nodes.length; i++)                                                                // 794
    tbody.appendChild(nodes[i]);                                                                        // 795
                                                                                                        // 796
  // XXX complete the reparenting by moving event                                                       // 797
  // HandlerRecs of `range`.                                                                            // 798
                                                                                                        // 799
  return tbody;                                                                                         // 800
};                                                                                                      // 801
                                                                                                        // 802
///// FIND BY SELECTOR                                                                                  // 803
                                                                                                        // 804
DomRange.prototype.contains = function (compOrNode) {                                                   // 805
  if (! compOrNode)                                                                                     // 806
    throw new Error("Expected Component or Node");                                                      // 807
                                                                                                        // 808
  var parentNode = this.parentNode();                                                                   // 809
  if (! parentNode)                                                                                     // 810
    return false;                                                                                       // 811
                                                                                                        // 812
  var range;                                                                                            // 813
  if (compOrNode instanceof DomRange) {                                                                 // 814
    // Component                                                                                        // 815
    range = compOrNode;                                                                                 // 816
    var pn = range.parentNode();                                                                        // 817
    if (! pn)                                                                                           // 818
      return false;                                                                                     // 819
    // If parentNode is different, it must be a node                                                    // 820
    // we contain.                                                                                      // 821
    if (pn !== parentNode)                                                                              // 822
      return this.contains(pn);                                                                         // 823
    if (range === this)                                                                                 // 824
      return false; // don't contain self                                                               // 825
    // Ok, `range` is a same-parent range to see if we                                                  // 826
    // contain.                                                                                         // 827
  } else {                                                                                              // 828
    // Node                                                                                             // 829
    var node = compOrNode;                                                                              // 830
    if (! elementContains(parentNode, node))                                                            // 831
      return false;                                                                                     // 832
                                                                                                        // 833
    while (node.parentNode !== parentNode)                                                              // 834
      node = node.parentNode;                                                                           // 835
                                                                                                        // 836
    range = node.$ui;                                                                                   // 837
  }                                                                                                     // 838
                                                                                                        // 839
  // Now see if `range` is truthy and either `this`                                                     // 840
  // or an immediate subrange                                                                           // 841
                                                                                                        // 842
  while (range && range !== this)                                                                       // 843
    range = range.owner;                                                                                // 844
                                                                                                        // 845
  return range === this;                                                                                // 846
};                                                                                                      // 847
                                                                                                        // 848
DomRange.prototype.$ = function (selector) {                                                            // 849
  var self = this;                                                                                      // 850
                                                                                                        // 851
  var parentNode = this.parentNode();                                                                   // 852
  if (! parentNode)                                                                                     // 853
    throw new Error("Can't select in removed DomRange");                                                // 854
                                                                                                        // 855
  // Strategy: Find all selector matches under parentNode,                                              // 856
  // then filter out the ones that aren't in this DomRange                                              // 857
  // using upwards pointers ($ui, owner, parentNode).  This is                                          // 858
  // asymptotically slow in the presence of O(N) sibling                                                // 859
  // content that is under parentNode but not in our range,                                             // 860
  // so if performance is an issue, the selector should be                                              // 861
  // run on a child element.                                                                            // 862
                                                                                                        // 863
  // Since jQuery can't run selectors on a DocumentFragment,                                            // 864
  // we don't expect findBySelector to work.                                                            // 865
  if (parentNode.nodeType === 11 /* DocumentFragment */ ||                                              // 866
      parentNode.$_uiIsOffscreen)                                                                       // 867
    throw new Error("Can't use $ on an offscreen component");                                           // 868
                                                                                                        // 869
  var results = DomBackend.findBySelector(selector, parentNode);                                        // 870
                                                                                                        // 871
  // We don't assume `results` has jQuery API; a plain array                                            // 872
  // should do just as well.  However, if we do have a jQuery                                           // 873
  // array, we want to end up with one also, so we use                                                  // 874
  // `.filter`.                                                                                         // 875
                                                                                                        // 876
                                                                                                        // 877
  // Function that selects only elements that are actually                                              // 878
  // in this DomRange, rather than simply descending from                                               // 879
  // `parentNode`.                                                                                      // 880
  var filterFunc = function (elem) {                                                                    // 881
    // handle jQuery's arguments to filter, where the node                                              // 882
    // is in `this` and the index is the first argument.                                                // 883
    if (typeof elem === 'number')                                                                       // 884
      elem = this;                                                                                      // 885
                                                                                                        // 886
    return self.contains(elem);                                                                         // 887
  };                                                                                                    // 888
                                                                                                        // 889
  if (! results.filter) {                                                                               // 890
    // not a jQuery array, and not a browser with                                                       // 891
    // Array.prototype.filter (e.g. IE <9)                                                              // 892
    var newResults = [];                                                                                // 893
    for (var i = 0; i < results.length; i++) {                                                          // 894
      var x = results[i];                                                                               // 895
      if (filterFunc(x))                                                                                // 896
        newResults.push(x);                                                                             // 897
    }                                                                                                   // 898
    results = newResults;                                                                               // 899
  } else {                                                                                              // 900
    // `results.filter` is either jQuery's or ECMAScript's `filter`                                     // 901
    results = results.filter(filterFunc);                                                               // 902
  }                                                                                                     // 903
                                                                                                        // 904
  return results;                                                                                       // 905
};                                                                                                      // 906
                                                                                                        // 907
                                                                                                        // 908
///// EVENTS                                                                                            // 909
                                                                                                        // 910
// List of events to always delegate, never capture.                                                    // 911
// Since jQuery fakes bubbling for certain events in                                                    // 912
// certain browsers (like `submit`), we don't want to                                                   // 913
// get in its way.                                                                                      // 914
//                                                                                                      // 915
// We could list all known bubbling                                                                     // 916
// events here to avoid creating speculative capturers                                                  // 917
// for them, but it would only be an optimization.                                                      // 918
var eventsToDelegate = {                                                                                // 919
  blur: 1, change: 1, click: 1, focus: 1, focusin: 1,                                                   // 920
  focusout: 1, reset: 1, submit: 1                                                                      // 921
};                                                                                                      // 922
                                                                                                        // 923
var EVENT_MODE_TBD = 0;                                                                                 // 924
var EVENT_MODE_BUBBLING = 1;                                                                            // 925
var EVENT_MODE_CAPTURING = 2;                                                                           // 926
                                                                                                        // 927
var HandlerRec = function (elem, type, selector, handler, $ui) {                                        // 928
  this.elem = elem;                                                                                     // 929
  this.type = type;                                                                                     // 930
  this.selector = selector;                                                                             // 931
  this.handler = handler;                                                                               // 932
  this.$ui = $ui;                                                                                       // 933
                                                                                                        // 934
  this.mode = EVENT_MODE_TBD;                                                                           // 935
                                                                                                        // 936
  // It's important that delegatedHandler be a different                                                // 937
  // instance for each handlerRecord, because its identity                                              // 938
  // is used to remove it.                                                                              // 939
  //                                                                                                    // 940
  // It's also important that the closure have access to                                                // 941
  // `this` when it is not called with it set.                                                          // 942
  this.delegatedHandler = (function (h) {                                                               // 943
    return function (evt) {                                                                             // 944
      if ((! h.selector) && evt.currentTarget !== evt.target)                                           // 945
        // no selector means only fire on target                                                        // 946
        return;                                                                                         // 947
      if (! h.$ui.contains(evt.currentTarget))                                                          // 948
        return;                                                                                         // 949
      return h.handler.call(h.$ui, evt);                                                                // 950
    };                                                                                                  // 951
  })(this);                                                                                             // 952
                                                                                                        // 953
  // WHY CAPTURE AND DELEGATE: jQuery can't delegate                                                    // 954
  // non-bubbling events, because                                                                       // 955
  // event capture doesn't work in IE 8.  However, there                                                // 956
  // are all sorts of new-fangled non-bubbling events                                                   // 957
  // like "play" and "touchenter".  We delegate these                                                   // 958
  // events using capture in all browsers except IE 8.                                                  // 959
  // IE 8 doesn't support these events anyway.                                                          // 960
                                                                                                        // 961
  var tryCapturing = elem.addEventListener &&                                                           // 962
        (! eventsToDelegate.hasOwnProperty(                                                             // 963
          DomBackend.parseEventType(type)));                                                            // 964
                                                                                                        // 965
  if (tryCapturing) {                                                                                   // 966
    this.capturingHandler = (function (h) {                                                             // 967
      return function (evt) {                                                                           // 968
        if (h.mode === EVENT_MODE_TBD) {                                                                // 969
          // must be first time we're called.                                                           // 970
          if (evt.bubbles) {                                                                            // 971
            // this type of event bubbles, so don't                                                     // 972
            // get called again.                                                                        // 973
            h.mode = EVENT_MODE_BUBBLING;                                                               // 974
            DomBackend.unbindEventCapturer(                                                             // 975
              h.elem, h.type, h.capturingHandler);                                                      // 976
            return;                                                                                     // 977
          } else {                                                                                      // 978
            // this type of event doesn't bubble,                                                       // 979
            // so unbind the delegation, preventing                                                     // 980
            // it from ever firing.                                                                     // 981
            h.mode = EVENT_MODE_CAPTURING;                                                              // 982
            DomBackend.undelegateEvents(                                                                // 983
              h.elem, h.type, h.delegatedHandler);                                                      // 984
          }                                                                                             // 985
        }                                                                                               // 986
                                                                                                        // 987
        h.delegatedHandler(evt);                                                                        // 988
      };                                                                                                // 989
    })(this);                                                                                           // 990
                                                                                                        // 991
  } else {                                                                                              // 992
    this.mode = EVENT_MODE_BUBBLING;                                                                    // 993
  }                                                                                                     // 994
};                                                                                                      // 995
                                                                                                        // 996
HandlerRec.prototype.bind = function () {                                                               // 997
  // `this.mode` may be EVENT_MODE_TBD, in which case we bind both. in                                  // 998
  // this case, 'capturingHandler' is in charge of detecting the                                        // 999
  // correct mode and turning off one or the other handlers.                                            // 1000
  if (this.mode !== EVENT_MODE_BUBBLING) {                                                              // 1001
    DomBackend.bindEventCapturer(                                                                       // 1002
      this.elem, this.type, this.selector || '*',                                                       // 1003
      this.capturingHandler);                                                                           // 1004
  }                                                                                                     // 1005
                                                                                                        // 1006
  if (this.mode !== EVENT_MODE_CAPTURING)                                                               // 1007
    DomBackend.delegateEvents(                                                                          // 1008
      this.elem, this.type,                                                                             // 1009
      this.selector || '*', this.delegatedHandler);                                                     // 1010
};                                                                                                      // 1011
                                                                                                        // 1012
HandlerRec.prototype.unbind = function () {                                                             // 1013
  if (this.mode !== EVENT_MODE_BUBBLING)                                                                // 1014
    DomBackend.unbindEventCapturer(this.elem, this.type,                                                // 1015
                                   this.capturingHandler);                                              // 1016
                                                                                                        // 1017
  if (this.mode !== EVENT_MODE_CAPTURING)                                                               // 1018
    DomBackend.undelegateEvents(this.elem, this.type,                                                   // 1019
                                this.delegatedHandler);                                                 // 1020
};                                                                                                      // 1021
                                                                                                        // 1022
                                                                                                        // 1023
// XXX could write the form of arguments for this function                                              // 1024
// in several different ways, including simply as an event map.                                         // 1025
DomRange.prototype.on = function (events, selector, handler) {                                          // 1026
  var parentNode = this.parentNode();                                                                   // 1027
  if (! parentNode)                                                                                     // 1028
    // if we're not in the DOM, silently fail.                                                          // 1029
    return;                                                                                             // 1030
  // haven't been added yet; error                                                                      // 1031
  if (parentNode.$_uiIsOffscreen)                                                                       // 1032
    throw new Error("Can't bind events before DomRange is inserted");                                   // 1033
                                                                                                        // 1034
  var eventTypes = [];                                                                                  // 1035
  events.replace(/[^ /]+/g, function (e) {                                                              // 1036
    eventTypes.push(e);                                                                                 // 1037
  });                                                                                                   // 1038
                                                                                                        // 1039
  if (! handler && (typeof selector === 'function')) {                                                  // 1040
    // omitted `selector`                                                                               // 1041
    handler = selector;                                                                                 // 1042
    selector = null;                                                                                    // 1043
  } else if (! selector) {                                                                              // 1044
    // take `""` to `null`                                                                              // 1045
    selector = null;                                                                                    // 1046
  }                                                                                                     // 1047
                                                                                                        // 1048
  for (var i = 0, N = eventTypes.length; i < N; i++) {                                                  // 1049
    var type = eventTypes[i];                                                                           // 1050
                                                                                                        // 1051
    var eventDict = parentNode.$_uievents;                                                              // 1052
    if (! eventDict)                                                                                    // 1053
      eventDict = (parentNode.$_uievents = {});                                                         // 1054
                                                                                                        // 1055
    var info = eventDict[type];                                                                         // 1056
    if (! info) {                                                                                       // 1057
      info = eventDict[type] = {};                                                                      // 1058
      info.handlers = [];                                                                               // 1059
    }                                                                                                   // 1060
    var handlerList = info.handlers;                                                                    // 1061
    var handlerRec = new HandlerRec(                                                                    // 1062
      parentNode, type, selector, handler, this);                                                       // 1063
    handlerRec.bind();                                                                                  // 1064
    handlerList.push(handlerRec);                                                                       // 1065
    // move handlers of enclosing ranges to end                                                         // 1066
    for (var r = this.owner; r; r = r.owner) {                                                          // 1067
      // r is an enclosing DomRange                                                                     // 1068
      for (var j = 0, Nj = handlerList.length;                                                          // 1069
           j < Nj; j++) {                                                                               // 1070
        var h = handlerList[j];                                                                         // 1071
        if (h.$ui === r) {                                                                              // 1072
          h.unbind();                                                                                   // 1073
          h.bind();                                                                                     // 1074
          handlerList.splice(j, 1); // remove handlerList[j]                                            // 1075
          handlerList.push(h);                                                                          // 1076
          j--; // account for removed handler                                                           // 1077
          Nj--; // don't visit appended handlers                                                        // 1078
        }                                                                                               // 1079
      }                                                                                                 // 1080
    }                                                                                                   // 1081
  }                                                                                                     // 1082
};                                                                                                      // 1083
                                                                                                        // 1084
  // Returns true if element a contains node b and is not node b.                                       // 1085
  var elementContains = function (a, b) {                                                               // 1086
    if (a.nodeType !== 1) // ELEMENT                                                                    // 1087
      return false;                                                                                     // 1088
    if (a === b)                                                                                        // 1089
      return false;                                                                                     // 1090
                                                                                                        // 1091
    if (a.compareDocumentPosition) {                                                                    // 1092
      return a.compareDocumentPosition(b) & 0x10;                                                       // 1093
    } else {                                                                                            // 1094
          // Should be only old IE and maybe other old browsers here.                                   // 1095
          // Modern Safari has both functions but seems to get contains() wrong.                        // 1096
          // IE can't handle b being a text node.  We work around this                                  // 1097
          // by doing a direct parent test now.                                                         // 1098
      b = b.parentNode;                                                                                 // 1099
      if (! (b && b.nodeType === 1)) // ELEMENT                                                         // 1100
        return false;                                                                                   // 1101
      if (a === b)                                                                                      // 1102
        return true;                                                                                    // 1103
                                                                                                        // 1104
      return a.contains(b);                                                                             // 1105
    }                                                                                                   // 1106
  };                                                                                                    // 1107
                                                                                                        // 1108
                                                                                                        // 1109
UI.DomRange = DomRange;                                                                                 // 1110
                                                                                                        // 1111
//////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
// packages/ui/attrs.js                                                                                 //
//                                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                        //
                                                                                                        // 1
// An AttributeHandler object is responsible for updating a particular attribute                        // 2
// of a particular element.  AttributeHandler subclasses implement                                      // 3
// browser-specific logic for dealing with particular attributes across                                 // 4
// different browsers.                                                                                  // 5
//                                                                                                      // 6
// To define a new type of AttributeHandler, use                                                        // 7
// `var FooHandler = AttributeHandler.extend({ update: function ... })`                                 // 8
// where the `update` function takes arguments `(element, oldValue, value)`.                            // 9
// The `element` argument is always the same between calls to `update` on                               // 10
// the same instance.  `oldValue` and `value` are each either `null` or                                 // 11
// a Unicode string of the type that might be passed to the value argument                              // 12
// of `setAttribute` (i.e. not an HTML string with character references).                               // 13
// When an AttributeHandler is installed, an initial call to `update` is                                // 14
// always made with `oldValue = null`.  The `update` method can access                                  // 15
// `this.name` if the AttributeHandler class is a generic one that applies                              // 16
// to multiple attribute names.                                                                         // 17
//                                                                                                      // 18
// AttributeHandlers can store custom properties on `this`, as long as they                             // 19
// don't use the names `element`, `name`, `value`, and `oldValue`.                                      // 20
//                                                                                                      // 21
// AttributeHandlers can't influence how attributes appear in rendered HTML,                            // 22
// only how they are updated after materialization as DOM.                                              // 23
                                                                                                        // 24
AttributeHandler = function (name, value) {                                                             // 25
  this.name = name;                                                                                     // 26
  this.value = value;                                                                                   // 27
};                                                                                                      // 28
                                                                                                        // 29
_.extend(AttributeHandler.prototype, {                                                                  // 30
  update: function (element, oldValue, value) {                                                         // 31
    if (value === null) {                                                                               // 32
      if (oldValue !== null)                                                                            // 33
        element.removeAttribute(this.name);                                                             // 34
    } else {                                                                                            // 35
      element.setAttribute(this.name, this.value);                                                      // 36
    }                                                                                                   // 37
  }                                                                                                     // 38
});                                                                                                     // 39
                                                                                                        // 40
AttributeHandler.extend = function (options) {                                                          // 41
  var curType = this;                                                                                   // 42
  var subType = function AttributeHandlerSubtype(/*arguments*/) {                                       // 43
    AttributeHandler.apply(this, arguments);                                                            // 44
  };                                                                                                    // 45
  subType.prototype = new curType;                                                                      // 46
  subType.extend = curType.extend;                                                                      // 47
  if (options)                                                                                          // 48
    _.extend(subType.prototype, options);                                                               // 49
  return subType;                                                                                       // 50
};                                                                                                      // 51
                                                                                                        // 52
// Extended below to support both regular and SVG elements                                              // 53
var BaseClassHandler = AttributeHandler.extend({                                                        // 54
  update: function (element, oldValue, value) {                                                         // 55
    if (!this.getCurrentValue || !this.setValue)                                                        // 56
      throw new Error("Missing methods in subclass of 'BaseClassHandler'");                             // 57
                                                                                                        // 58
    var oldClasses = oldValue ? _.compact(oldValue.split(' ')) : [];                                    // 59
    var newClasses = value ? _.compact(value.split(' ')) : [];                                          // 60
                                                                                                        // 61
    // the current classes on the element, which we will mutate.                                        // 62
    var classes = _.compact(this.getCurrentValue(element).split(' '));                                  // 63
                                                                                                        // 64
    // optimize this later (to be asymptotically faster) if necessary                                   // 65
    _.each(oldClasses, function (c) {                                                                   // 66
      if (_.indexOf(newClasses, c) < 0)                                                                 // 67
        classes = _.without(classes, c);                                                                // 68
    });                                                                                                 // 69
    _.each(newClasses, function (c) {                                                                   // 70
      if (_.indexOf(oldClasses, c) < 0 &&                                                               // 71
          _.indexOf(classes, c) < 0)                                                                    // 72
        classes.push(c);                                                                                // 73
    });                                                                                                 // 74
                                                                                                        // 75
    this.setValue(element, classes.join(' '));                                                          // 76
  }                                                                                                     // 77
});                                                                                                     // 78
                                                                                                        // 79
var ClassHandler = BaseClassHandler.extend({                                                            // 80
  // @param rawValue {String}                                                                           // 81
  getCurrentValue: function (element) {                                                                 // 82
    return element.className;                                                                           // 83
  },                                                                                                    // 84
  setValue: function (element, className) {                                                             // 85
    element.className = className;                                                                      // 86
  }                                                                                                     // 87
});                                                                                                     // 88
                                                                                                        // 89
var SVGClassHandler = BaseClassHandler.extend({                                                         // 90
  getCurrentValue: function (element) {                                                                 // 91
    return element.className.baseVal;                                                                   // 92
  },                                                                                                    // 93
  setValue: function (element, className) {                                                             // 94
    element.setAttribute('class', className);                                                           // 95
  }                                                                                                     // 96
});                                                                                                     // 97
                                                                                                        // 98
var BooleanHandler = AttributeHandler.extend({                                                          // 99
  update: function (element, oldValue, value) {                                                         // 100
    var focused = this.focused(element);                                                                // 101
                                                                                                        // 102
    if (!focused) {                                                                                     // 103
      var name = this.name;                                                                             // 104
      if (value == null) {                                                                              // 105
        if (oldValue != null)                                                                           // 106
          element[name] = false;                                                                        // 107
      } else {                                                                                          // 108
        element[name] = true;                                                                           // 109
      }                                                                                                 // 110
    }                                                                                                   // 111
  },                                                                                                    // 112
  // is the element part of a control which is focused?                                                 // 113
  focused: function (element) {                                                                         // 114
    if (element.tagName === 'INPUT') {                                                                  // 115
      return element === document.activeElement;                                                        // 116
                                                                                                        // 117
    } else if (element.tagName === 'OPTION') {                                                          // 118
      // find the containing SELECT element, on which focus                                             // 119
      // is actually set                                                                                // 120
      var selectEl = element;                                                                           // 121
      while (selectEl && selectEl.tagName !== 'SELECT')                                                 // 122
        selectEl = selectEl.parentNode;                                                                 // 123
                                                                                                        // 124
      if (selectEl)                                                                                     // 125
        return selectEl === document.activeElement;                                                     // 126
      else                                                                                              // 127
        return false;                                                                                   // 128
    } else {                                                                                            // 129
      throw new Error("Expected INPUT or OPTION element");                                              // 130
    }                                                                                                   // 131
  }                                                                                                     // 132
});                                                                                                     // 133
                                                                                                        // 134
var ValueHandler = AttributeHandler.extend({                                                            // 135
  update: function (element, oldValue, value) {                                                         // 136
    var focused = (element === document.activeElement);                                                 // 137
                                                                                                        // 138
    if (!focused)                                                                                       // 139
      element.value = value;                                                                            // 140
  }                                                                                                     // 141
});                                                                                                     // 142
                                                                                                        // 143
// attributes of the type 'xlink:something' should be set using                                         // 144
// the correct namespace in order to work                                                               // 145
var XlinkHandler = AttributeHandler.extend({                                                            // 146
  update: function(element, oldValue, value) {                                                          // 147
    var NS = 'http://www.w3.org/1999/xlink';                                                            // 148
    if (value === null) {                                                                               // 149
      if (oldValue !== null)                                                                            // 150
        element.removeAttributeNS(NS, this.name);                                                       // 151
    } else {                                                                                            // 152
      element.setAttributeNS(NS, this.name, this.value);                                                // 153
    }                                                                                                   // 154
  }                                                                                                     // 155
});                                                                                                     // 156
                                                                                                        // 157
// cross-browser version of `instanceof SVGElement`                                                     // 158
var isSVGElement = function (elem) {                                                                    // 159
  return 'ownerSVGElement' in elem;                                                                     // 160
};                                                                                                      // 161
                                                                                                        // 162
// XXX make it possible for users to register attribute handlers!                                       // 163
makeAttributeHandler = function (elem, name, value) {                                                   // 164
  // generally, use setAttribute but certain attributes need to be set                                  // 165
  // by directly setting a JavaScript property on the DOM element.                                      // 166
  if (name === 'class') {                                                                               // 167
    if (isSVGElement(elem)) {                                                                           // 168
      return new SVGClassHandler(name, value);                                                          // 169
    } else {                                                                                            // 170
      return new ClassHandler(name, value);                                                             // 171
    }                                                                                                   // 172
  } else if ((elem.tagName === 'OPTION' && name === 'selected') ||                                      // 173
             (elem.tagName === 'INPUT' && name === 'checked')) {                                        // 174
    return new BooleanHandler(name, value);                                                             // 175
  } else if ((elem.tagName === 'TEXTAREA' || elem.tagName === 'INPUT')                                  // 176
             && name === 'value') {                                                                     // 177
    // internally, TEXTAREAs tracks their value in the 'value'                                          // 178
    // attribute just like INPUTs.                                                                      // 179
    return new ValueHandler(name, value);                                                               // 180
  } else if (name.substring(0,6) === 'xlink:') {                                                        // 181
    return new XlinkHandler(name.substring(6), value);                                                  // 182
  } else {                                                                                              // 183
    return new AttributeHandler(name, value);                                                           // 184
  }                                                                                                     // 185
                                                                                                        // 186
  // XXX will need one for 'style' on IE, though modern browsers                                        // 187
  // seem to handle setAttribute ok.                                                                    // 188
};                                                                                                      // 189
                                                                                                        // 190
//////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
// packages/ui/render.js                                                                                //
//                                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                        //
                                                                                                        // 1
UI.Component.instantiate = function (parent) {                                                          // 2
  var kind = this;                                                                                      // 3
                                                                                                        // 4
  // check arguments                                                                                    // 5
  if (UI.isComponent(kind)) {                                                                           // 6
    if (kind.isInited)                                                                                  // 7
      throw new Error("A component kind is required, not an instance");                                 // 8
  } else {                                                                                              // 9
    throw new Error("Expected Component kind");                                                         // 10
  }                                                                                                     // 11
                                                                                                        // 12
  var inst = kind.extend(); // XXX args go here                                                         // 13
  inst.isInited = true;                                                                                 // 14
                                                                                                        // 15
  // XXX messy to define this here                                                                      // 16
  inst.templateInstance = {                                                                             // 17
    findAll: function (selector) {                                                                      // 18
      // XXX check that `.dom` exists here?                                                             // 19
      return inst.dom.$(selector);                                                                      // 20
    },                                                                                                  // 21
    find: function (selector) {                                                                         // 22
      var result = this.findAll(selector);                                                              // 23
      return result[0] || null;                                                                         // 24
    },                                                                                                  // 25
    firstNode: null,                                                                                    // 26
    lastNode: null,                                                                                     // 27
    data: null,                                                                                         // 28
    __component__: inst                                                                                 // 29
  };                                                                                                    // 30
  inst.templateInstance.$ = inst.templateInstance.findAll;                                              // 31
                                                                                                        // 32
  inst.parent = (parent || null);                                                                       // 33
                                                                                                        // 34
  if (inst.init)                                                                                        // 35
    inst.init();                                                                                        // 36
                                                                                                        // 37
  if (inst.created) {                                                                                   // 38
    updateTemplateInstance(inst);                                                                       // 39
    inst.created.call(inst.templateInstance);                                                           // 40
  }                                                                                                     // 41
                                                                                                        // 42
  return inst;                                                                                          // 43
};                                                                                                      // 44
                                                                                                        // 45
UI.Component.render = function () {                                                                     // 46
  return null;                                                                                          // 47
};                                                                                                      // 48
                                                                                                        // 49
var Box = function (func, equals) {                                                                     // 50
  var self = this;                                                                                      // 51
                                                                                                        // 52
  self.func = func;                                                                                     // 53
  self.equals = equals;                                                                                 // 54
                                                                                                        // 55
  self.curResult = null;                                                                                // 56
                                                                                                        // 57
  self.dep = new Deps.Dependency;                                                                       // 58
                                                                                                        // 59
  self.resultComputation = Deps.nonreactive(function () {                                               // 60
    return Deps.autorun(function (c) {                                                                  // 61
      var func = self.func;                                                                             // 62
                                                                                                        // 63
      var newResult = func();                                                                           // 64
                                                                                                        // 65
      if (! c.firstRun) {                                                                               // 66
        var equals = self.equals;                                                                       // 67
        var oldResult = self.curResult;                                                                 // 68
                                                                                                        // 69
        if (equals ? equals(newResult, oldResult) :                                                     // 70
            newResult === oldResult) {                                                                  // 71
          // same as last time                                                                          // 72
          return;                                                                                       // 73
        }                                                                                               // 74
      }                                                                                                 // 75
                                                                                                        // 76
      self.curResult = newResult;                                                                       // 77
      self.dep.changed();                                                                               // 78
    });                                                                                                 // 79
  });                                                                                                   // 80
};                                                                                                      // 81
                                                                                                        // 82
Box.prototype.stop = function () {                                                                      // 83
  this.resultComputation.stop();                                                                        // 84
};                                                                                                      // 85
                                                                                                        // 86
Box.prototype.get = function () {                                                                       // 87
  if (Deps.active && ! this.resultComputation.stopped)                                                  // 88
    this.dep.depend();                                                                                  // 89
                                                                                                        // 90
  return this.curResult;                                                                                // 91
};                                                                                                      // 92
                                                                                                        // 93
// Takes a reactive function (call it `inner`) and returns a reactive function                          // 94
// `outer` which is equivalent except in its reactive behavior.  Specifically,                          // 95
// `outer` has the following two special properties:                                                    // 96
//                                                                                                      // 97
// 1. Isolation:  An invocation of `outer()` only invalidates its context                               // 98
//    when the value of `inner()` changes.  For example, `inner` may be a                               // 99
//    function that gets one or more Session variables and calculates a                                 // 100
//    true/false value.  `outer` blocks invalidation signals caused by the                              // 101
//    Session variables changing and sends a signal out only when the value                             // 102
//    changes between true and false (in this example).  The value can be                               // 103
//    of any type, and it is compared with `===` unless an `equals` function                            // 104
//    is provided.                                                                                      // 105
//                                                                                                      // 106
// 2. Value Sharing:  The `outer` function returned by `emboxValue` can be                              // 107
//    shared between different contexts, for example by assigning it to an                              // 108
//    object as a method that can be accessed at any time, such as by                                   // 109
//    different templates or different parts of a template.  No matter                                  // 110
//    how many times `outer` is called, `inner` is only called once until                               // 111
//    it changes.  The most recent value is stored internally.                                          // 112
//                                                                                                      // 113
// Conceptually, an emboxed value is much like a Session variable which is                              // 114
// kept up to date by an autorun.  Session variables provide storage                                    // 115
// (value sharing) and they don't notify their listeners unless a value                                 // 116
// actually changes (isolation).  The biggest difference is that such an                                // 117
// autorun would never be stopped, and the Session variable would never be                              // 118
// deleted even if it wasn't used any more.  An emboxed value, on the other                             // 119
// hand, automatically stops computing when it's not being used, and starts                             // 120
// again when called from a reactive context.  This means that when it stops                            // 121
// being used, it can be completely garbage-collected.                                                  // 122
//                                                                                                      // 123
// If a non-function value is supplied to `emboxValue` instead of a reactive                            // 124
// function, then `outer` is still a function but it simply returns the value.                          // 125
//                                                                                                      // 126
UI.emboxValue = function (funcOrValue, equals) {                                                        // 127
  if (typeof funcOrValue === 'function') {                                                              // 128
                                                                                                        // 129
    var func = funcOrValue;                                                                             // 130
    var box = new Box(func, equals);                                                                    // 131
                                                                                                        // 132
    var f = function () {                                                                               // 133
      return box.get();                                                                                 // 134
    };                                                                                                  // 135
                                                                                                        // 136
    f.stop = function () {                                                                              // 137
      box.stop();                                                                                       // 138
    };                                                                                                  // 139
                                                                                                        // 140
    return f;                                                                                           // 141
                                                                                                        // 142
  } else {                                                                                              // 143
    var value = funcOrValue;                                                                            // 144
    var result = function () {                                                                          // 145
      return value;                                                                                     // 146
    };                                                                                                  // 147
    result._isEmboxedConstant = true;                                                                   // 148
    return result;                                                                                      // 149
  }                                                                                                     // 150
};                                                                                                      // 151
                                                                                                        // 152
                                                                                                        // 153
UI.namedEmboxValue = function (name, funcOrValue, equals) {                                             // 154
  if (! Deps.active) {                                                                                  // 155
    var f = UI.emboxValue(funcOrValue, equals);                                                         // 156
    f.stop();                                                                                           // 157
    return f;                                                                                           // 158
  }                                                                                                     // 159
                                                                                                        // 160
  var c = Deps.currentComputation;                                                                      // 161
  if (! c[name])                                                                                        // 162
    c[name] = UI.emboxValue(funcOrValue, equals);                                                       // 163
                                                                                                        // 164
  return c[name];                                                                                       // 165
};                                                                                                      // 166
                                                                                                        // 167
////////////////////////////////////////                                                                // 168
                                                                                                        // 169
UI.insert = function (renderedTemplate, parentElement, nextNode) {                                      // 170
  if (! renderedTemplate.dom)                                                                           // 171
    throw new Error("Expected template rendered with UI.render");                                       // 172
                                                                                                        // 173
  UI.DomRange.insert(renderedTemplate.dom, parentElement, nextNode);                                    // 174
};                                                                                                      // 175
                                                                                                        // 176
// Insert a DOM node or DomRange into a DOM element or DomRange.                                        // 177
//                                                                                                      // 178
// One of three things happens depending on what needs to be inserted into what:                        // 179
// - `range.add` (anything into DomRange)                                                               // 180
// - `UI.DomRange.insert` (DomRange into element)                                                       // 181
// - `elem.insertBefore` (node into element)                                                            // 182
//                                                                                                      // 183
// The optional `before` argument is an existing node or id to insert before in                         // 184
// the parent element or DomRange.                                                                      // 185
var insert = function (nodeOrRange, parent, before) {                                                   // 186
  if (! parent)                                                                                         // 187
    throw new Error("Materialization parent required");                                                 // 188
                                                                                                        // 189
  if (parent instanceof UI.DomRange) {                                                                  // 190
    parent.add(nodeOrRange, before);                                                                    // 191
  } else if (nodeOrRange instanceof UI.DomRange) {                                                      // 192
    // parent is an element; inserting a range                                                          // 193
    UI.DomRange.insert(nodeOrRange, parent, before);                                                    // 194
  } else {                                                                                              // 195
    // parent is an element; inserting an element                                                       // 196
    parent.insertBefore(nodeOrRange, before || null); // `null` for IE                                  // 197
  }                                                                                                     // 198
};                                                                                                      // 199
                                                                                                        // 200
// Update attributes on `elem` to the dictionary `attrs`, using the                                     // 201
// dictionary of existing `handlers` if provided.                                                       // 202
//                                                                                                      // 203
// Values in the `attrs` dictionary are in pseudo-DOM form -- a string,                                 // 204
// CharRef, or array of strings and CharRefs -- but they are passed to                                  // 205
// the AttributeHandler in string form.                                                                 // 206
var updateAttributes = function(elem, newAttrs, handlers) {                                             // 207
                                                                                                        // 208
  if (handlers) {                                                                                       // 209
    for (var k in handlers) {                                                                           // 210
      if (! newAttrs.hasOwnProperty(k)) {                                                               // 211
        // remove attributes (and handlers) for attribute names                                         // 212
        // that don't exist as keys of `newAttrs` and so won't                                          // 213
        // be visited when traversing it.  (Attributes that                                             // 214
        // exist in the `newAttrs` object but are `null`                                                // 215
        // are handled later.)                                                                          // 216
        var handler = handlers[k];                                                                      // 217
        var oldValue = handler.value;                                                                   // 218
        handler.value = null;                                                                           // 219
        handler.update(elem, oldValue, null);                                                           // 220
        delete handlers[k];                                                                             // 221
      }                                                                                                 // 222
    }                                                                                                   // 223
  }                                                                                                     // 224
                                                                                                        // 225
  for (var k in newAttrs) {                                                                             // 226
    var handler = null;                                                                                 // 227
    var oldValue;                                                                                       // 228
    var value = newAttrs[k];                                                                            // 229
    if ((! handlers) || (! handlers.hasOwnProperty(k))) {                                               // 230
      if (value !== null) {                                                                             // 231
        // make new handler                                                                             // 232
        handler = makeAttributeHandler(elem, k, value);                                                 // 233
        if (handlers)                                                                                   // 234
          handlers[k] = handler;                                                                        // 235
        oldValue = null;                                                                                // 236
      }                                                                                                 // 237
    } else {                                                                                            // 238
      handler = handlers[k];                                                                            // 239
      oldValue = handler.value;                                                                         // 240
    }                                                                                                   // 241
    if (handler && oldValue !== value) {                                                                // 242
      handler.value = value;                                                                            // 243
      handler.update(elem, oldValue, value);                                                            // 244
      if (value === null)                                                                               // 245
        delete handlers[k];                                                                             // 246
    }                                                                                                   // 247
  }                                                                                                     // 248
};                                                                                                      // 249
                                                                                                        // 250
UI.render = function (kind, parentComponent) {                                                          // 251
  if (kind.isInited)                                                                                    // 252
    throw new Error("Can't render component instance, only component kind");                            // 253
                                                                                                        // 254
  var inst, content, range;                                                                             // 255
                                                                                                        // 256
  Deps.nonreactive(function () {                                                                        // 257
                                                                                                        // 258
    inst = kind.instantiate(parentComponent);                                                           // 259
                                                                                                        // 260
    content = (inst.render && inst.render());                                                           // 261
                                                                                                        // 262
    range = new UI.DomRange;                                                                            // 263
    inst.dom = range;                                                                                   // 264
    range.component = inst;                                                                             // 265
                                                                                                        // 266
  });                                                                                                   // 267
                                                                                                        // 268
  materialize(content, range, null, inst);                                                              // 269
                                                                                                        // 270
  range.removed = function () {                                                                         // 271
    inst.isDestroyed = true;                                                                            // 272
    if (inst.destroyed) {                                                                               // 273
      Deps.nonreactive(function () {                                                                    // 274
        updateTemplateInstance(inst);                                                                   // 275
        inst.destroyed.call(inst.templateInstance);                                                     // 276
      });                                                                                               // 277
    }                                                                                                   // 278
  };                                                                                                    // 279
                                                                                                        // 280
  return inst;                                                                                          // 281
};                                                                                                      // 282
                                                                                                        // 283
UI.renderWithData = function (kind, data, parentComponent) {                                            // 284
  if (! UI.isComponent(kind))                                                                           // 285
    throw new Error("Component required here");                                                         // 286
  if (kind.isInited)                                                                                    // 287
    throw new Error("Can't render component instance, only component kind");                            // 288
  if (typeof data === 'function')                                                                       // 289
    throw new Error("Data argument can't be a function");                                               // 290
                                                                                                        // 291
  return UI.render(kind.extend({data: function () { return data; }}),                                   // 292
                   parentComponent);                                                                    // 293
};                                                                                                      // 294
                                                                                                        // 295
var contentEquals = function (a, b) {                                                                   // 296
  if (a instanceof HTML.Raw) {                                                                          // 297
    return (b instanceof HTML.Raw) && (a.value === b.value);                                            // 298
  } else if (a == null) {                                                                               // 299
    return (b == null);                                                                                 // 300
  } else {                                                                                              // 301
    return (a === b) &&                                                                                 // 302
      ((typeof a === 'number') || (typeof a === 'boolean') ||                                           // 303
       (typeof a === 'string'));                                                                        // 304
  }                                                                                                     // 305
};                                                                                                      // 306
                                                                                                        // 307
UI.InTemplateScope = function (tmplInstance, content) {                                                 // 308
  if (! (this instanceof UI.InTemplateScope))                                                           // 309
    // called without `new`                                                                             // 310
    return new UI.InTemplateScope(tmplInstance, content);                                               // 311
                                                                                                        // 312
  var parentPtr = tmplInstance.parent;                                                                  // 313
  if (parentPtr.__isTemplateWith)                                                                       // 314
    parentPtr = parentPtr.parent;                                                                       // 315
                                                                                                        // 316
  this.parentPtr = parentPtr;                                                                           // 317
  this.content = content;                                                                               // 318
};                                                                                                      // 319
                                                                                                        // 320
UI.InTemplateScope.prototype.toHTML = function (parentComponent) {                                      // 321
  return HTML.toHTML(this.content, this.parentPtr);                                                     // 322
};                                                                                                      // 323
                                                                                                        // 324
UI.InTemplateScope.prototype.toText = function (textMode, parentComponent) {                            // 325
  return HTML.toText(this.content, textMode, this.parentPtr);                                           // 326
};                                                                                                      // 327
                                                                                                        // 328
// Convert the pseudoDOM `node` into reactive DOM nodes and insert them                                 // 329
// into the element or DomRange `parent`, before the node or id `before`.                               // 330
var materialize = function (node, parent, before, parentComponent) {                                    // 331
  // XXX should do more error-checking for the case where user is supplying the tags.                   // 332
  // For example, check that CharRef has `html` and `str` properties and no content.                    // 333
  // Check that Comment has a single string child and no attributes.  Etc.                              // 334
                                                                                                        // 335
  if (node == null) {                                                                                   // 336
    // null or undefined.                                                                               // 337
    // do nothinge.                                                                                     // 338
  } else if ((typeof node === 'string') || (typeof node === 'boolean') || (typeof node === 'number')) { // 339
    node = String(node);                                                                                // 340
    insert(document.createTextNode(node), parent, before);                                              // 341
  } else if (node instanceof Array) {                                                                   // 342
    for (var i = 0; i < node.length; i++)                                                               // 343
      materialize(node[i], parent, before, parentComponent);                                            // 344
  } else if (typeof node === 'function') {                                                              // 345
                                                                                                        // 346
    var range = new UI.DomRange;                                                                        // 347
    var lastContent = null;                                                                             // 348
    var rangeUpdater = Deps.autorun(function (c) {                                                      // 349
      var content = node();                                                                             // 350
      // normalize content a little, for easier comparison                                              // 351
      if (HTML.isNully(content))                                                                        // 352
        content = null;                                                                                 // 353
      else if ((content instanceof Array) && content.length === 1)                                      // 354
        content = content[0];                                                                           // 355
                                                                                                        // 356
      // update if content is different from last time                                                  // 357
      if (! contentEquals(content, lastContent)) {                                                      // 358
        lastContent = content;                                                                          // 359
                                                                                                        // 360
        if (! c.firstRun)                                                                               // 361
          range.removeAll();                                                                            // 362
                                                                                                        // 363
        materialize(content, range, null, parentComponent);                                             // 364
      }                                                                                                 // 365
    });                                                                                                 // 366
    range.removed = function () {                                                                       // 367
      rangeUpdater.stop();                                                                              // 368
      if (node.stop)                                                                                    // 369
        node.stop();                                                                                    // 370
    };                                                                                                  // 371
    // XXXX HACK                                                                                        // 372
    if (Deps.active && node.stop) {                                                                     // 373
      Deps.onInvalidate(function () {                                                                   // 374
        node.stop();                                                                                    // 375
      });                                                                                               // 376
    }                                                                                                   // 377
    insert(range, parent, before);                                                                      // 378
  } else if (node instanceof HTML.Tag) {                                                                // 379
    var tagName = node.tagName;                                                                         // 380
    var elem;                                                                                           // 381
    if (HTML.isKnownSVGElement(tagName) && document.createElementNS) {                                  // 382
      elem = document.createElementNS('http://www.w3.org/2000/svg', tagName);                           // 383
    } else {                                                                                            // 384
      elem = document.createElement(node.tagName);                                                      // 385
    }                                                                                                   // 386
                                                                                                        // 387
    var rawAttrs = node.attrs;                                                                          // 388
    var children = node.children;                                                                       // 389
    if (node.tagName === 'textarea') {                                                                  // 390
      rawAttrs = (rawAttrs || {});                                                                      // 391
      rawAttrs.value = children;                                                                        // 392
      children = [];                                                                                    // 393
    };                                                                                                  // 394
                                                                                                        // 395
    if (rawAttrs) {                                                                                     // 396
      var attrUpdater = Deps.autorun(function (c) {                                                     // 397
        if (! c.handlers)                                                                               // 398
          c.handlers = {};                                                                              // 399
                                                                                                        // 400
        try {                                                                                           // 401
          var attrs = HTML.evaluateAttributes(rawAttrs, parentComponent);                               // 402
          var stringAttrs = {};                                                                         // 403
          if (attrs) {                                                                                  // 404
            for (var k in attrs) {                                                                      // 405
              stringAttrs[k] = HTML.toText(attrs[k], HTML.TEXTMODE.STRING,                              // 406
                                           parentComponent);                                            // 407
            }                                                                                           // 408
            updateAttributes(elem, stringAttrs, c.handlers);                                            // 409
          }                                                                                             // 410
        } catch (e) {                                                                                   // 411
          reportUIException(e);                                                                         // 412
        }                                                                                               // 413
      });                                                                                               // 414
      UI.DomBackend.onRemoveElement(elem, function () {                                                 // 415
        attrUpdater.stop();                                                                             // 416
      });                                                                                               // 417
    }                                                                                                   // 418
    materialize(children, elem, null, parentComponent);                                                 // 419
                                                                                                        // 420
    insert(elem, parent, before);                                                                       // 421
  } else if (typeof node.instantiate === 'function') {                                                  // 422
    // component                                                                                        // 423
    var instance = UI.render(node, parentComponent);                                                    // 424
                                                                                                        // 425
    // Call internal callback, which may take advantage of the current                                  // 426
    // Deps computation.                                                                                // 427
    if (instance.materialized)                                                                          // 428
      instance.materialized();                                                                          // 429
                                                                                                        // 430
    insert(instance.dom, parent, before);                                                               // 431
  } else if (node instanceof HTML.CharRef) {                                                            // 432
    insert(document.createTextNode(node.str), parent, before);                                          // 433
  } else if (node instanceof HTML.Comment) {                                                            // 434
    insert(document.createComment(node.sanitizedValue), parent, before);                                // 435
  } else if (node instanceof HTML.Raw) {                                                                // 436
    // Get an array of DOM nodes by using the browser's HTML parser                                     // 437
    // (like innerHTML).                                                                                // 438
    var htmlNodes = UI.DomBackend.parseHTML(node.value);                                                // 439
    for (var i = 0; i < htmlNodes.length; i++)                                                          // 440
      insert(htmlNodes[i], parent, before);                                                             // 441
  } else if (Package['html-tools'] && (node instanceof Package['html-tools'].HTMLTools.Special)) {      // 442
    throw new Error("Can't materialize Special tag, it's just an intermediate rep");                    // 443
  } else if (node instanceof UI.InTemplateScope) {                                                      // 444
    materialize(node.content, parent, before, node.parentPtr);                                          // 445
  } else {                                                                                              // 446
    // can't get here                                                                                   // 447
    throw new Error("Unexpected node in htmljs: " + node);                                              // 448
  }                                                                                                     // 449
};                                                                                                      // 450
                                                                                                        // 451
                                                                                                        // 452
                                                                                                        // 453
// XXX figure out the right names, and namespace, for these.                                            // 454
// for example, maybe some of them go in the HTML package.                                              // 455
UI.materialize = materialize;                                                                           // 456
                                                                                                        // 457
UI.body = UI.Component.extend({                                                                         // 458
  kind: 'body',                                                                                         // 459
  contentParts: [],                                                                                     // 460
  render: function () {                                                                                 // 461
    return this.contentParts;                                                                           // 462
  },                                                                                                    // 463
  // XXX revisit how body works.                                                                        // 464
  INSTANTIATED: false,                                                                                  // 465
  __helperHost: true                                                                                    // 466
});                                                                                                     // 467
                                                                                                        // 468
UI.block = function (renderFunc) {                                                                      // 469
  return UI.Component.extend({ render: renderFunc });                                                   // 470
};                                                                                                      // 471
                                                                                                        // 472
UI.toHTML = function (content, parentComponent) {                                                       // 473
  return HTML.toHTML(content, parentComponent);                                                         // 474
};                                                                                                      // 475
                                                                                                        // 476
UI.toRawText = function (content, parentComponent) {                                                    // 477
  return HTML.toText(content, HTML.TEXTMODE.STRING, parentComponent);                                   // 478
};                                                                                                      // 479
                                                                                                        // 480
//////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
// packages/ui/builtins.js                                                                              //
//                                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                        //
                                                                                                        // 1
UI.If = function (argFunc, contentBlock, elseContentBlock) {                                            // 2
  checkBlockHelperArguments('If', argFunc, contentBlock, elseContentBlock);                             // 3
                                                                                                        // 4
  var f = function () {                                                                                 // 5
    var emboxedCondition = emboxCondition(argFunc);                                                     // 6
    f.stop = function () {                                                                              // 7
      emboxedCondition.stop();                                                                          // 8
    };                                                                                                  // 9
    if (emboxedCondition())                                                                             // 10
      return contentBlock;                                                                              // 11
    else                                                                                                // 12
      return elseContentBlock || null;                                                                  // 13
  };                                                                                                    // 14
                                                                                                        // 15
  return f;                                                                                             // 16
};                                                                                                      // 17
                                                                                                        // 18
                                                                                                        // 19
UI.Unless = function (argFunc, contentBlock, elseContentBlock) {                                        // 20
  checkBlockHelperArguments('Unless', argFunc, contentBlock, elseContentBlock);                         // 21
                                                                                                        // 22
  var f = function () {                                                                                 // 23
    var emboxedCondition = emboxCondition(argFunc);                                                     // 24
    f.stop = function () {                                                                              // 25
      emboxedCondition.stop();                                                                          // 26
    };                                                                                                  // 27
    if (! emboxedCondition())                                                                           // 28
      return contentBlock;                                                                              // 29
    else                                                                                                // 30
      return elseContentBlock || null;                                                                  // 31
  };                                                                                                    // 32
                                                                                                        // 33
  return f;                                                                                             // 34
};                                                                                                      // 35
                                                                                                        // 36
// Returns true if `a` and `b` are `===`, unless they are of a mutable type.                            // 37
// (Because then, they may be equal references to an object that was mutated,                           // 38
// and we'll never know.  We save only a reference to the old object; we don't                          // 39
// do any deep-copying or diffing.)                                                                     // 40
var safeEquals = function (a, b) {                                                                      // 41
  if (a !== b)                                                                                          // 42
    return false;                                                                                       // 43
  else                                                                                                  // 44
    return ((!a) || (typeof a === 'number') || (typeof a === 'boolean') ||                              // 45
            (typeof a === 'string'));                                                                   // 46
};                                                                                                      // 47
                                                                                                        // 48
// Unlike Spacebars.With, there's no else case and no conditional logic.                                // 49
//                                                                                                      // 50
// We don't do any reactive emboxing of `argFunc` here; it should be done                               // 51
// by the caller if efficiency and/or number of calls to the data source                                // 52
// is important.                                                                                        // 53
UI.With = function (argFunc, contentBlock) {                                                            // 54
  checkBlockHelperArguments('With', argFunc, contentBlock);                                             // 55
                                                                                                        // 56
  var block = contentBlock;                                                                             // 57
  if ('data' in block) {                                                                                // 58
    // XXX TODO: get religion about where `data` property goes                                          // 59
    block = UI.block(function () {                                                                      // 60
      return contentBlock;                                                                              // 61
    });                                                                                                 // 62
  }                                                                                                     // 63
                                                                                                        // 64
  block.data = function () {                                                                            // 65
    throw new Error("Can't get data for component kind");                                               // 66
  };                                                                                                    // 67
                                                                                                        // 68
  block.init = function () {                                                                            // 69
    this.data = UI.emboxValue(argFunc, safeEquals);                                                     // 70
  };                                                                                                    // 71
                                                                                                        // 72
  block.materialized = function () {                                                                    // 73
    var self = this;                                                                                    // 74
    if (Deps.active) {                                                                                  // 75
      Deps.onInvalidate(function () {                                                                   // 76
        self.data.stop();                                                                               // 77
      });                                                                                               // 78
    }                                                                                                   // 79
  };                                                                                                    // 80
  block.materialized.isWith = true;                                                                     // 81
                                                                                                        // 82
  return block;                                                                                         // 83
};                                                                                                      // 84
                                                                                                        // 85
UI.Each = function (argFunc, contentBlock, elseContentBlock) {                                          // 86
  checkBlockHelperArguments('Each', argFunc, contentBlock, elseContentBlock);                           // 87
                                                                                                        // 88
  return UI.EachImpl.extend({                                                                           // 89
    __sequence: argFunc,                                                                                // 90
    __content: contentBlock,                                                                            // 91
    __elseContent: elseContentBlock                                                                     // 92
  });                                                                                                   // 93
};                                                                                                      // 94
                                                                                                        // 95
var checkBlockHelperArguments = function (which, argFunc, contentBlock, elseContentBlock) {             // 96
  if (typeof argFunc !== 'function')                                                                    // 97
    throw new Error('First argument to ' + which + ' must be a function');                              // 98
  if (! UI.isComponent(contentBlock))                                                                   // 99
    throw new Error('Second argument to ' + which + ' must be a template or UI.block');                 // 100
  if (elseContentBlock && ! UI.isComponent(elseContentBlock))                                           // 101
    throw new Error('Third argument to ' + which + ' must be a template or UI.block if present');       // 102
};                                                                                                      // 103
                                                                                                        // 104
// Returns a function that computes `!! conditionFunc()` except:                                        // 105
//                                                                                                      // 106
// - Empty array is considered falsy                                                                    // 107
// - The result is UI.emboxValue'd (doesn't trigger invalidation                                        // 108
//   as long as the condition stays truthy or stays falsy)                                              // 109
var emboxCondition = function (conditionFunc) {                                                         // 110
  return UI.namedEmboxValue('if/unless', function () {                                                  // 111
    // `condition` is emboxed; it is always a function,                                                 // 112
    // and it only triggers invalidation if its return                                                  // 113
    // value actually changes.  We still need to isolate                                                // 114
    // the calculation of whether it is truthy or falsy                                                 // 115
    // in order to not re-render if it changes from one                                                 // 116
    // truthy or falsy value to another.                                                                // 117
    var cond = conditionFunc();                                                                         // 118
                                                                                                        // 119
    // empty arrays are treated as falsey values                                                        // 120
    if (cond instanceof Array && cond.length === 0)                                                     // 121
      return false;                                                                                     // 122
    else                                                                                                // 123
      return !! cond;                                                                                   // 124
  });                                                                                                   // 125
};                                                                                                      // 126
                                                                                                        // 127
//////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
// packages/ui/each.js                                                                                  //
//                                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                        //
UI.EachImpl = Component.extend({                                                                        // 1
  typeName: 'Each',                                                                                     // 2
  render: function (modeHint) {                                                                         // 3
    var self = this;                                                                                    // 4
    var content = self.__content;                                                                       // 5
    var elseContent = self.__elseContent;                                                               // 6
                                                                                                        // 7
    if (modeHint === 'STATIC') {                                                                        // 8
      // This is a hack.  The caller gives us a hint if the                                             // 9
      // value we return will be static (in HTML or text)                                               // 10
      // or dynamic (materialized DOM).  The dynamic path                                               // 11
      // returns `null` and then we populate the DOM from                                               // 12
      // the `materialized` callback.                                                                   // 13
      //                                                                                                // 14
      // It would be much cleaner to always return the same                                             // 15
      // value here, and to have that value be some special                                             // 16
      // object that encapsulates the logic for populating                                              // 17
      // the #each using a mode-agnostic interface that                                                 // 18
      // works for HTML, text, and DOM.  Alternatively, we                                              // 19
      // could formalize the current pattern, e.g. defining                                             // 20
      // a method like component.populate(domRange) and one                                             // 21
      // like renderStatic() or even renderHTML / renderText.                                           // 22
      var parts = _.map(                                                                                // 23
        ObserveSequence.fetch(self.__sequence()),                                                       // 24
        function (item) {                                                                               // 25
          return content.extend({data: function () {                                                    // 26
            return item;                                                                                // 27
          }});                                                                                          // 28
        });                                                                                             // 29
                                                                                                        // 30
      if (parts.length) {                                                                               // 31
        return parts;                                                                                   // 32
      } else {                                                                                          // 33
        return elseContent;                                                                             // 34
      }                                                                                                 // 35
      return parts;                                                                                     // 36
    } else {                                                                                            // 37
      return null;                                                                                      // 38
    }                                                                                                   // 39
  },                                                                                                    // 40
  materialized: function () {                                                                           // 41
    var self = this;                                                                                    // 42
                                                                                                        // 43
    var range = self.dom;                                                                               // 44
                                                                                                        // 45
    var content = self.__content;                                                                       // 46
    var elseContent = self.__elseContent;                                                               // 47
                                                                                                        // 48
    // if there is an else clause, keep track of the number of                                          // 49
    // rendered items.  use this to display the else clause when count                                  // 50
    // becomes zero, and remove it when count becomes positive.                                         // 51
    var itemCount = 0;                                                                                  // 52
    var addToCount = function(delta) {                                                                  // 53
      if (!elseContent) // if no else, no need to keep track of count                                   // 54
        return;                                                                                         // 55
                                                                                                        // 56
      if (itemCount + delta < 0)                                                                        // 57
        throw new Error("count should never become negative");                                          // 58
                                                                                                        // 59
      if (itemCount === 0) {                                                                            // 60
        // remove else clause                                                                           // 61
        range.removeAll();                                                                              // 62
      }                                                                                                 // 63
      itemCount += delta;                                                                               // 64
      if (itemCount === 0) {                                                                            // 65
        UI.materialize(elseContent, range, null, self);                                                 // 66
      }                                                                                                 // 67
    };                                                                                                  // 68
                                                                                                        // 69
    this.observeHandle = ObserveSequence.observe(function () {                                          // 70
      return self.__sequence();                                                                         // 71
    }, {                                                                                                // 72
      addedAt: function (id, item, i, beforeId) {                                                       // 73
        addToCount(1);                                                                                  // 74
        id = LocalCollection._idStringify(id);                                                          // 75
                                                                                                        // 76
        var data = item;                                                                                // 77
        var dep = new Deps.Dependency;                                                                  // 78
                                                                                                        // 79
        // function to become `comp.data`                                                               // 80
        var dataFunc = function () {                                                                    // 81
          dep.depend();                                                                                 // 82
          return data;                                                                                  // 83
        };                                                                                              // 84
        // Storing `$set` on `comp.data` lets us                                                        // 85
        // access it from `changed`.                                                                    // 86
        dataFunc.$set = function (v) {                                                                  // 87
          data = v;                                                                                     // 88
          dep.changed();                                                                                // 89
        };                                                                                              // 90
                                                                                                        // 91
        if (beforeId)                                                                                   // 92
          beforeId = LocalCollection._idStringify(beforeId);                                            // 93
                                                                                                        // 94
        var renderedItem = UI.render(content.extend({data: dataFunc}), self);                           // 95
        range.add(id, renderedItem.dom, beforeId);                                                      // 96
      },                                                                                                // 97
      removed: function (id, item) {                                                                    // 98
        addToCount(-1);                                                                                 // 99
        range.remove(LocalCollection._idStringify(id));                                                 // 100
      },                                                                                                // 101
      movedTo: function (id, item, i, j, beforeId) {                                                    // 102
        range.moveBefore(                                                                               // 103
          LocalCollection._idStringify(id),                                                             // 104
          beforeId && LocalCollection._idStringify(beforeId));                                          // 105
      },                                                                                                // 106
      changed: function (id, newItem) {                                                                 // 107
        range.get(LocalCollection._idStringify(id)).component.data.$set(newItem);                       // 108
      }                                                                                                 // 109
    });                                                                                                 // 110
                                                                                                        // 111
    // on initial render, display the else clause if no items                                           // 112
    addToCount(0);                                                                                      // 113
  },                                                                                                    // 114
  destroyed: function () {                                                                              // 115
    if (this.__component__.observeHandle)                                                               // 116
      this.__component__.observeHandle.stop();                                                          // 117
  }                                                                                                     // 118
});                                                                                                     // 119
                                                                                                        // 120
//////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
// packages/ui/fields.js                                                                                //
//                                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                        //
                                                                                                        // 1
var global = (function () { return this; })();                                                          // 2
                                                                                                        // 3
// Searches for the given property in `comp` or a parent,                                               // 4
// and returns it as is (without call it if it's a function).                                           // 5
var lookupComponentProp = function (comp, prop) {                                                       // 6
  comp = findComponentWithProp(prop, comp);                                                             // 7
  var result = (comp ? comp.data : null);                                                               // 8
  if (typeof result === 'function')                                                                     // 9
    result = _.bind(result, comp);                                                                      // 10
  return result;                                                                                        // 11
};                                                                                                      // 12
                                                                                                        // 13
// Component that's a no-op when used as a block helper like                                            // 14
// `{{#foo}}...{{/foo}}`. Prints a warning that it is deprecated.                                       // 15
var noOpComponent = function (name) {                                                                   // 16
  return Component.extend({                                                                             // 17
    kind: 'NoOp',                                                                                       // 18
    render: function () {                                                                               // 19
      Meteor._debug("{{#" + name + "}} is now unnecessary and deprecated.");                            // 20
      return this.__content;                                                                            // 21
    }                                                                                                   // 22
  });                                                                                                   // 23
};                                                                                                      // 24
                                                                                                        // 25
// This map is searched first when you do something like `{{#foo}}` in                                  // 26
// a template.                                                                                          // 27
var builtInComponents = {                                                                               // 28
  // for past compat:                                                                                   // 29
  'constant': noOpComponent("constant"),                                                                // 30
  'isolate': noOpComponent("isolate")                                                                   // 31
};                                                                                                      // 32
                                                                                                        // 33
_extend(UI.Component, {                                                                                 // 34
  // Options:                                                                                           // 35
  //                                                                                                    // 36
  // - template {Boolean} If true, look at the list of templates after                                  // 37
  //   helpers and before data context.                                                                 // 38
  lookup: function (id, opts) {                                                                         // 39
    var self = this;                                                                                    // 40
    var template = opts && opts.template;                                                               // 41
    var result;                                                                                         // 42
    var comp;                                                                                           // 43
                                                                                                        // 44
    if (!id)                                                                                            // 45
      throw new Error("must pass id to lookup");                                                        // 46
                                                                                                        // 47
    if (/^\./.test(id)) {                                                                               // 48
      // starts with a dot. must be a series of dots which maps to an                                   // 49
      // ancestor of the appropriate height.                                                            // 50
      if (!/^(\.)+$/.test(id)) {                                                                        // 51
        throw new Error("id starting with dot must be a series of dots");                               // 52
      }                                                                                                 // 53
                                                                                                        // 54
      var compWithData = findComponentWithProp('data', self);                                           // 55
      for (var i = 1; i < id.length; i++) {                                                             // 56
        compWithData = compWithData ? findComponentWithProp('data', compWithData.parent) : null;        // 57
      }                                                                                                 // 58
                                                                                                        // 59
      return (compWithData ? compWithData.data : null);                                                 // 60
                                                                                                        // 61
    } else if ((comp = findComponentWithHelper(id, self))) {                                            // 62
      // found a property or method of a component                                                      // 63
      // (`self` or one of its ancestors)                                                               // 64
      var result = comp[id];                                                                            // 65
                                                                                                        // 66
    } else if (_.has(builtInComponents, id)) {                                                          // 67
      return builtInComponents[id];                                                                     // 68
                                                                                                        // 69
    // Code to search the global namespace for capitalized names                                        // 70
    // like component classes, `Template`, `StringUtils.foo`,                                           // 71
    // etc.                                                                                             // 72
    //                                                                                                  // 73
    // } else if (/^[A-Z]/.test(id) && (id in global)) {                                                // 74
    //   // Only look for a global identifier if `id` is                                                // 75
    //   // capitalized.  This avoids having `{{name}}` mean                                            // 76
    //   // `window.name`.                                                                              // 77
    //   result = global[id];                                                                           // 78
    //   return function (/*arguments*/) {                                                              // 79
    //     var data = getComponentData(self);                                                           // 80
    //     if (typeof result === 'function')                                                            // 81
    //       return result.apply(data, arguments);                                                      // 82
    //     return result;                                                                               // 83
    //   };                                                                                             // 84
    } else if (template && _.has(Template, id)) {                                                       // 85
      return Template[id];                                                                              // 86
                                                                                                        // 87
    } else if ((result = UI._globalHelper(id))) {                                                       // 88
                                                                                                        // 89
    } else {                                                                                            // 90
      // Resolve id `foo` as `data.foo` (with a "soft dot").                                            // 91
      return function (/*arguments*/) {                                                                 // 92
        var data = getComponentData(self);                                                              // 93
        if (template && !(data && _.has(data, id)))                                                     // 94
          throw new Error("Can't find template, helper or data context key: " + id);                    // 95
        if (! data)                                                                                     // 96
          return data;                                                                                  // 97
        var result = data[id];                                                                          // 98
        if (typeof result === 'function')                                                               // 99
          return result.apply(data, arguments);                                                         // 100
        return result;                                                                                  // 101
      };                                                                                                // 102
    }                                                                                                   // 103
                                                                                                        // 104
    if (typeof result === 'function' && ! result._isEmboxedConstant) {                                  // 105
      // Wrap the function `result`, binding `this` to `getComponentData(self)`.                        // 106
      // This creates a dependency when the result function is called.                                  // 107
      // Don't do this if the function is really just an emboxed constant.                              // 108
      return function (/*arguments*/) {                                                                 // 109
        var data = getComponentData(self);                                                              // 110
        return result.apply(data === null ? {} : data, arguments);                                      // 111
      };                                                                                                // 112
    } else {                                                                                            // 113
      return result;                                                                                    // 114
    };                                                                                                  // 115
  },                                                                                                    // 116
  lookupTemplate: function (id) {                                                                       // 117
    return this.lookup(id, {template: true});                                                           // 118
  },                                                                                                    // 119
  get: function (id) {                                                                                  // 120
    // support `this.get()` to get the data context.                                                    // 121
    if (id === undefined)                                                                               // 122
      id = ".";                                                                                         // 123
                                                                                                        // 124
    var result = this.lookup(id);                                                                       // 125
    return (typeof result === 'function' ? result() : result);                                          // 126
  },                                                                                                    // 127
  set: function (id, value) {                                                                           // 128
    var comp = findComponentWithProp(id, this);                                                         // 129
    if (! comp || ! comp[id])                                                                           // 130
      throw new Error("Can't find field: " + id);                                                       // 131
    if (typeof comp[id] !== 'function')                                                                 // 132
      throw new Error("Not a settable field: " + id);                                                   // 133
    comp[id](value);                                                                                    // 134
  }                                                                                                     // 135
});                                                                                                     // 136
                                                                                                        // 137
//////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
// packages/ui/handlebars_backcompat.js                                                                 //
//                                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                        //
// XXX this file no longer makes sense in isolation.  take it apart as                                  // 1
// part file reorg on the 'ui' package                                                                  // 2
var globalHelpers = {};                                                                                 // 3
                                                                                                        // 4
UI.registerHelper = function (name, func) {                                                             // 5
  globalHelpers[name] = func;                                                                           // 6
};                                                                                                      // 7
                                                                                                        // 8
UI._globalHelper = function (name) {                                                                    // 9
  return globalHelpers[name];                                                                           // 10
};                                                                                                      // 11
                                                                                                        // 12
Handlebars = {};                                                                                        // 13
Handlebars.registerHelper = UI.registerHelper;                                                          // 14
                                                                                                        // 15
// Utility to HTML-escape a string.                                                                     // 16
UI._escape = Handlebars._escape = (function() {                                                         // 17
  var escape_map = {                                                                                    // 18
    "<": "&lt;",                                                                                        // 19
    ">": "&gt;",                                                                                        // 20
    '"': "&quot;",                                                                                      // 21
    "'": "&#x27;",                                                                                      // 22
    "`": "&#x60;", /* IE allows backtick-delimited attributes?? */                                      // 23
    "&": "&amp;"                                                                                        // 24
  };                                                                                                    // 25
  var escape_one = function(c) {                                                                        // 26
    return escape_map[c];                                                                               // 27
  };                                                                                                    // 28
                                                                                                        // 29
  return function (x) {                                                                                 // 30
    return x.replace(/[&<>"'`]/g, escape_one);                                                          // 31
  };                                                                                                    // 32
})();                                                                                                   // 33
                                                                                                        // 34
// Return these from {{...}} helpers to achieve the same as returning                                   // 35
// strings from {{{...}}} helpers                                                                       // 36
Handlebars.SafeString = function(string) {                                                              // 37
  this.string = string;                                                                                 // 38
};                                                                                                      // 39
Handlebars.SafeString.prototype.toString = function() {                                                 // 40
  return this.string.toString();                                                                        // 41
};                                                                                                      // 42
                                                                                                        // 43
//////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.ui = {
  UI: UI,
  Handlebars: Handlebars
};

})();

//# sourceMappingURL=b523ef986d3d39671bcb40319d0df8982acacfe8.map
