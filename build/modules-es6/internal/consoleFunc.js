'use strict';

import arrayEach from '../../../deps/lodash-es/internal/arrayEach';
import rest from '../../../deps/lodash-es/function/rest';

export default function consoleFunc(name) {
    return rest(function (fn, args) {
        fn.apply(null, args.concat([rest(function (err, args) {
            if (typeof console === 'object') {
                if (err) {
                    if (console.error) {
                        console.error(err);
                    }
                } else if (console[name]) {
                    arrayEach(args, function (x) {
                        console[name](x);
                    });
                }
            }
        })]));
    });
}