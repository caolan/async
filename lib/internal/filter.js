import each from 'lodash/each';
import isArrayLike from 'lodash/isArrayLike';
import noop from 'lodash/noop';
import once from './once';

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
        each(coll, function(_, index) {
            if (truthValues[index] === true) {
                result.push(coll[index]);
            }
        });
        callback(null, result);
    });
}
