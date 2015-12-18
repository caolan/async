'use strict';

var concat = require('../util/concat');
var doParallel = require('../util/doparallel');

module.exports = doParallel(concat);
