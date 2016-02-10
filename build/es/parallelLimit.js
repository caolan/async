'use strict';

import eachOfLimit from './internal/eachOfLimit';
import parallel from './internal/parallel';

export default function parallelLimit(tasks, limit, cb) {
    return parallel(eachOfLimit(limit), tasks, cb);
}
