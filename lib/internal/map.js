import noop from 'lodash/noop';
import once from './once';

export default function _asyncMap(eachfn, arr, iteratee, callback) {
    callback = once(callback || noop);
    arr = arr || [];
    var results = [];
    var counter = 0;

    eachfn(arr, function (value, _, callback) {
        var index = counter++;
        iteratee(value, function (err, v) {
            results[index] = v;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });
}
