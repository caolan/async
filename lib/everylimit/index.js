'use strict';

var eachOfLimit = require('../eachoflimit');
var notId = require('../util/notid/');
var createTester = require('../util/createtester');

module.exports = createTester(eachOfLimit, notId, notId);
