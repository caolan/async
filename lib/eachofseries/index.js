'use strict';

var once = require('async.util.once');
var noop = require('async.util.noop');
var onlyOnce = require('async.util.onlyonce');
var keyIterator = require('async.util.keyiterator');
var setImmediate = require('async.util.setimmediate');

module.exports = function eachOfSeries(obj, iterator, callback) {
    callback = once(callback || noop);
    obj = obj || [];
    var nextKey = keyIterator(obj);
    var key = nextKey();

    function iterate() {
        var sync = true;
        if (key === null) {
            return callback(null);
        }
        iterator(obj[key], key, onlyOnce(function(err) {
            if (err) {
                callback(err);
            } else {
                key = nextKey();
                if (key === null) {
                    return callback(null);
                } else {
                    if (sync) {
                        setImmediate(iterate);
                    } else {
                        iterate();
                    }
                }
            }
        }));
        sync = false;
    }
    iterate();
};
