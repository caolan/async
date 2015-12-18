'use strict';

var eachOf = require('../eachof');
var _parallel = require('../util/parallel');

module.exports = function parallel(tasks, cb) {
    return _parallel(eachOf, tasks, cb);
};
