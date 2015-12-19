'use strict';
var mapAsync = require('async.util.mapasync');
var doParallelLimit = require('async.util.doparallellimit');
module.exports = doParallelLimit(mapAsync);


