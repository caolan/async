'use strict';

var restParam = require('async.util.restparam');

module.exports = restParam(function(fn, args) {
    return restParam(function(callArgs) {
        return fn.apply(null, args.concat(callArgs));
    });
});
