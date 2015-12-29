'use strict';

import identity from '../../deps/lodash-es/utility/identity';

import createTester from './internal/createTester';
import eachOfSeries from './eachOfSeries';
import findGetResult from './internal/findGetResult';

export default createTester(eachOfSeries, identity, findGetResult);