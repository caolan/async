// simple async example to test ES module build output

import {waterfall as waterfall} from  "../build-es/index";
import async from "../build-es/index";
import constant from "../build-es/constant";

waterfall([
    constant(42),
    function (val, next) {
        async.setImmediate(function () {
            next(null, val);
        });
    }
], function (err, result) {
    if (err) { throw err; }
    console.log(result);
    if (result !== 42) {
        console.log("fail");
        process.exit(1);
    }
});
