'use strict';

import reject from './internal/reject';
import doParallelLimit from './internal/doParallelLimit';

export default doParallelLimit(reject);
