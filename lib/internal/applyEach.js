import initialParams from './initialParams';
import wrapAsync from './wrapAsync';

export default function applyEach(eachfn) {
    return function(fns, ...callArgs) {
        var go = initialParams(function(args, callback) {
            var that = this;
            return eachfn(fns, (fn, cb) => {
                wrapAsync(fn).apply(that, args.concat(cb));
            }, callback);
        });
        if (callArgs.length) {
            return go.apply(this, callArgs);
        }
        return go;
    };
}
