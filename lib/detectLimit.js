'use strict';

import identity from 'lodash/identity';

import createTester from './internal/createTester';
import eachOfLimit from './eachOfLimit';
import findGetResult from './internal/findGetResult';

export default createTester(eachOfLimit, identity, findGetResult);
