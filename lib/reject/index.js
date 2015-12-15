'use strict';

var reject = require('async.util.reject');
var doParallel = require('async.util.doparallel');

module.exports = doParallel(reject);
