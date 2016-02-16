'use strict';

import rest from 'lodash-es/rest';

export default rest(function(values) {
    var args = [null].concat(values);
    return function (cb) {
        return cb.apply(this, args);
    };
});
