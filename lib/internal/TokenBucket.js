import DLL from './DoublyLinkedList';

/**
 * An internal implementation of [Token Bucket](https://en.wikipedia.org/wiki/Token_bucket)
 * for rate-limiting/traffic shaping. Our token bucket starts with a slight twist from the
 * conventional token bucket, in which it starts with bucketSize tokens already available.
 *
 * @param {Number} bucketSize - the maximum number of items (inclusive) which can be queued in
 * a interval of time.
 * @param {Number} interval - the period in miliseconds to stop tracking a sent item
 */
export function TokenBucket(bucketSize, interval) {
    this.bucketSize = bucketSize;
    this.interval = interval;
    this.queue = new DLL();
    this.queued = 0; // Number of items sent + size of queue
}

// Enqueue an operation to be executed when the rate limit is not exceeded.
TokenBucket.prototype.enqueue = function(operation) {
    this.queued++;
    if (this.queued <= this.bucketSize) {
        operation();
    } else {
        this.queue.push(operation);
    }

    // after interval, decrement the queued count and call a queued operation (if bucket is full)
    setTimeout(onIntervalComplete, this.interval, this);
}

function onIntervalComplete(bucket) {
    bucket.queued--;
    if (bucket.queue.length > 0) {
        // call first queued operation
        (bucket.queue.shift())();
    }
}
