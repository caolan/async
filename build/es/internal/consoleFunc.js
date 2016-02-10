'use strict';

import arrayEach from 'lodash-es/internal/arrayEach';
import rest from 'lodash-es/rest';

export default function consoleFunc(name) {
    return rest(function (fn, args) {
        fn.apply(null, args.concat([rest(function (err, args) {
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
