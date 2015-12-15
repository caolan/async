'use strict';
var mapAsync = require('async.util.mapasync');
var doParallel = require('async.util.doparallel');
module.exports = doParallel(mapAsync);
