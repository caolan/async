'use strict';

var identity = require('../util/identity');
var eachOfLimit = require('../eachoflimit');
var createTester = require('../util/createtester');
var findGetResult = require('../util/findgetresult');

module.exports = createTester(eachOfLimit, identity, findGetResult);
