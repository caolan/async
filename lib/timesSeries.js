'use strict';

import mapSeries from './mapSeries';
import range from 'lodash/internal/baseRange';

export default function (count, iterator, callback) {
    mapSeries(range(0, count, 1), iterator, callback);
}
