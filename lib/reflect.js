'use strict';

export default function reflect(fn) {
    return function reflectOn() {
        var args = Array.prototype.slice.call(arguments);
        var reflectCallback = args.pop();

        args.push(function callback(err) {
            if (err) {
                reflectCallback(null, {
                    error: err
                });
            } else {
                var cbArgs = Array.prototype.slice.call(arguments, 1);
                var value = null;
                if (cbArgs.length === 1) {
                    value = cbArgs[0];
                } else if (cbArgs.length > 1) {
                    value = cbArgs;
                }
                reflectCallback(null, {
                    value: value
                });
            }
        });

        return fn.apply(this, args);
    };
}
