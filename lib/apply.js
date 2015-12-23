'use strict';

import restParam from 'lodash/function/restParam';

export default restParam(function(fn, args) {
    return restParam(function(callArgs) {
        return fn.apply(null, args.concat(callArgs));
    });
});
