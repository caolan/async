'use strict';

import restParam from 'lodash/function/restParam';

export default restParam(function(values) {
    var args = [null].concat(values);
    return function (cb) {
        return cb.apply(this, args);
    };
});
