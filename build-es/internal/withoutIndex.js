'use strict';

export default function _withoutIndex(iterator) {
    return function (value, index, callback) {
        return iterator(value, callback);
    };
}
