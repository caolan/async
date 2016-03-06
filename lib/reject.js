'use strict';

import rejectLimit from './rejectLimit';
import doLimit from './internal/doLimit';

export default doLimit(rejectLimit, Infinity);
