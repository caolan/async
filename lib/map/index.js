'use strict';
var mapAsync = require('../util/mapasync');
var doParallel = require('../util/doparallel');
module.exports = doParallel(mapAsync);
