import once from './once';
import wrapAsync from './wrapAsync';
import promiseCallback from './promiseCallback';

export default function _asyncMap(eachfn, arr, iteratee, callback) {
    callback = once(callback || promiseCallback());
    arr = arr || [];
    var results = [];
    var counter = 0;
    var _iteratee = wrapAsync(iteratee);

    eachfn(arr, function (value, _, callback) {
        var index = counter++;
        _iteratee(value, function (err, v) {
            results[index] = v;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });

    return callback.promise;
}
