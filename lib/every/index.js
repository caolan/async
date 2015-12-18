'use strict';

var eachOf = require('../eachof');
var notId = require('../util/notid/');
var createTester = require('../util/createtester');

module.exports = createTester(eachOf, notId, notId);
