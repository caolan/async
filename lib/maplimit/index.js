'use strict';
var mapAsync = require('../util/mapasync');
var doParallelLimit = require('../util/doparallellimit');
module.exports = doParallelLimit(mapAsync);


