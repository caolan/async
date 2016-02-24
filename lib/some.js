'use strict';

import identity from 'lodash/identity';

import createTester from './internal/createTester';
import eachOf from './eachOf';

export default createTester(eachOf, Boolean, identity);
