'use strict';

import rest from 'lodash/rest';

export default rest(function(values) {
    var args = [null].concat(values);
    return function () {
        var callback = [].slice.call(arguments).pop();
        return callback.apply(this, args);
    };
});
