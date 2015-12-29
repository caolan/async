'use strict';

import map from './map';
import range from '../../deps/lodash-es/utility/range';

export default function (count, iterator, callback) {
    map(range(0, count), iterator, callback);
}