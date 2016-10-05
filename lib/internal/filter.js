import filter from 'lodash/_arrayFilter';
import noop from 'lodash/noop';
import once from './once';

export default function _filter(eachfn, arr, iteratee, callback) {
    callback = once(callback || noop);
    var truthy = [];
    eachfn(arr, function (x, index, callback) {
        iteratee(x, function (err, v) {
            truthy[index] = !!v;
            callback(err);
        });
    }, function (err) {
        if (err) return callback(err);
        callback(null, filter(arr, function (_, index) {
            return truthy[index];
        }));
    });
}
