'use strict';

import parallelLimit from './parallelLimit';
import doLimit from './internal/doLimit';

export default doLimit(parallelLimit, Infinity);
