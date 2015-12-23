'use strict';

import seq from './seq';

var reverse = Array.prototype.reverse;

export default function compose(/* functions... */) {
    return seq.apply(null, reverse.call(arguments));
}
