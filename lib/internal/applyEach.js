import wrapAsync from './wrapAsync.js'
import awaitify from './awaitify.js'

export default function (eachfn) {
    return function applyEach(fns, ...callArgs) {
        const go = awaitify(function (callback) {
            var that = this;
            return eachfn(fns, (fn, cb) => {
                wrapAsync(fn).apply(that, callArgs.concat(cb));
            }, callback);
        });
        return go;
    };
}
