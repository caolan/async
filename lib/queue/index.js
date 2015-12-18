'use strict';

var queue = require('../util/queue');

module.exports = function (worker, concurrency) {
    return queue(function (items, cb) {
        worker(items[0], cb);
    }, concurrency, 1);
};
