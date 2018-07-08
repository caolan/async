import isArrayLike from './isArrayLike';
import noop from './noop';

import wrapAsync from './wrapAsync';

function filterArray(eachfn, arr, iteratee, callback) {
    var truthValues = new Array(arr.length);
    eachfn(arr, (x, index, callback) => {
        iteratee(x, (err, v) => {
            truthValues[index] = !!v;
            callback(err);
        });
    }, err => {
        if (err) return callback(err);
        var results = [];
        for (var i = 0; i < arr.length; i++) {
            if (truthValues[i]) results.push(arr[i]);
        }
        callback(null, results);
    });
}

function filterGeneric(eachfn, coll, iteratee, callback) {
    var results = [];
    eachfn(coll, (x, index, callback) => {
        iteratee(x, (err, v) => {
            if (err) {
                callback(err);
            } else {
                if (v) {
                    results.push({index, value: x});
                }
                callback();
            }
        });
    }, err => {
        if (err) return callback(err);
        callback(null, results
            .sort((a, b) => a.index - b.index)
            .map(v => v.value));
    });
}

export default function _filter(eachfn, coll, iteratee, callback) {
    var filter = isArrayLike(coll) ? filterArray : filterGeneric;
    return filter(eachfn, coll, wrapAsync(iteratee), callback || noop);
}
