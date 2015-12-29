'use strict';

import rest from 'lodash/function/rest';

export default function _applyEach(eachfn) {
    return rest(function(fns, args) {
        var go = rest(function(args) {
            var that = this;
            var callback = args.pop();
            return eachfn(fns, function (fn, _, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        });
        if (args.length) {
            return go.apply(this, args);
        }
        else {
            return go;
        }
    });
}
