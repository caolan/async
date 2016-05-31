import eachOfLimit from './eachOfLimit';

export default function mapValuesLimit(obj, limit, iteratee, callback) {
    var newObj = {};
    eachOfLimit(obj, limit, function(val, key, next) {
        iteratee(val, key, function (err, result) {
            if (err) return next(err);
            newObj[key] = result;
            next();
        })
    }, function (err) {
        callback(err, newObj);
    })
}
