'use strict';

import createTester from './internal/createTester';
import eachOfLimit from './eachOfLimit';
import identity from 'lodash/utility/identity';

export default createTester(eachOfLimit, Boolean, identity);
