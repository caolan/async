'use strict';

var map = require('./../map');

module.exports = function range(count) {
    return map(new Array(count), function(v, i) {
        return i;
    });
};
