'use strict';

import rest from '../../deps/lodash-es/function/rest';

export default rest(function (fn, args) {
    return rest(function (callArgs) {
        return fn.apply(null, args.concat(callArgs));
    });
});