'use strict';

import mapLimit from './mapLimit';
import range from '../../deps/lodash-es/utility/range';

export default function timeLimit(count, limit, iterator, cb) {
    return mapLimit(range(0, count), limit, iterator, cb);
}