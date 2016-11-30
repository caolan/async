import rest from './rest';
import initialParams from './initialParams';

export default function applyEach(eachfn) {
    return rest(function(fns, args) {
        var go = initialParams(function(args, callback) {
            var that = this;
            return eachfn(fns, function (fn, cb) {
                fn.apply(that, args.concat(cb));
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
