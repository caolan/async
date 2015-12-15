'use strict';

var arrayEach = require('./../arrayEach');

module.exports = function reduce(arr, iterator, memo) {
    arrayEach(arr, function(x, i, a) {
        memo = iterator(memo, x, i, a);
    });
    return memo;
};
