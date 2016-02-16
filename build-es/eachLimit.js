'use strict';

import eachOfLimit from './internal/eachOfLimit';
import withoutIndex from './internal/withoutIndex';


export default function eachLimit(arr, limit, iterator, cb) {
    return eachOfLimit(limit)(arr, withoutIndex(iterator), cb);
}
