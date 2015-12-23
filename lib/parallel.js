'use strict';

import _parallel from './internal/parallel';
import eachOf from './eachOf';

export default function parallel(tasks, cb) {
    return _parallel(eachOf, tasks, cb);
}
