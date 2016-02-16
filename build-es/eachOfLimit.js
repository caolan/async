'use strict';

import _eachOfLimit from './internal/eachOfLimit';

export default function eachOfLimit(obj, limit, iterator, cb) {
    _eachOfLimit(limit)(obj, iterator, cb);
}
