'use strict';

module.exports = function indexOf(arr, item) {
    for (var i = 0; i < arr.length; i++) if (arr[i] === item) return i;
    return -1;
};
