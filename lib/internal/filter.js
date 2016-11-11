import isArrayLike from 'lodash/isArrayLike';
import noop from 'lodash/noop';

import once from './once';
import iterator from './iterator';

export default function _filter(eachfn, coll, iteratee, callback) {
    callback = once(callback || noop);
    var truthValues = isArrayLike(coll) ? new Array(coll.length) : {};
    eachfn(coll, function (x, index, callback) {
        iteratee(x, function (err, v) {
            truthValues[index] = !!v;
            callback(err);
        });
    }, function (err) {
        if (err) return callback(err);
        var result = [];
        var nextElem = iterator(coll);
        var elem;
        while ((elem = nextElem()) !== null) {
            if (truthValues[elem.key] === true) {
                result.push(elem.value);
            }
        }
        callback(null, result);
    });
}
