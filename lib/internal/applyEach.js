import restParam from 'lodash/function/restParam';

export default function _applyEach(eachfn) {
    return restParam(function(fns, args) {
        var go = restParam(function(args) {
            var that = this;
            var callback = args.pop();
            return eachfn(fns, function (fn, _, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        });
        if (args.length) {
            return go.apply(this, args);
        }
        else {
            return go;
        }
    });
}
