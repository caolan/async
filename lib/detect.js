'use strict';

import identity from 'lodash/identity';

import createTester from './internal/createTester';
import eachOf from './eachOf';
import findGetResult from './internal/findGetResult';

export default createTester(eachOf, identity, findGetResult);
