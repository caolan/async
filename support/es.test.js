// simple async example to test ES module build output

import {default as async, waterfall as wf, wrapSync} from  "../build-es/index";
import constant from "../build-es/constant";
import forEachOf from "../build-es/forEachOf";

wf([
    constant(42),
    function (val, next) {
        async.setImmediate(() => {
            next(null, val);
        });
    },
    wrapSync((a) => { return a; }),
    function (val, next) {
        async.forEachOf({a: 1}, (v, key, cb) => {
            if (v !== 1 && key !== 'a') return cb(new Error('fail!'));
            cb();
        }, (err) => { next (err, val)});
    },
    function (val, next) {
        forEachOf([1, 2, 3], (v, key, cb) => {
            val += key
            cb()
        }, (err) => { next(err, val - 3) })
    }
], (err, result) => {
    if (err) { throw err; }
    console.log(result);
    if (result !== 42) {
        console.log("fail");
        process.exit(1);
    }
});
