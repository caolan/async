'use strict';

var reject = require('../util/reject');
var doParallelLimit = require('../util/doparallellimit');

module.exports = doParallelLimit(reject);
