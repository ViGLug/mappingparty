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
var Deps = Package.deps.Deps;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;

/* Package-scope variables */
var ObserveSequence, id;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
// packages/observe-sequence/observe_sequence.js                                        //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////
                                                                                        //
var warn = function () {                                                                // 1
  if (ObserveSequence._suppressWarnings) {                                              // 2
    ObserveSequence._suppressWarnings--;                                                // 3
  } else {                                                                              // 4
    if (typeof console !== 'undefined' && console.warn)                                 // 5
      console.warn.apply(console, arguments);                                           // 6
                                                                                        // 7
    ObserveSequence._loggedWarnings++;                                                  // 8
  }                                                                                     // 9
};                                                                                      // 10
                                                                                        // 11
var idStringify = LocalCollection._idStringify;                                         // 12
var idParse = LocalCollection._idParse;                                                 // 13
                                                                                        // 14
ObserveSequence = {                                                                     // 15
  _suppressWarnings: 0,                                                                 // 16
  _loggedWarnings: 0,                                                                   // 17
                                                                                        // 18
  // A mechanism similar to cursor.observe which receives a reactive                    // 19
  // function returning a sequence type and firing appropriate callbacks                // 20
  // when the value changes.                                                            // 21
  //                                                                                    // 22
  // @param sequenceFunc {Function} a reactive function returning a                     // 23
  //     sequence type. The currently supported sequence types are:                     // 24
  //     'null', arrays and cursors.                                                    // 25
  //                                                                                    // 26
  // @param callbacks {Object} similar to a specific subset of                          // 27
  //     callbacks passed to `cursor.observe`                                           // 28
  //     (http://docs.meteor.com/#observe), with minor variations to                    // 29
  //     support the fact that not all sequences contain objects with                   // 30
  //     _id fields.  Specifically:                                                     // 31
  //                                                                                    // 32
  //     * addedAt(id, item, atIndex, beforeId)                                         // 33
  //     * changed(id, newItem, oldItem)                                                // 34
  //     * removed(id, oldItem)                                                         // 35
  //     * movedTo(id, item, fromIndex, toIndex, beforeId)                              // 36
  //                                                                                    // 37
  // @returns {Object(stop: Function)} call 'stop' on the return value                  // 38
  //     to stop observing this sequence function.                                      // 39
  //                                                                                    // 40
  // We don't make any assumptions about our ability to compare sequence                // 41
  // elements (ie, we don't assume EJSON.equals works; maybe there is extra             // 42
  // state/random methods on the objects) so unlike cursor.observe, we may              // 43
  // sometimes call changed() when nothing actually changed.                            // 44
  // XXX consider if we *can* make the stronger assumption and avoid                    // 45
  //     no-op changed calls (in some cases?)                                           // 46
  //                                                                                    // 47
  // XXX currently only supports the callbacks used by our                              // 48
  // implementation of {{#each}}, but this can be expanded.                             // 49
  //                                                                                    // 50
  // XXX #each doesn't use the indices (though we'll eventually need                    // 51
  // a way to get them when we support `@index`), but calling                           // 52
  // `cursor.observe` causes the index to be calculated on every                        // 53
  // callback using a linear scan (unless you turn it off by passing                    // 54
  // `_no_indices`).  Any way to avoid calculating indices on a pure                    // 55
  // cursor observe like we used to?                                                    // 56
  observe: function (sequenceFunc, callbacks) {                                         // 57
    var lastSeq = null;                                                                 // 58
    var activeObserveHandle = null;                                                     // 59
                                                                                        // 60
    // 'lastSeqArray' contains the previous value of the sequence                       // 61
    // we're observing. It is an array of objects with '_id' and                        // 62
    // 'item' fields.  'item' is the element in the array, or the                       // 63
    // document in the cursor.                                                          // 64
    //                                                                                  // 65
    // '_id' is whichever of the following is relevant, unless it has                   // 66
    // already appeared -- in which case it's randomly generated.                       // 67
    //                                                                                  // 68
    // * if 'item' is an object:                                                        // 69
    //   * an '_id' field, if present                                                   // 70
    //   * otherwise, the index in the array                                            // 71
    //                                                                                  // 72
    // * if 'item' is a number or string, use that value                                // 73
    //                                                                                  // 74
    // XXX this can be generalized by allowing {{#each}} to accept a                    // 75
    // general 'key' argument which could be a function, a dotted                       // 76
    // field name, or the special @index value.                                         // 77
    var lastSeqArray = []; // elements are objects of form {_id, item}                  // 78
    var computation = Deps.autorun(function () {                                        // 79
      var seq = sequenceFunc();                                                         // 80
                                                                                        // 81
      Deps.nonreactive(function () {                                                    // 82
        var seqArray; // same structure as `lastSeqArray` above.                        // 83
                                                                                        // 84
        // If we were previously observing a cursor, replace lastSeqArray with          // 85
        // more up-to-date information (specifically, the state of the observe          // 86
        // before it was stopped, which may be older than the DB).                      // 87
        if (activeObserveHandle) {                                                      // 88
          lastSeqArray = _.map(activeObserveHandle._fetch(), function (doc) {           // 89
            return {_id: doc._id, item: doc};                                           // 90
          });                                                                           // 91
          activeObserveHandle.stop();                                                   // 92
          activeObserveHandle = null;                                                   // 93
        }                                                                               // 94
                                                                                        // 95
        if (!seq) {                                                                     // 96
          seqArray = [];                                                                // 97
          diffArray(lastSeqArray, seqArray, callbacks);                                 // 98
        } else if (seq instanceof Array) {                                              // 99
          var idsUsed = {};                                                             // 100
          seqArray = _.map(seq, function (item, index) {                                // 101
            if (typeof item === 'string') {                                             // 102
              // ensure not empty, since other layers (eg DomRange) assume this as well // 103
              id = "-" + item;                                                          // 104
            } else if (typeof item === 'number' ||                                      // 105
                       typeof item === 'boolean' ||                                     // 106
                       item === undefined) {                                            // 107
              id = item;                                                                // 108
            } else if (typeof item === 'object') {                                      // 109
              id = (item && item._id) || index;                                         // 110
            } else {                                                                    // 111
              throw new Error("{{#each}} doesn't support arrays with " +                // 112
                              "elements of type " + typeof item);                       // 113
            }                                                                           // 114
                                                                                        // 115
            var idString = idStringify(id);                                             // 116
            if (idsUsed[idString]) {                                                    // 117
              warn("duplicate id " + id + " in", seq);                                  // 118
              id = Random.id();                                                         // 119
            } else {                                                                    // 120
              idsUsed[idString] = true;                                                 // 121
            }                                                                           // 122
                                                                                        // 123
            return { _id: id, item: item };                                             // 124
          });                                                                           // 125
                                                                                        // 126
          diffArray(lastSeqArray, seqArray, callbacks);                                 // 127
        } else if (isMinimongoCursor(seq)) {                                            // 128
          var cursor = seq;                                                             // 129
          seqArray = [];                                                                // 130
                                                                                        // 131
          var initial = true; // are we observing initial data from cursor?             // 132
          activeObserveHandle = cursor.observe({                                        // 133
            addedAt: function (document, atIndex, before) {                             // 134
              if (initial) {                                                            // 135
                // keep track of initial data so that we can diff once                  // 136
                // we exit `observe`.                                                   // 137
                if (before !== null)                                                    // 138
                  throw new Error("Expected initial data from observe in order");       // 139
                seqArray.push({ _id: document._id, item: document });                   // 140
              } else {                                                                  // 141
                callbacks.addedAt(document._id, document, atIndex, before);             // 142
              }                                                                         // 143
            },                                                                          // 144
            changed: function (newDocument, oldDocument) {                              // 145
              callbacks.changed(newDocument._id, newDocument, oldDocument);             // 146
            },                                                                          // 147
            removed: function (oldDocument) {                                           // 148
              callbacks.removed(oldDocument._id, oldDocument);                          // 149
            },                                                                          // 150
            movedTo: function (document, fromIndex, toIndex, before) {                  // 151
              callbacks.movedTo(                                                        // 152
                document._id, document, fromIndex, toIndex, before);                    // 153
            }                                                                           // 154
          });                                                                           // 155
          initial = false;                                                              // 156
                                                                                        // 157
          // diff the old sequnce with initial data in the new cursor. this will        // 158
          // fire `addedAt` callbacks on the initial data.                              // 159
          diffArray(lastSeqArray, seqArray, callbacks);                                 // 160
                                                                                        // 161
        } else {                                                                        // 162
          throw badSequenceError();                                                     // 163
        }                                                                               // 164
                                                                                        // 165
        lastSeq = seq;                                                                  // 166
        lastSeqArray = seqArray;                                                        // 167
      });                                                                               // 168
    });                                                                                 // 169
                                                                                        // 170
    return {                                                                            // 171
      stop: function () {                                                               // 172
        computation.stop();                                                             // 173
        if (activeObserveHandle)                                                        // 174
          activeObserveHandle.stop();                                                   // 175
      }                                                                                 // 176
    };                                                                                  // 177
  },                                                                                    // 178
                                                                                        // 179
  // Fetch the items of `seq` into an array, where `seq` is of one of the               // 180
  // sequence types accepted by `observe`.  If `seq` is a cursor, a                     // 181
  // dependency is established.                                                         // 182
  fetch: function (seq) {                                                               // 183
    if (!seq) {                                                                         // 184
      return [];                                                                        // 185
    } else if (seq instanceof Array) {                                                  // 186
      return seq;                                                                       // 187
    } else if (isMinimongoCursor(seq)) {                                                // 188
      return seq.fetch();                                                               // 189
    } else {                                                                            // 190
      throw badSequenceError();                                                         // 191
    }                                                                                   // 192
  }                                                                                     // 193
};                                                                                      // 194
                                                                                        // 195
var badSequenceError = function () {                                                    // 196
  return new Error("{{#each}} currently only accepts " +                                // 197
                   "arrays, cursors or falsey values.");                                // 198
};                                                                                      // 199
                                                                                        // 200
var isMinimongoCursor = function (seq) {                                                // 201
  var minimongo = Package.minimongo;                                                    // 202
  return !!minimongo && (seq instanceof minimongo.LocalCollection.Cursor);              // 203
};                                                                                      // 204
                                                                                        // 205
// Calculates the differences between `lastSeqArray` and                                // 206
// `seqArray` and calls appropriate functions from `callbacks`.                         // 207
// Reuses Minimongo's diff algorithm implementation.                                    // 208
var diffArray = function (lastSeqArray, seqArray, callbacks) {                          // 209
  var diffFn = Package.minimongo.LocalCollection._diffQueryOrderedChanges;              // 210
  var oldIdObjects = [];                                                                // 211
  var newIdObjects = [];                                                                // 212
  var posOld = {}; // maps from idStringify'd ids                                       // 213
  var posNew = {}; // ditto                                                             // 214
                                                                                        // 215
  _.each(seqArray, function (doc, i) {                                                  // 216
    newIdObjects.push(_.pick(doc, '_id'));                                              // 217
    posNew[idStringify(doc._id)] = i;                                                   // 218
  });                                                                                   // 219
  _.each(lastSeqArray, function (doc, i) {                                              // 220
    oldIdObjects.push(_.pick(doc, '_id'));                                              // 221
    posOld[idStringify(doc._id)] = i;                                                   // 222
  });                                                                                   // 223
                                                                                        // 224
  // Arrays can contain arbitrary objects. We don't diff the                            // 225
  // objects. Instead we always fire 'changed' callback on every                        // 226
  // object. The consumer of `observe-sequence` should deal with                        // 227
  // it appropriately.                                                                  // 228
  diffFn(oldIdObjects, newIdObjects, {                                                  // 229
    addedBefore: function (id, doc, before) {                                           // 230
        callbacks.addedAt(                                                              // 231
          id,                                                                           // 232
          seqArray[posNew[idStringify(id)]].item,                                       // 233
          posNew[idStringify(id)],                                                      // 234
          before);                                                                      // 235
    },                                                                                  // 236
    movedBefore: function (id, before) {                                                // 237
        callbacks.movedTo(                                                              // 238
          id,                                                                           // 239
          seqArray[posNew[idStringify(id)]].item,                                       // 240
          posOld[idStringify(id)],                                                      // 241
          posNew[idStringify(id)],                                                      // 242
          before);                                                                      // 243
    },                                                                                  // 244
    removed: function (id) {                                                            // 245
        callbacks.removed(                                                              // 246
          id,                                                                           // 247
          lastSeqArray[posOld[idStringify(id)]].item);                                  // 248
    }                                                                                   // 249
  });                                                                                   // 250
                                                                                        // 251
  _.each(posNew, function (pos, idString) {                                             // 252
    var id = idParse(idString);                                                         // 253
    if (_.has(posOld, idString)) {                                                      // 254
      // specifically for primitive types, compare equality before                      // 255
      // firing the changed callback. otherwise, always fire it                         // 256
      // because doing a deep EJSON comparison is not guaranteed to                     // 257
      // work (an array can contain arbitrary objects, and 'transform'                  // 258
      // can be used on cursors). also, deep diffing is not                             // 259
      // necessarily the most efficient (if only a specific subfield                    // 260
      // of the object is later accessed).                                              // 261
      var newItem = seqArray[pos].item;                                                 // 262
      var oldItem = lastSeqArray[posOld[idString]].item;                                // 263
                                                                                        // 264
      if (typeof newItem === 'object' || newItem !== oldItem)                           // 265
          callbacks.changed(id, newItem, oldItem);                                      // 266
      }                                                                                 // 267
  });                                                                                   // 268
};                                                                                      // 269
                                                                                        // 270
//////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['observe-sequence'] = {
  ObserveSequence: ObserveSequence
};

})();

//# sourceMappingURL=935ca00b8c9fc8b3868a14a62fd05b42b7b871bc.map
