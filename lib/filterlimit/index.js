'use strict';
var filter = require('async.util.filter');
var doParallelLimit = require('async.util.doparallellimit');
module.exports = doParallelLimit(filter);
