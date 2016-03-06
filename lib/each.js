'use strict';

import eachLimit from './eachLimit';
import doLimit from './internal/doLimit';

export default doLimit(eachLimit, Infinity);
