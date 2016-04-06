'use strict';

import rest from 'lodash/rest';
import initialParams from './internal/initialParams';

export default rest(function(values) {
    var args = [null].concat(values);
    return initialParams(function (ignoredArgs, callback) {
        return callback.apply(this, args);
    });
});
