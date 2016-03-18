'use strict';

import _eachOfLimit from './internal/eachOfLimit';

export default function eachOfLimit(obj, limit, iteratee, cb) {
    _eachOfLimit(limit)(obj, iteratee, cb);
}
