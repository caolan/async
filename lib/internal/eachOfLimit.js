import noop from './noop';
import once from './once';

import iterator from './iterator';
import onlyOnce from './onlyOnce';

import breakLoop from './breakLoop';

export default function _eachOfLimit(limit) {
    return function (obj, iteratee, callback) {
        callback = once(callback || noop);
        if (limit <= 0) {
            throw new RangeError('concurrency limit cannot be less than 1')
        }
        if (!obj) {
            return callback(null);
        }
        var nextElem = iterator(obj);
        var done = false;
        var canceled = false;
        var running = 0;
        var looping = false;

        function iterateeCallback(err, value) {
            if (canceled) return
            running -= 1;
            if (err) {
                done = true;
                callback(err);
            }
            else if (err === false) {
                done = true;
                canceled = true;
            }
            else if (value === breakLoop || (done && running <= 0)) {
                done = true;
                return callback(null);
            }
            else if (!looping) {
                replenish();
            }
        }

        function replenish () {
            looping = true;
            while (running < limit && !done) {
                var elem = nextElem();
                if (elem === null) {
                    done = true;
                    if (running <= 0) {
                        callback(null);
                    }
                    return;
                }
                running += 1;
                iteratee(elem.value, elem.key, onlyOnce(iterateeCallback));
            }
            looping = false;
        }

        replenish();
    };
}
