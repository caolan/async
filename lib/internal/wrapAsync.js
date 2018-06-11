import asyncify from '../asyncify';

function isAsync(fn) {
    return fn[Symbol.toStringTag] === 'AsyncFunction';
}

function wrapAsync(asyncFn) {
    return isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn;
}

export default wrapAsync;

export { isAsync };
