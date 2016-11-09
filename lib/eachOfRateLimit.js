import TokenBucket from './internal/TokenBucket';

import noop from 'lodash/noop';
import once from './once';

import iterator from './iterator';
import onlyOnce from './onlyOnce';

/**
 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name eachOfRateLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.eachOf]{@link module:Collections.eachOf}
 * @alias forEachOfRateLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A function to apply to each
 * item in `coll`. The `key` is the item's key, or index in the case of an
 * array. The iteratee is passed a `callback(err)` which must be called once it
 * has completed. If no error has occurred, the callback should be run without
 * arguments or with an explicit `null` argument. Invoked with
 * (item, key, callback).
 * @param {Object} rateLimitOptions - the rate limiting options. options.bucketSize
 * will limit the amount of items queued within options.interval (miliseconds).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
export default function(coll, iteratee, options, callback) {
    callback = once(callback || noop);
    
    var tokenBucket = new TokenBucket(options.bucketSize, options.interval);

    function iterateeCallback(err) {
        if (err) {
            tokenBucket.empty();
            callback(err);
        }
        // check nextElem iterator is exhausted (elem == null) to be sure
        // we don't exit immediately due to a synchronous iteratee
        else if (tokenBucket.queued === 0 && elem === null) {
            return callback(null);
        }
    }


    function enqueue(value, key) {
        tokenBucket.enqueue(function() {
            iteratee(value, key, onlyOnce(iterateeCallback));
        });
    }

    var nextElem = iterator(coll);
    var elem;
    while((elem = nextElem()) !== null) {
        enqueue(elem.value, elem.key);
    }
}
