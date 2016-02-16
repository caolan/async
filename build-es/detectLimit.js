'use strict';

import identity from 'lodash-es/identity';

import createTester from './internal/createTester';
import eachOfLimit from './eachOfLimit';
import findGetResult from './internal/findGetResult';

export default createTester(eachOfLimit, identity, findGetResult);
