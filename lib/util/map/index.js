'use strict';

module.exports = function _map(arr, iterator) {
    var index = -1;
    var length = arr.length;
    var result = new Array(length);
    while (++index < length) result[index] = iterator(arr[index], index, arr);
    return result;
};
