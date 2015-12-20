'use strict';

var concat = require('async.util.concat');
var doParallel = require('async.util.doparallel');

module.exports = doParallel(concat);
