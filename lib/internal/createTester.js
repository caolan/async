import breakLoop from './breakLoop.js'
import wrapAsync from './wrapAsync.js'

export default function _createTester(check, getResult) {
    return (eachfn, arr, _iteratee, cb) => {
        var testPassed = false;
        var testResult;
        const iteratee = wrapAsync(_iteratee)
        eachfn(arr, (value, _, callback) => {
            iteratee(value, (err, result) => {
                if (err || err === false) return callback(err);

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
