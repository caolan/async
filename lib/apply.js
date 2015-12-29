'use strict';

import rest from 'lodash/function/rest';

export default rest(function(fn, args) {
    return rest(function(callArgs) {
        return fn.apply(null, args.concat(callArgs));
    });
});
