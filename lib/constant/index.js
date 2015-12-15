'use strict';

var restParam = require('async.util.restparam');

module.exports = restParam(function(values) {
    var args = [null].concat(values);
    return function (cb) {
        return cb.apply(this, args);
    };
});
