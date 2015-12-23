import filter from './filter';

export default function reject(eachfn, arr, iterator, callback) {
    filter(eachfn, arr, function(value, cb) {
        iterator(value, function(v) {
            cb(!v);
        });
    }, callback);
}
