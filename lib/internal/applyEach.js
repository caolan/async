import rest from './rest';
import initialParams from './initialParams';
import wrapAsync from './wrapAsync';

export default function applyEach(eachfn) {
    return rest(function(fns, args) {
        var go = initialParams(function(args, callback) {
            var that = this;
            return eachfn(fns, function (fn, cb) {
                wrapAsync(fn).apply(that, args.concat(cb));
            }, callback);
        });
        if (args.length) {
            return go.apply(this, args);
        }
        else {
            return go;
        }
    });
}
