import arrayEach from 'lodash/_arrayEach';
import slice from './slice';
import wrapAsync from './wrapAsync';

export default function consoleFunc(name) {
    return function (fn/*, ...args*/) {
        var args = slice(arguments, 1);
        wrapAsync(fn).apply(null, args.concat(function (err/*, ...args*/) {
            var args = slice(arguments, 1);
            if (typeof console === 'object') {
                if (err) {
                    if (console.error) {
                        console.error(err);
                    }
                }
                else if (console[name]) {
                    arrayEach(args, function (x) {
                        console[name](x);
                    });
                }
            }
        }));
    };
}
