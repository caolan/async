'use strict';

import eachOfLimit from './internal/eachOfLimit';
import withoutIndex from './internal/withoutIndex';


export default function eachLimit(arr, limit, iteratee, cb) {
    return eachOfLimit(limit)(arr, withoutIndex(iteratee), cb);
}
