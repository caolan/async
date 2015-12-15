'use strict';

var eachOf = require('async.eachof');
var _parallel = require('async.util.parallel');

module.exports = function parallel(tasks, cb) {
    return _parallel(eachOf, tasks, cb);
};
