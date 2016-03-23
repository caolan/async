'use strict';

import isArrayLike from 'lodash/isArrayLike';
import keys from 'lodash/keys';

var iteratorSymbol = typeof Symbol === 'function' && Symbol.iterator;

export default function iterator(coll) {
    var i = -1;
    var len;
    if (isArrayLike(coll)) {
        len = coll.length;
        return function next() {
            i++;
            return i < len ? {value: coll[i], key: i} : null;
        };
    }

    if (iteratorSymbol && coll[iteratorSymbol]) {
        var iterate = coll[iteratorSymbol]();

        return function next() {
            var item = iterate.next();
            if (item.done)
                return null;
            i++;
            return {value: item.value, key: i};
        };
    }

    var okeys = keys(coll);
    len = okeys.length;
    return function next() {
        i++;
        var key = okeys[i];
        return i < len ? {value: coll[key], key: key} : null;
    };
}
