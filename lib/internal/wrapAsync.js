import identity from 'lodash/identity';
import asyncify from '../asyncify';

var supportsSymbol = typeof Symbol === 'function';

function supportsAsync() {
    var supported;
    try {
        /* eslint no-eval: 0 */
        supported = isAsync(eval('(async function () {})'));
    } catch (e) {
        supported = false;
    }
    return supported;
}

function isAsync(fn) {
    return supportsSymbol && fn[Symbol.toStringTag] === 'AsyncFunction';
}

function wrapAsync(asyncFn) {
    return isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn;
}

export default supportsAsync() ? wrapAsync : identity;

export { supportsAsync, isAsync };
