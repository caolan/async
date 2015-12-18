'use strict';

var reject = require('../util/reject');
var doParallel = require('../util/doparallel');

module.exports = doParallel(reject);
