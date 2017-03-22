import identity from 'lodash/identity';
import asyncify from '../asyncify';

var supportsSymbol = typeof Symbol !== 'undefined';

function supportsAsync() {
    var supported;
    try {
        /* eslint no-eval: 0 */
        supported = supportsSymbol &&
            isAsync(eval('(async function () {})'));
    } catch (e) {
        supported = false;
    }
    return supported;
}

function isAsync(fn) {
    return fn[Symbol.toStringTag] === 'AsyncFunction';
}

export default supportsAsync() ?
    function wrapAsync(asyncFn) {
        return isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn;
    } :
    identity;

export { supportsAsync };
