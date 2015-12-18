'use strict';

var _eachOfLimit = require('../util/eachoflimit');

module.exports = function eachOfLimit(obj, limit, iterator, cb) {
    _eachOfLimit(limit)(obj, iterator, cb);
};
