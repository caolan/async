'use strict';

import rest from '../../deps/lodash-es/function/rest';

export default rest(function (values) {
    var args = [null].concat(values);
    return function (cb) {
        return cb.apply(this, args);
    };
});