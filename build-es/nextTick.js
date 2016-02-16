'use strict';

import setImmediate from './internal/setImmediate';

var nexTick = typeof process === 'object' && typeof process.nextTick === 'function' ? process.nextTick : setImmediate;

export default nexTick;
