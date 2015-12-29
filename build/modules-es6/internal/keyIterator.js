'use strict';

import isArrayLike from '../../../deps/lodash-es/lang/isArrayLike';
import keys from '../../../deps/lodash-es/object/keys';

export default function keyIterator(coll) {
    var i = -1;
    var len;
    if (isArrayLike(coll)) {
        len = coll.length;
        return function next() {
            i++;
            return i < len ? i : null;
        };
    } else {
        var okeys = keys(coll);
        len = okeys.length;
        return function next() {
            i++;
            return i < len ? okeys[i] : null;
        };
    }
}