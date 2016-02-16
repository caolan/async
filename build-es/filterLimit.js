'use strict';

import filter from './internal/filter';
import doParallelLimit from './internal/doParallelLimit';

export default doParallelLimit(filter);
