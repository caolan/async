'use strict';

import mapLimit from './mapLimit';
import range from 'lodash/utility/range';

export default function timeLimit(count, limit, iterator, cb) {
    return mapLimit(range(0, count), limit, iterator, cb);
};
