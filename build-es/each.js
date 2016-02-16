'use strict';

import eachOf from './eachOf';
import withoutIndex from './internal/withoutIndex';

export default function each(arr, iterator, cb) {
    return eachOf(arr, withoutIndex(iterator), cb);
}
