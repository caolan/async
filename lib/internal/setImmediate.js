/* istanbul ignore file */

export var hasQueueMicrotask = typeof queueMicrotask === 'function' && queueMicrotask;
export var hasSetImmediate = typeof setImmediate === 'function' && setImmediate;
export var hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';

export function fallback(fn) {
    setTimeout(fn, 0);
}

export function wrap(defer) {
    return (fn, ...args) => defer(() => fn(...args));
}

var _defer;

if (hasQueueMicrotask) {
    _defer = queueMicrotask;
} else if (hasSetImmediate) {
    _defer = setImmediate;
} else if (hasNextTick) {
    _defer = process.nextTick;
} else {
    _defer = fallback;
}

export default wrap(_defer);
