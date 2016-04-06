'use strict';

import initialParams from './internal/initialParams';

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

    return initialParams(function (args, origCallback) {
        originalCallback = origCallback;
        // setup timer and call original function
        timer = setTimeout(timeoutCallback, miliseconds);
        asyncFn.apply(null, args.concat(injectedCallback));
    });
}
