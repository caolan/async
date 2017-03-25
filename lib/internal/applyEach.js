import arrayMap from 'lodash/_arrayMap'
import rest from './rest';
import initialParams from './initialParams';
import wrapAsync from './wrapAsync';

export default function applyEach(eachfn) {
    return rest(function(fns, args) {
        var go = initialParams(function(args, callback) {
            var that = this;
            return eachfn(arrayMap(fns, wrapAsync), function (fn, cb) {
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
