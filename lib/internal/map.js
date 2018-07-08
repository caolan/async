import noop from './noop';
import wrapAsync from './wrapAsync';

export default function _asyncMap(eachfn, arr, iteratee, callback) {
    callback = callback || noop;
    arr = arr || [];
    var results = [];
    var counter = 0;
    var _iteratee = wrapAsync(iteratee);

    return eachfn(arr, (value, _, callback) => {
        var index = counter++;
        _iteratee(value, (err, v) => {
            results[index] = v;
            callback(err);
        });
    }, err => {
        callback(err, results);
    });
}
