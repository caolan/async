'use strict';

import eachOfLimit from './eachOfLimit';
import doLimit from './internal/doLimit';

export default doLimit(eachOfLimit, Infinity);
