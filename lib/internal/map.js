import isArrayLike from 'lodash/isArrayLike';
import getIterator from './getIterator';
import noop from 'lodash/noop';
import okeys from 'lodash/keys';
import indexOf from 'lodash/_baseIndexOf';
import once from './once';

export default function _asyncMap(eachfn, arr, iteratee, callback) {
    callback = once(callback || noop);
    arr = arr || [];
    var results = [];
    var keys;
    if (!isArrayLike(arr) && !getIterator(arr)) {
        keys = okeys(arr);
    }

    eachfn(arr, function (value, index, callback) {
        iteratee(value, function (err, v) {
            var idx = keys ? indexOf(keys, index, 0) : index;
            results[idx] = v;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });
}
