'use strict';

var eachOf = require('async.eachof');
var applyEach = require('async.util.applyeach');

module.exports = applyEach(eachOf);
