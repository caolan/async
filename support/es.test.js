// simple async example to test ES module build output

import {waterfall as waterfall} from  "../build-es/index";
import {wrapSync} from  "../build-es/index";
import async from "../build-es/index";
import constant from "../build-es/constant";

waterfall([
    constant(42),
    function (val, next) {
        async.setImmediate(function () {
            next(null, val);
        });
    },
    wrapSync(function (a) { return a; }),
    function (val, next) {
        async.forEachOf({a: 1}, function (val, key, cb) {
            if (val !== 1 && key !== 'a') return cb(new Error('fail!'));
            cb();
        }, function (err) { next (err, val)});
    }
], function (err, result) {
    if (err) { throw err; }
    console.log(result);
    if (result !== 42) {
        console.log("fail");
        process.exit(1);
    }
});
