'use strict';

var parallel = require('async.util.parallel');
var eachOfLimit = require('async.util.eachoflimit');

module.exports = function parallelLimit(tasks, limit, cb) {
    return parallel(eachOfLimit(limit), tasks, cb);
};
