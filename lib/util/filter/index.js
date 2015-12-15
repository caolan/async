'use strict';

var map = require('./../map');

module.exports = function _filter(eachfn, arr, iterator, callback) {
    var results = [];
    eachfn(arr, function(x, index, callback) {
        iterator(x, function(v) {
            if (v) {
                results.push({
                    index: index,
                    value: x
                });
            }
            callback();
        });
    }, function() {
        callback(map(results.sort(function(a, b) {
            return a.index - b.index;
        }), function(x) {
            return x.value;
        }));
    });
};
