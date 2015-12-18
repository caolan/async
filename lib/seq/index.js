var noop = require('../util/noop');
var reduce = require('../reduce');
var restParam = require('../util/restparam');

module.exports = function seq( /* functions... */ ) {
    var fns = arguments;
    return restParam(function(args) {
        var that = this;

        var cb = args[args.length - 1];
        if (typeof cb == 'function') {
            args.pop();
        } else {
            cb = noop;
        }

        reduce(fns, args, function(newargs, fn, cb) {
                fn.apply(that, newargs.concat([restParam(function(err, nextargs) {
                    cb(err, nextargs);
                })]));
            },
            function(err, results) {
                cb.apply(that, [err].concat(results));
            });
    });
};
