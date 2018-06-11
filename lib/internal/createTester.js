import noop from './noop';
import breakLoop from './breakLoop';

export default function _createTester(check, getResult) {
    return (eachfn, arr, iteratee, cb) => {
        cb = cb || noop;
        var testPassed = false;
        var testResult;
        eachfn(arr, (value, _, callback) => {
            iteratee(value, (err, result) => {
                if (err) return callback(err)

                if (check(result) && !testResult) {
                    testPassed = true;
                    testResult = getResult(true, value);
                    return callback(null, breakLoop);
                }
                callback();
            });
        }, err => {
            if (err) return cb(err);
            cb(null, testPassed ? testResult : getResult(false));
        });
    };
}
