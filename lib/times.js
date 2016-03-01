'use strict';

import timesLimit from './timesLimit';
import doLimit from './internal/doLimit';

export default doLimit(timesLimit, Infinity);
