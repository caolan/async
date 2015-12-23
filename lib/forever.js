import noop from 'lodash/utility/noop';

import onlyOnce from './internal/onlyOnce';
import ensureAsync from './ensureAsync';

export default function forever(fn, cb) {
    var done = onlyOnce(cb || noop);
    var task = ensureAsync(fn);

    function next(err) {
        if (err) return done(err);
        task(next);
    }
    next();
}
