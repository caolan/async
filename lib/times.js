'use strict';

import map from './map';
import range from 'lodash/_baseRange';

export default function (count, iterator, callback) {
    map(range(0, count, 1), iterator, callback);
}
