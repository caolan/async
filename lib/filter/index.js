'use strict';
var filter = require('../util/filter/');
var doParallel = require('../util/doparallel');
module.exports = doParallel(filter);
