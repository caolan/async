'use strict';

export default function onlyOnce(fn) {
    return function() {
        if (fn === null) throw new Error("Callback was already called.");
        fn.apply(this, arguments);
        fn = null;
    };
}
