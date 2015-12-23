'use strict';
var mapAsync = require('async.util.mapasync');
var doParallel = require('async.util.doparallel');
export default  doParallel(mapAsync);
