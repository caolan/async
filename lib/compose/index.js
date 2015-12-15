'use strict';

var seq = require('async.seq');

module.exports = function compose(/* functions... */) {
    return seq.apply(null, Array.prototype.reverse.call(arguments));
};
