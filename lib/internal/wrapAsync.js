import asyncify from '../asyncify.js'
import onlyOnce from './onlyOnce'

function isAsync(fn) {
    return fn[Symbol.toStringTag] === 'AsyncFunction';
}

function isAsyncGenerator(fn) {
    return fn[Symbol.toStringTag] === 'AsyncGenerator';
}

function isAsyncIterable(obj) {
    return typeof obj[Symbol.asyncIterator] === 'function';
}

function wrapAsync(asyncFn) {
    function wrapPromise(fn) {
        return function (...args) {
            const cb = onlyOnce(args[args.length - 1])
            args[args.length - 1] = cb
            const result = fn.apply(this, args)
            if (result && typeof result.then === 'function') {
                return result.then(cb).catch(cb)
            }
            return result
        }
    }
    if (typeof asyncFn !== 'function') throw new Error('expected a function')
    return isAsync(asyncFn) ? asyncify(asyncFn) : wrapPromise(asyncFn);
}

export default wrapAsync;

export { isAsync, isAsyncGenerator, isAsyncIterable };
