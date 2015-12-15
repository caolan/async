'use strict';

module.exports = function withoutIndex(iterator) {
    return function(value, index, callback) {
        return iterator(value, callback);
    };
};
