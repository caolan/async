import filter from './filter';

export default function reject(eachfn, arr, iteratee, callback) {
    return filter(eachfn, arr, (value, cb) => {
        iteratee(value, (err, v) => {
            cb(err, !v);
        });
    }, callback);
}
