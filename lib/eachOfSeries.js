'use strict';

import once from 'lodash/once';
import noop from 'lodash/noop';

import keyIterator from './internal/keyIterator';
import onlyOnce from './internal/onlyOnce';
import setImmediate from './setImmediate';

export default function eachOfSeries(obj, iterator, callback) {
    callback = once(callback || noop);
    obj = obj || [];
    var nextKey = keyIterator(obj);
    var key = nextKey();

    function iterate() {
        var sync = true;
        if (key === null) {
            return callback(null);
        }
        iterator(obj[key], key, onlyOnce(function(err) {
            if (err) {
                callback(err);
            } else {
                key = nextKey();
                if (key === null) {
                    return callback(null);
                } else {
                    if (sync) {
                        setImmediate(iterate);
                    } else {
                        iterate();
                    }
                }
            }
        }));
        sync = false;
    }
    iterate();
}
