import arrayEach from 'lodash/internal/arrayEach';
import restParam from 'lodash/function/restParam';

export default function consoleFunc(name) {
    return restParam(function (fn, args) {
        fn.apply(null, args.concat([restParam(function (err, args) {
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
        })]));
    });
}
