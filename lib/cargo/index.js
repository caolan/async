'use strict';

var queue = require('async.util.queue');

module.exports = function cargo(worker, payload) {
    return queue(worker, 1, payload);
};
