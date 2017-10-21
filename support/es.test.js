// simple async example to test ES module build output

import {waterfall as waterfall} from  "../build-es/index";
import {wrapSync} from  "../build-es/index";
import async from "../build-es/index";
import constant from "../build-es/constant";
import forEachOf from "../build-es/forEachOf";

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
    },
    function (val, next) {
        forEachOf([1, 2, 3], function (v, key, cb) {
            val += key
            cb()
        }, function (err) { next(err, val - 3) })
    }
], function (err, result) {
    if (err) { throw err; }
    console.log(result);
    if (result !== 42) {
        console.log("fail");
        process.exit(1);
    }
});
