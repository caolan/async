var noop = require('../util/noop');
var onlyOnce = require('../util/onlyonce');
var ensureAsync = require('../util/ensureasync');

module.exports = function forever(fn, cb) {
    var done = onlyOnce(cb || noop);
    var task = ensureAsync(fn);

    function next(err) {
        if (err) return done(err);
        task(next);
    }
    next();
};
