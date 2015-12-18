'use strict';

var _parallel = require('../util/parallel');
var eachOfLimit = require('../util/eachoflimit');

module.exports = function parallelLimit(tasks, limit, cb) {
    return _parallel(eachOfLimit(limit), tasks, cb);
};
