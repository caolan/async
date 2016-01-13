'use strict';

import noop from 'lodash/noop';
import once from 'lodash/once';

import keyIterator from './keyIterator';
import onlyOnce from './onlyOnce';

export default function _eachOfLimit(limit) {
    return function (obj, iterator, callback) {
        callback = once(callback || noop);
        obj = obj || [];
        var nextKey = keyIterator(obj);
        if (limit <= 0) {
            return callback(null);
        }
        var done = false;
        var running = 0;
        var errored = false;

        (function replenish () {
            if (done && running <= 0) {
                return callback(null);
            }

            while (running < limit && !errored) {
                var key = nextKey();
                if (key === null) {
                    done = true;
                    if (running <= 0) {
                        callback(null);
                    }
                    return;
                }
                running += 1;
                iterator(obj[key], key, onlyOnce(function (err) {
                    running -= 1;
                    if (err) {
                        callback(err);
                        errored = true;
                    }
                    else {
                        replenish();
                    }
                }));
            }
        })();
    };
}
