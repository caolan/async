'use strict';

import createTester from './internal/createTester';
import eachOfLimit from './eachOfLimit';
import identity from '../../deps/lodash-es/utility/identity';

export default createTester(eachOfLimit, Boolean, identity);