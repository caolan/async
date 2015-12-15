'use strict';

var isObject = require('../isobject');
var restParam = require('../restparam');

module.exports = function asyncify(func) {
    return restParam(function(args) {
        var callback = args.pop();
        var result;
        try {
            result = func.apply(this, args);
        } catch (e) {
            return callback(e);
        }
        // if result is Promise object
        if (isObject(result) && typeof result.then === "function") {
            result.then(function(value) {
                callback(null, value);
            })["catch"](function(err) {
                callback(err.message ? err : new Error(err));
            });
        } else {
            callback(null, result);
        }
    });
};
