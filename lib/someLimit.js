'use strict';

import createTester from './internal/createTester';
import eachOfLimit from './eachOfLimit';
import identity from 'lodash/identity';

export default createTester(eachOfLimit, Boolean, identity);
