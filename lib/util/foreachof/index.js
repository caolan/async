'use strict';

var arrayEach = require('./../arrayeach');

module.exports = function forEachOf(object, iterator) {
    arrayEach(Object.keys(object), function(key) {
        iterator(object[key], key);
    });
};
