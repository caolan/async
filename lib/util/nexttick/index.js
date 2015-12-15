'use strict';

var _nexttick = typeof process === 'object' && typeof process.nextTick === 'function' && process.nextTick;
module.exports = _nexttick || require('./setimmediate');
