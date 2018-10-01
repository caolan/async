import filter from './filter';
import wrapAsync from './wrapAsync'

export default function reject(eachfn, arr, _iteratee, callback) {
    const iteratee = wrapAsync(_iteratee)
    return filter(eachfn, arr, (value, cb) => {
        iteratee(value, (err, v) => {
            cb(err, !v);
        });
    }, callback);
}
