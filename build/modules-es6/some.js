'use strict';

import identity from '../../deps/lodash-es/utility/identity';

import createTester from './internal/createTester';
import eachOf from './eachOf';

export default createTester(eachOf, Boolean, identity);