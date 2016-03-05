'use strict';

import filterLimit from './filterLimit';
import doLimit from './internal/doLimit';

export default doLimit(filterLimit, 1);
