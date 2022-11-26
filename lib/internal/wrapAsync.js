import asyncify from '../asyncify.js'
import { isAsync } from './isAsync.js'

function wrapAsync(asyncFn) {
    if (typeof asyncFn !== 'function') throw new Error('expected a function')
    return isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn;
}

export default wrapAsync;
