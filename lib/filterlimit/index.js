'use strict';
var filter = require('../util/filter/');
var doParallelLimit = require('../util/doparallellimit');
module.exports = doParallelLimit(filter);
