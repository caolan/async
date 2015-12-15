'use strict';
var filter = require('async.util.filter');
var doParallel = require('async.util.doparallel');
module.exports = doParallel(filter);
