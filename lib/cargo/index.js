'use strict';

var queue = require('../util/queue');

module.exports = function cargo(worker, payload) {
    return queue(worker, 1, payload);
};
