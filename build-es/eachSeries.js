'use strict';

import eachOfSeries from './eachOfSeries';
import withoutIndex from './internal/withoutIndex';

export default function eachSeries(arr, iterator, cb) {
    return eachOfSeries(arr, withoutIndex(iterator), cb);
}
