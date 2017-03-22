import asyncify from '../asyncify';

var supportsSymbol = typeof Symbol !== 'undefined';

export default function wrapAsync(asyncFn) {
    if (!supportsSymbol) return asyncFn;

    var isAsync = asyncFn[Symbol.toStringTag] === 'AsyncFunction';

    return isAsync ? asyncify(asyncFn) : asyncFn;
}
