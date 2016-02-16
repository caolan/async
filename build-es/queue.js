'use strict';

import queue from './internal/queue';

export default function (worker, concurrency) {
    return queue(function (items, cb) {
        worker(items[0], cb);
    }, concurrency, 1);
}
