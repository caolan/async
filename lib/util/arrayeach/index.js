'use strict';

module.exports = function arrayEach(arr, iterator) {
    var index = -1;
    var length = arr.length;

    while (++index < length) {
        iterator(arr[index], index, arr);
    }
};
