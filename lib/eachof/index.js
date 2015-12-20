'use strict';

var once = require('async.util.once');
var noop = require('async.util.noop');
var onlyOnce = require('async.util.onlyonce');
var keyIterator = require('async.util.keyiterator');

module.exports = function eachOf(object, iterator, callback) {
    callback = once(callback || noop);
    object = object || [];

    var iter = keyIterator(object);
    var key, completed = 0;

    while ((key = iter()) != null) {
        completed += 1;
        iterator(object[key], key, onlyOnce(done));
    }

    if (completed === 0) callback(null);

    function done(err) {
        completed--;
        if (err) {
            callback(err);
        }
        // Check key is null in case iterator isn't exhausted
        // and done resolved synchronously.
        else if (key === null && completed <= 0) {
            callback(null);
        }
    }
};
