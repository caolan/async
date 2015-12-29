'use strict';

import mapSeries from './mapSeries';
import range from '../../deps/lodash-es/utility/range';

export default function (count, iterator, callback) {
    mapSeries(range(0, count), iterator, callback);
}