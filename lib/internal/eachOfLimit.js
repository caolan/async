import noop from 'lodash/noop';
import once from './once';

import iterator from './iterator';
import onlyOnce from './onlyOnce';

export default function _eachOfLimit(limit) {
    return function (obj, iteratee, callback) {
        callback = once(callback || noop);
        obj = obj || [];
        var nextElem = iterator(obj);
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
                var elem = nextElem();
                if (elem === null) {
                    done = true;
                    if (running <= 0) {
                        callback(null);
                    }
                    return;
                }
                running += 1;
                iteratee(elem.value, elem.key, onlyOnce(function (err) {
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
