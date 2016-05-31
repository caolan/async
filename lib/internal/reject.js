import filter from './filter';

export default function reject(eachfn, arr, iteratee, callback) {
    filter(eachfn, arr, function(value, cb) {
        iteratee(value, function(err, v) {
            if (err) {
                cb(err);
            } else {
                cb(null, !v);
            }
        });
    }, callback);
}
