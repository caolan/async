'use strict';

import createTester from './internal/createTester';
import eachOf from './eachOf';
import notId from './internal/notId';

export default createTester(eachOf, notId, notId);
