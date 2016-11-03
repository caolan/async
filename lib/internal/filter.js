import filter from 'lodash/filter';
import noop from 'lodash/noop';
import once from './once';

export default function _filter(eachfn, arr, iteratee, callback) {
    callback = once(callback || noop);
    var truthValues = new Array(arr.length);
    eachfn(arr, function (x, index, callback) {
        iteratee(x, function (err, v) {
            truthValues[index] = !!v;
            callback(err);
        });
    }, function (err) {
        if (err) return callback(err);
        callback(null, filter(arr, function (_, index) {
            return truthValues[index];
        }));
    });
}
