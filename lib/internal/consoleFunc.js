import arrayEach from 'lodash/_arrayEach';
import rest from './rest';
import wrapAsync from './wrapAsync';

export default function consoleFunc(name) {
    return rest(function (fn, args) {
        wrapAsync(fn).apply(null, args.concat(rest(function (err, args) {
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
        })));
    });
}
