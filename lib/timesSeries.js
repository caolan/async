'use strict';

import mapSeries from './mapSeries';
import range from 'lodash/utility/range';

export default function (count, iterator, callback) {
    mapSeries(range(0, count), iterator, callback);
}
