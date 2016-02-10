'use strict';

import parallel from './internal/parallel';
import eachOfSeries from './eachOfSeries';

export default function series(tasks, cb) {
    return parallel(eachOfSeries, tasks, cb);
}
