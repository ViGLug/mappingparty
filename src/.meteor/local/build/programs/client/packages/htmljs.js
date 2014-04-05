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

/* Package-scope variables */
var HTML, callReactiveFunction, stopWithLater;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
// packages/htmljs/utils.js                                                                             //
//                                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                        //
                                                                                                        // 1
HTML = {};                                                                                              // 2
                                                                                                        // 3
HTML.isNully = function (node) {                                                                        // 4
  if (node == null)                                                                                     // 5
    // null or undefined                                                                                // 6
    return true;                                                                                        // 7
                                                                                                        // 8
  if (node instanceof Array) {                                                                          // 9
    // is it an empty array or an array of all nully items?                                             // 10
    for (var i = 0; i < node.length; i++)                                                               // 11
      if (! HTML.isNully(node[i]))                                                                      // 12
        return false;                                                                                   // 13
    return true;                                                                                        // 14
  }                                                                                                     // 15
                                                                                                        // 16
  return false;                                                                                         // 17
};                                                                                                      // 18
                                                                                                        // 19
HTML.escapeData = function (str) {                                                                      // 20
  // string; escape the two special chars in HTML data and RCDATA                                       // 21
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;');                                              // 22
};                                                                                                      // 23
                                                                                                        // 24
                                                                                                        // 25
// The HTML spec and the DOM API (in particular `setAttribute`) have different                          // 26
// definitions of what characters are legal in an attribute.  The HTML                                  // 27
// parser is extremely permissive (allowing, for example, `<a %=%>`), while                             // 28
// `setAttribute` seems to use something like the XML grammar for names (and                            // 29
// throws an error if a name is invalid, making that attribute unsettable).                             // 30
// If we knew exactly what grammar browsers used for `setAttribute`, we could                           // 31
// include various Unicode ranges in what's legal.  For now, allow ASCII chars                          // 32
// that are known to be valid XML, valid HTML, and settable via `setAttribute`:                         // 33
//                                                                                                      // 34
// * Starts with `:`, `_`, `A-Z` or `a-z`                                                               // 35
// * Consists of any of those plus `-`, `.`, and `0-9`.                                                 // 36
//                                                                                                      // 37
// See <http://www.w3.org/TR/REC-xml/#NT-Name> and                                                      // 38
// <http://dev.w3.org/html5/markup/syntax.html#syntax-attributes>.                                      // 39
HTML.isValidAttributeName = function (name) {                                                           // 40
  return /^[:_A-Za-z][:_A-Za-z0-9.\-]*/.test(name);                                                     // 41
};                                                                                                      // 42
                                                                                                        // 43
//////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
// packages/htmljs/html.js                                                                              //
//                                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                        //
                                                                                                        // 1
// Tag instances are `instanceof HTML.Tag`.                                                             // 2
//                                                                                                      // 3
// Tag objects should be considered immutable.                                                          // 4
//                                                                                                      // 5
// This is a private constructor of an abstract class; don't call it.                                   // 6
HTML.Tag = function () {};                                                                              // 7
HTML.Tag.prototype.tagName = ''; // this will be set per Tag subclass                                   // 8
HTML.Tag.prototype.attrs = null;                                                                        // 9
HTML.Tag.prototype.children = Object.freeze ? Object.freeze([]) : [];                                   // 10
                                                                                                        // 11
// Given "p", create and assign `HTML.P` if it doesn't already exist.                                   // 12
// Then return it.  `tagName` must have proper case (usually all lowercase).                            // 13
HTML.getTag = function (tagName) {                                                                      // 14
  var symbolName = HTML.getSymbolName(tagName);                                                         // 15
  if (symbolName === tagName) // all-caps tagName                                                       // 16
    throw new Error("Use the lowercase or camelCase form of '" + tagName + "' here");                   // 17
                                                                                                        // 18
  if (! HTML[symbolName])                                                                               // 19
    HTML[symbolName] = makeTagConstructor(tagName);                                                     // 20
                                                                                                        // 21
  return HTML[symbolName];                                                                              // 22
};                                                                                                      // 23
                                                                                                        // 24
// Given "p", make sure `HTML.P` exists.  `tagName` must have proper case                               // 25
// (usually all lowercase).                                                                             // 26
HTML.ensureTag = function (tagName) {                                                                   // 27
  HTML.getTag(tagName); // don't return it                                                              // 28
};                                                                                                      // 29
                                                                                                        // 30
// Given "p" create the function `HTML.P`.                                                              // 31
var makeTagConstructor = function (tagName) {                                                           // 32
  // HTMLTag is the per-tagName constructor of a HTML.Tag subclass                                      // 33
  var HTMLTag = function HTMLTag(/*arguments*/) {                                                       // 34
    // Work with or without `new`.  If not called with `new`,                                           // 35
    // perform instantiation by recursively calling this constructor.                                   // 36
    // We can't pass varargs, so pass no args.                                                          // 37
    var instance = (this instanceof HTML.Tag) ? this : new HTMLTag;                                     // 38
                                                                                                        // 39
    var i = 0;                                                                                          // 40
    var attrs = arguments.length && arguments[0];                                                       // 41
    if (attrs && (typeof attrs === 'object') &&                                                         // 42
        (attrs.constructor === Object)) {                                                               // 43
      instance.attrs = attrs;                                                                           // 44
      i++;                                                                                              // 45
    }                                                                                                   // 46
                                                                                                        // 47
    // If no children, don't create an array at all, use the prototype's                                // 48
    // (frozen, empty) array.  This way we don't create an empty array                                  // 49
    // every time someone creates a tag without `new` and this constructor                              // 50
    // calls itself with no arguments (above).                                                          // 51
    if (i < arguments.length)                                                                           // 52
      instance.children = Array.prototype.slice.call(arguments, i);                                     // 53
                                                                                                        // 54
    return instance;                                                                                    // 55
  };                                                                                                    // 56
  HTMLTag.prototype = new HTML.Tag;                                                                     // 57
  HTMLTag.prototype.constructor = HTMLTag;                                                              // 58
  HTMLTag.prototype.tagName = tagName;                                                                  // 59
                                                                                                        // 60
  return HTMLTag;                                                                                       // 61
};                                                                                                      // 62
                                                                                                        // 63
var CharRef = HTML.CharRef = function (attrs) {                                                         // 64
  if (! (this instanceof CharRef))                                                                      // 65
    // called without `new`                                                                             // 66
    return new CharRef(attrs);                                                                          // 67
                                                                                                        // 68
  if (! (attrs && attrs.html && attrs.str))                                                             // 69
    throw new Error(                                                                                    // 70
      "HTML.CharRef must be constructed with ({html:..., str:...})");                                   // 71
                                                                                                        // 72
  this.html = attrs.html;                                                                               // 73
  this.str = attrs.str;                                                                                 // 74
};                                                                                                      // 75
                                                                                                        // 76
var Comment = HTML.Comment = function (value) {                                                         // 77
  if (! (this instanceof Comment))                                                                      // 78
    // called without `new`                                                                             // 79
    return new Comment(value);                                                                          // 80
                                                                                                        // 81
  if (typeof value !== 'string')                                                                        // 82
    throw new Error('HTML.Comment must be constructed with a string');                                  // 83
                                                                                                        // 84
  this.value = value;                                                                                   // 85
  // Kill illegal hyphens in comment value (no way to escape them in HTML)                              // 86
  this.sanitizedValue = value.replace(/^-|--+|-$/g, '');                                                // 87
};                                                                                                      // 88
                                                                                                        // 89
                                                                                                        // 90
//---------- KNOWN ELEMENTS                                                                             // 91
                                                                                                        // 92
// These lists of known elements are public.  You can use them, for example, to                         // 93
// write a helper that determines the proper case for an SVG element name.                              // 94
// Such helpers that may not be needed at runtime are not provided here.                                // 95
                                                                                                        // 96
HTML.knownElementNames = 'a abbr acronym address applet area b base basefont bdo big blockquote body br button caption center cite code col colgroup dd del dfn dir div dl dt em fieldset font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex kbd label legend li link map menu meta noframes noscript object ol optgroup option p param pre q s samp script select small span strike strong style sub sup table tbody td textarea tfoot th thead title tr tt u ul var article aside audio bdi canvas command data datagrid datalist details embed eventsource figcaption figure footer header hgroup keygen mark meter nav output progress ruby rp rt section source summary time track video wbr'.split(' ');
                                                                                                        // 98
// omitted because also an HTML element: "a"                                                            // 99
HTML.knownSVGElementNames = 'altGlyph altGlyphDef altGlyphItem animate animateColor animateMotion animateTransform circle clipPath color-profile cursor defs desc ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence filter font font-face font-face-format font-face-name font-face-src font-face-uri foreignObject g glyph glyphRef hkern image line linearGradient marker mask metadata missing-glyph path pattern polygon polyline radialGradient rect script set stop style svg switch symbol text textPath title tref tspan use view vkern'.split(' ');
// Append SVG element names to list of known element names                                              // 101
HTML.knownElementNames = HTML.knownElementNames.concat(HTML.knownSVGElementNames);                      // 102
                                                                                                        // 103
HTML.voidElementNames = 'area base br col command embed hr img input keygen link meta param source track wbr'.split(' ');
                                                                                                        // 105
// Speed up search through lists of known elements by creating internal "sets"                          // 106
// of strings.                                                                                          // 107
var YES = {yes:true};                                                                                   // 108
var makeSet = function (array) {                                                                        // 109
  var set = {};                                                                                         // 110
  for (var i = 0; i < array.length; i++)                                                                // 111
    set[array[i]] = YES;                                                                                // 112
  return set;                                                                                           // 113
};                                                                                                      // 114
var voidElementSet = makeSet(HTML.voidElementNames);                                                    // 115
var knownElementSet = makeSet(HTML.knownElementNames);                                                  // 116
var knownSVGElementSet = makeSet(HTML.knownSVGElementNames);                                            // 117
                                                                                                        // 118
// Is the given element (in proper case) a known HTML element?                                          // 119
// This includes SVG elements.                                                                          // 120
HTML.isKnownElement = function (name) {                                                                 // 121
  return knownElementSet[name] === YES;                                                                 // 122
};                                                                                                      // 123
                                                                                                        // 124
// Is the given element (in proper case) an element with no end tag                                     // 125
// in HTML, like "br", "hr", or "input"?                                                                // 126
HTML.isVoidElement = function (name) {                                                                  // 127
  return voidElementSet[name] === YES;                                                                  // 128
};                                                                                                      // 129
                                                                                                        // 130
// Is the given element (in proper case) a known SVG element?                                           // 131
HTML.isKnownSVGElement = function (name) {                                                              // 132
  return knownSVGElementSet[name] === YES;                                                              // 133
};                                                                                                      // 134
                                                                                                        // 135
// For code generators, is a particular tag (in proper case) guaranteed                                 // 136
// to be available on the HTML object (under the name returned by                                       // 137
// getSymbolName)?                                                                                      // 138
HTML.isTagEnsured = function (t) {                                                                      // 139
  return HTML.isKnownElement(t);                                                                        // 140
};                                                                                                      // 141
                                                                                                        // 142
// For code generators, take a tagName like "p" and return an uppercase                                 // 143
// symbol name like "P" which is available on the "HTML" object for                                     // 144
// known elements or after calling getTag or ensureTag.                                                 // 145
HTML.getSymbolName = function (tagName) {                                                               // 146
  // "foo-bar" -> "FOO_BAR"                                                                             // 147
  return tagName.toUpperCase().replace(/-/g, '_');                                                      // 148
};                                                                                                      // 149
                                                                                                        // 150
// Ensure tags for all known elements                                                                   // 151
for (var i = 0; i < HTML.knownElementNames.length; i++)                                                 // 152
  HTML.ensureTag(HTML.knownElementNames[i]);                                                            // 153
                                                                                                        // 154
////////////////////////////////////////////////////////////////////////////////                        // 155
                                                                                                        // 156
callReactiveFunction = function (func) {                                                                // 157
  var result;                                                                                           // 158
  var cc = Deps.currentComputation;                                                                     // 159
  var h = Deps.autorun(function (c) {                                                                   // 160
    result = func();                                                                                    // 161
  });                                                                                                   // 162
  h.onInvalidate(function () {                                                                          // 163
    if (cc)                                                                                             // 164
      cc.invalidate();                                                                                  // 165
  });                                                                                                   // 166
  if (Deps.active) {                                                                                    // 167
    Deps.onInvalidate(function () {                                                                     // 168
      h.stop();                                                                                         // 169
      func.stop && func.stop();                                                                         // 170
    });                                                                                                 // 171
  } else {                                                                                              // 172
    h.stop();                                                                                           // 173
    func.stop && func.stop();                                                                           // 174
  }                                                                                                     // 175
  return result;                                                                                        // 176
};                                                                                                      // 177
                                                                                                        // 178
stopWithLater = function (instance) {                                                                   // 179
  if (instance.materialized && instance.materialized.isWith) {                                          // 180
    if (Deps.active)                                                                                    // 181
      instance.materialized();                                                                          // 182
    else                                                                                                // 183
      instance.data.stop();                                                                             // 184
  }                                                                                                     // 185
};                                                                                                      // 186
                                                                                                        // 187
// Call all functions and instantiate all components, when fine-grained                                 // 188
// reactivity is not needed (for example, in attributes).                                               // 189
HTML.evaluate = function (node, parentComponent) {                                                      // 190
  if (node == null) {                                                                                   // 191
    return node;                                                                                        // 192
  } else if (typeof node === 'function') {                                                              // 193
    return HTML.evaluate(callReactiveFunction(node), parentComponent);                                  // 194
  } else if (node instanceof Array) {                                                                   // 195
    var result = [];                                                                                    // 196
    for (var i = 0; i < node.length; i++)                                                               // 197
      result.push(HTML.evaluate(node[i], parentComponent));                                             // 198
    return result;                                                                                      // 199
  } else if (typeof node.instantiate === 'function') {                                                  // 200
    // component                                                                                        // 201
    var instance = node.instantiate(parentComponent || null);                                           // 202
    var content = instance.render('STATIC');                                                            // 203
    stopWithLater(instance);                                                                            // 204
    return HTML.evaluate(content, instance);                                                            // 205
  }  else if (node instanceof HTML.Tag) {                                                               // 206
    var newChildren = [];                                                                               // 207
    for (var i = 0; i < node.children.length; i++)                                                      // 208
      newChildren.push(HTML.evaluate(node.children[i], parentComponent));                               // 209
    var newTag = HTML.getTag(node.tagName).apply(null, newChildren);                                    // 210
    newTag.attrs = {};                                                                                  // 211
    for (var k in node.attrs)                                                                           // 212
      newTag.attrs[k] = HTML.evaluate(node.attrs[k], parentComponent);                                  // 213
    return newTag;                                                                                      // 214
  } else {                                                                                              // 215
    return node;                                                                                        // 216
  }                                                                                                     // 217
};                                                                                                      // 218
                                                                                                        // 219
var extendAttrs = function (tgt, src, parentComponent) {                                                // 220
  for (var k in src) {                                                                                  // 221
    if (k === '$dynamic')                                                                               // 222
      continue;                                                                                         // 223
    if (! HTML.isValidAttributeName(k))                                                                 // 224
      throw new Error("Illegal HTML attribute name: " + k);                                             // 225
    var value = HTML.evaluate(src[k], parentComponent);                                                 // 226
    if (! HTML.isNully(value))                                                                          // 227
      tgt[k] = value;                                                                                   // 228
  }                                                                                                     // 229
};                                                                                                      // 230
                                                                                                        // 231
// Process the `attrs.$dynamic` directive, if present, returning the final                              // 232
// attributes dictionary.  The value of `attrs.$dynamic` must be an array                               // 233
// of attributes dictionaries or functions returning attribute dictionaries.                            // 234
// These attributes are used to extend `attrs` as long as they are non-nully.                           // 235
// All attributes are "evaluated," calling functions and instantiating                                  // 236
// components.                                                                                          // 237
HTML.evaluateAttributes = function (attrs, parentComponent) {                                           // 238
  if (! attrs)                                                                                          // 239
    return attrs;                                                                                       // 240
                                                                                                        // 241
  var result = {};                                                                                      // 242
  extendAttrs(result, attrs, parentComponent);                                                          // 243
                                                                                                        // 244
  if ('$dynamic' in attrs) {                                                                            // 245
    if (! (attrs.$dynamic instanceof Array))                                                            // 246
      throw new Error("$dynamic must be an array");                                                     // 247
    // iterate over attrs.$dynamic, calling each element if it                                          // 248
    // is a function and then using it to extend `result`.                                              // 249
    var dynamics = attrs.$dynamic;                                                                      // 250
    for (var i = 0; i < dynamics.length; i++) {                                                         // 251
      var moreAttrs = dynamics[i];                                                                      // 252
      if (typeof moreAttrs === 'function')                                                              // 253
        moreAttrs = moreAttrs();                                                                        // 254
      extendAttrs(result, moreAttrs, parentComponent);                                                  // 255
    }                                                                                                   // 256
  }                                                                                                     // 257
                                                                                                        // 258
  return result;                                                                                        // 259
};                                                                                                      // 260
                                                                                                        // 261
HTML.Tag.prototype.evaluateAttributes = function (parentComponent) {                                    // 262
  return HTML.evaluateAttributes(this.attrs, parentComponent);                                          // 263
};                                                                                                      // 264
                                                                                                        // 265
HTML.Raw = function (value) {                                                                           // 266
  if (! (this instanceof HTML.Raw))                                                                     // 267
    // called without `new`                                                                             // 268
    return new HTML.Raw(value);                                                                         // 269
                                                                                                        // 270
  if (typeof value !== 'string')                                                                        // 271
    throw new Error('HTML.Raw must be constructed with a string');                                      // 272
                                                                                                        // 273
  this.value = value;                                                                                   // 274
};                                                                                                      // 275
                                                                                                        // 276
HTML.EmitCode = function (value) {                                                                      // 277
  if (! (this instanceof HTML.EmitCode))                                                                // 278
    // called without `new`                                                                             // 279
    return new HTML.EmitCode(value);                                                                    // 280
                                                                                                        // 281
  if (typeof value !== 'string')                                                                        // 282
    throw new Error('HTML.EmitCode must be constructed with a string');                                 // 283
                                                                                                        // 284
  this.value = value;                                                                                   // 285
};                                                                                                      // 286
                                                                                                        // 287
//////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
// packages/htmljs/tohtml.js                                                                            //
//                                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                        //
                                                                                                        // 1
HTML.toHTML = function (node, parentComponent) {                                                        // 2
  if (node == null) {                                                                                   // 3
    // null or undefined                                                                                // 4
    return '';                                                                                          // 5
  } else if ((typeof node === 'string') || (typeof node === 'boolean') || (typeof node === 'number')) { // 6
    // string; escape special chars                                                                     // 7
    return HTML.escapeData(String(node));                                                               // 8
  } else if (node instanceof Array) {                                                                   // 9
    // array                                                                                            // 10
    var parts = [];                                                                                     // 11
    for (var i = 0; i < node.length; i++)                                                               // 12
      parts.push(HTML.toHTML(node[i], parentComponent));                                                // 13
    return parts.join('');                                                                              // 14
  } else if (typeof node.instantiate === 'function') {                                                  // 15
    // component                                                                                        // 16
    var instance = node.instantiate(parentComponent || null);                                           // 17
    var content = instance.render('STATIC');                                                            // 18
    stopWithLater(instance);                                                                            // 19
    // recurse with a new value for parentComponent                                                     // 20
    return HTML.toHTML(content, instance);                                                              // 21
  } else if (typeof node === 'function') {                                                              // 22
    return HTML.toHTML(callReactiveFunction(node), parentComponent);                                    // 23
  } else if (node.toHTML) {                                                                             // 24
    // Tag or something else                                                                            // 25
    return node.toHTML(parentComponent);                                                                // 26
  } else {                                                                                              // 27
    throw new Error("Expected tag, string, array, component, null, undefined, or " +                    // 28
                    "object with a toHTML method; found: " + node);                                     // 29
  }                                                                                                     // 30
};                                                                                                      // 31
                                                                                                        // 32
HTML.Comment.prototype.toHTML = function () {                                                           // 33
  return '<!--' + this.sanitizedValue + '-->';                                                          // 34
};                                                                                                      // 35
                                                                                                        // 36
HTML.CharRef.prototype.toHTML = function () {                                                           // 37
  return this.html;                                                                                     // 38
};                                                                                                      // 39
                                                                                                        // 40
HTML.Raw.prototype.toHTML = function () {                                                               // 41
  return this.value;                                                                                    // 42
};                                                                                                      // 43
                                                                                                        // 44
HTML.Tag.prototype.toHTML = function (parentComponent) {                                                // 45
  var attrStrs = [];                                                                                    // 46
  var attrs = this.evaluateAttributes(parentComponent);                                                 // 47
  if (attrs) {                                                                                          // 48
    for (var k in attrs) {                                                                              // 49
      var v = HTML.toText(attrs[k], HTML.TEXTMODE.ATTRIBUTE, parentComponent);                          // 50
      attrStrs.push(' ' + k + '="' + v + '"');                                                          // 51
    }                                                                                                   // 52
  }                                                                                                     // 53
                                                                                                        // 54
  var tagName = this.tagName;                                                                           // 55
  var startTag = '<' + tagName + attrStrs.join('') + '>';                                               // 56
                                                                                                        // 57
  var childStrs = [];                                                                                   // 58
  var content;                                                                                          // 59
  if (tagName === 'textarea') {                                                                         // 60
    for (var i = 0; i < this.children.length; i++)                                                      // 61
      childStrs.push(HTML.toText(this.children[i], HTML.TEXTMODE.RCDATA, parentComponent));             // 62
                                                                                                        // 63
    content = childStrs.join('');                                                                       // 64
    if (content.slice(0, 1) === '\n')                                                                   // 65
      // TEXTAREA will absorb a newline, so if we see one, add                                          // 66
      // another one.                                                                                   // 67
      content = '\n' + content;                                                                         // 68
                                                                                                        // 69
  } else {                                                                                              // 70
    for (var i = 0; i < this.children.length; i++)                                                      // 71
      childStrs.push(HTML.toHTML(this.children[i], parentComponent));                                   // 72
                                                                                                        // 73
    content = childStrs.join('');                                                                       // 74
  }                                                                                                     // 75
                                                                                                        // 76
  var result = startTag + content;                                                                      // 77
                                                                                                        // 78
  if (this.children.length || ! HTML.isVoidElement(tagName)) {                                          // 79
    // "Void" elements like BR are the only ones that don't get a close                                 // 80
    // tag in HTML5.  They shouldn't have contents, either, so we could                                 // 81
    // throw an error upon seeing contents here.                                                        // 82
    result += '</' + tagName + '>';                                                                     // 83
  }                                                                                                     // 84
                                                                                                        // 85
  return result;                                                                                        // 86
};                                                                                                      // 87
                                                                                                        // 88
HTML.TEXTMODE = {                                                                                       // 89
  ATTRIBUTE: 1,                                                                                         // 90
  RCDATA: 2,                                                                                            // 91
  STRING: 3                                                                                             // 92
};                                                                                                      // 93
                                                                                                        // 94
HTML.toText = function (node, textMode, parentComponent) {                                              // 95
  if (node == null) {                                                                                   // 96
    // null or undefined                                                                                // 97
    return '';                                                                                          // 98
  } else if ((typeof node === 'string') || (typeof node === 'boolean') || (typeof node === 'number')) { // 99
    node = String(node);                                                                                // 100
    // string                                                                                           // 101
    if (textMode === HTML.TEXTMODE.STRING) {                                                            // 102
      return node;                                                                                      // 103
    } else if (textMode === HTML.TEXTMODE.RCDATA) {                                                     // 104
      return HTML.escapeData(node);                                                                     // 105
    } else if (textMode === HTML.TEXTMODE.ATTRIBUTE) {                                                  // 106
      // escape `&` and `"` this time, not `&` and `<`                                                  // 107
      return node.replace(/&/g, '&amp;').replace(/"/g, '&quot;');                                       // 108
    } else {                                                                                            // 109
      throw new Error("Unknown TEXTMODE: " + textMode);                                                 // 110
    }                                                                                                   // 111
  } else if (node instanceof Array) {                                                                   // 112
    // array                                                                                            // 113
    var parts = [];                                                                                     // 114
    for (var i = 0; i < node.length; i++)                                                               // 115
      parts.push(HTML.toText(node[i], textMode, parentComponent));                                      // 116
    return parts.join('');                                                                              // 117
  } else if (typeof node === 'function') {                                                              // 118
    return HTML.toText(callReactiveFunction(node), textMode, parentComponent);                          // 119
  } else if (typeof node.instantiate === 'function') {                                                  // 120
    // component                                                                                        // 121
    var instance = node.instantiate(parentComponent || null);                                           // 122
    var content = instance.render('STATIC');                                                            // 123
    var result = HTML.toText(content, textMode, instance);                                              // 124
    stopWithLater(instance);                                                                            // 125
    return result;                                                                                      // 126
  } else if (node.toText) {                                                                             // 127
    // Something else                                                                                   // 128
    return node.toText(textMode, parentComponent);                                                      // 129
  } else {                                                                                              // 130
    throw new Error("Expected tag, string, array, component, null, undefined, or " +                    // 131
                    "object with a toText method; found: " + node);                                     // 132
  }                                                                                                     // 133
                                                                                                        // 134
};                                                                                                      // 135
                                                                                                        // 136
HTML.Raw.prototype.toText = function () {                                                               // 137
  return this.value;                                                                                    // 138
};                                                                                                      // 139
                                                                                                        // 140
// used when including templates within {{#markdown}}                                                   // 141
HTML.Tag.prototype.toText = function (textMode, parentComponent) {                                      // 142
  if (textMode === HTML.TEXTMODE.STRING)                                                                // 143
    // stringify the tag as HTML, then convert to text                                                  // 144
    return HTML.toText(this.toHTML(parentComponent), textMode);                                         // 145
  else                                                                                                  // 146
    throw new Error("Can't insert tags in attributes or TEXTAREA elements");                            // 147
};                                                                                                      // 148
                                                                                                        // 149
HTML.CharRef.prototype.toText = function (textMode) {                                                   // 150
  if (textMode === HTML.TEXTMODE.STRING)                                                                // 151
    return this.str;                                                                                    // 152
  else if (textMode === HTML.TEXTMODE.RCDATA)                                                           // 153
    return this.html;                                                                                   // 154
  else if (textMode === HTML.TEXTMODE.ATTRIBUTE)                                                        // 155
    return this.html;                                                                                   // 156
  else                                                                                                  // 157
    throw new Error("Unknown TEXTMODE: " + textMode);                                                   // 158
};                                                                                                      // 159
                                                                                                        // 160
//////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.htmljs = {
  HTML: HTML
};

})();

//# sourceMappingURL=697b0dd0fbdd1f8984dffa3225121a9b7d0b8609.map
