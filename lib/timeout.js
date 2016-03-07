'use strict';

export default function timeout(asyncFn, miliseconds) {
    var originalCallback, timer;
    var timedOut = false;

    function injectedCallback() {
        if (!timedOut) {
            originalCallback.apply(null, arguments);
            clearTimeout(timer);
        }
    }

    function timeoutCallback() {
        var error  = new Error('Callback function timed out.');
        error.code = 'ETIMEDOUT';
        timedOut = true;
        originalCallback(error);
    }

    function injectCallback(asyncFnArgs) {
        // replace callback in asyncFn args
        var args = Array.prototype.slice.call(asyncFnArgs, 0);
        originalCallback = args[args.length - 1];
        args[args.length - 1] = injectedCallback;
        return args;
    }

    function wrappedFn() {
        // setup timer and call original function
        timer = setTimeout(timeoutCallback, miliseconds);
        asyncFn.apply(null, injectCallback(arguments));
    }

    return wrappedFn;
}
