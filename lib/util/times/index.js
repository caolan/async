'use strict';

var range = require('../range');

module.exports = function times(mapper) {
    return function (count, iterator, cb) {
        mapper(range(count), iterator, cb);
    };
};
