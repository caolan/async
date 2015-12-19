'use strict';

var _parallel = require('async.util.parallel');
var eachOfLimit = require('async.util.eachoflimit');

module.exports = function parallelLimit(tasks, limit, cb) {
    return _parallel(eachOfLimit(limit), tasks, cb);
};
