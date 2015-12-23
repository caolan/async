'use strict';

import createTester from './internal/createTester';
import eachOfLimit from './eachOfLimit';
import notId from './internal/notId';

export default createTester(eachOfLimit, notId, notId);
