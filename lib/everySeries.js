'use strict';

import everyLimit from './everyLimit';
import doLimit from './internal/doLimit';

export default doLimit(everyLimit, 1);
