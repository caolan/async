'use strict';

import reduce from './reduce';

var slice = Array.prototype.slice;

export default function reduceRight (arr, memo, iterator, cb) {
    var reversed = slice.call(arr).reverse();
    reduce(reversed, memo, iterator, cb);
}
