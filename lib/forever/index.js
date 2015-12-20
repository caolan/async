var noop = require('async.util.noop');
var onlyOnce = require('async.util.onlyonce');
var ensureAsync = require('async.util.ensureasync');

module.exports = function forever(fn, cb) {
    var done = onlyOnce(cb || noop);
    var task = ensureAsync(fn);

    function next(err) {
        if (err) return done(err);
        task(next);
    }
    next();
};
