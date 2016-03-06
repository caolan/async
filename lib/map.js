'use strict';

import mapLimit from './mapLimit';
import doLimit from './internal/doLimit';

export default doLimit(mapLimit, Infinity);
