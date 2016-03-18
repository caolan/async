'use strict';

import reduce from './reduce';

var slice = Array.prototype.slice;

export default function reduceRight (arr, memo, iteratee, cb) {
    var reversed = slice.call(arr).reverse();
    reduce(reversed, memo, iteratee, cb);
}
