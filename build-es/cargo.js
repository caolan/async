'use strict';

import queue from './internal/queue';

export default function cargo(worker, payload) {
    return queue(worker, 1, payload);
}
