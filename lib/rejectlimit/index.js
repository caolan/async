'use strict';

var reject = require('async.util.reject');
var doParallelLimit = require('async.util.doparallellimit');

module.exports = doParallelLimit(reject);
