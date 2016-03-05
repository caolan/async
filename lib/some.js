'use strict';

import someLimit from './someLimit';
import doLimit from './internal/doLimit';

export default doLimit(someLimit, Infinity);
