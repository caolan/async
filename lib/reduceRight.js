'use strict';

import toArray from 'lodash/lang/toArray';
import reduce from './reduce';

export default function reduceRight (arr, memo, iterator, cb) {
    var reversed = toArray(arr).reverse();
    reduce(reversed, memo, iterator, cb);
}
