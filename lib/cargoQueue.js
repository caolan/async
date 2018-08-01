import queue from './internal/queue';

/**
 * A cargoQueue of tasks for the worker function to complete. CargoQueue inherits all of
 * the same methods and event callbacks as [`queue`]{@link module:ControlFlow.queue}.
 * @typedef {Object} CargoObject
 * @memberOf module:ControlFlow
 * @property {Function} length - A function returning the number of items
 * waiting to be processed. Invoke like `cargoQueue.length()`.
 * @property {number} payload - An `integer` for determining how many tasks
 * should be process per round. This property can be changed after a `cargoQueue` is
 * created to alter the payload on-the-fly.
 * @property {number} concurrency - an integer for determining how many `worker`
 * functions should be run in parallel. This property can be changed after a
 * `cargoQueue` is created to alter the concurrency on-the-fly.
 * @property {Function} push - Adds `task` to the `cargoQueue`. The callback is
 * called once the `worker` has finished processing the task. Instead of a
 * single task, an array of `tasks` can be submitted. The respective callback is
 * used for every task in the list. Invoke like `cargoQueue.push(task, [callback])`.
 * @property {Function} unshift - add a new task to the front of the `cargoQueue`.
 * Invoke with `cargoQueue.unshift(task, [callback])`.
 * @property {Function} remove - remove items from the `cargoQueue` that match a test
 * function.  The test function will be passed an object with a `data` property,
 * and a `priority` property, if this is a
 * [priorityQueue]{@link module:ControlFlow.priorityQueue} object.
 * Invoked with `cargoQueue.remove(testFn)`, where `testFn` is of the form
 * `function ({data, priority}) {}` and returns a Boolean.
 * @property {Function} saturated - A callback that is called when the
 * `cargoQueue.length()` hits the concurrency and further tasks will be queued.
 * @property {Function} unsaturated - a callback that is called when the number
 * of running workers is less than the `concurrency` & `buffer` limits, and
 * further tasks will not be queued.
 * @property {number} buffer - A minimum threshold buffer in order to say that
 * the `cargoQueue` is `unsaturated`.
 * @property {Function} empty - A callback that is called when the last item
 * from the `cargoQueue` is given to a `worker`.
 * @property {Function} drain - A callback that is called when the last item
 * from the `cargoQueue` has returned from the `worker`.
 * @property {Function} error - a callback that is called when a task errors.
 * Has the signature `function(error, task)`.
 * @property {Function} idle - a function returning false if there are items
 * waiting or being processed, or true if not. Invoke like `cargoQueue.idle()`.
 * @property {boolean} paused - a boolean for determining whether the `cargoQueue` is
 * in a paused state.
 * @property {Function} pause - a function that pauses the processing of tasks
 * until `resume()` is called. Invoke like `cargoQueue.pause()`.
 * @property {Function} resume - a function that resumes the processing of
 * queued tasks when the queue is paused. Invoke like `cargoQueue.resume()`.
 * @property {Function} kill - a function that removes the `drain` callback and
 * empties remaining tasks from the queue forcing it to go idle. Invoke like `cargoQueue.kill()`.
 */

/**
 * Creates a `cargoQueue` object with the specified payload. Tasks added to the
 * cargoQueue will be processed together (up to the `payload` limit) in `concurrency` parallel workers.
 * If the all `workers` are in progress, the task is queued until one becomes available. Once
 * a `worker` has completed some tasks, each callback of those tasks is
 * called. Check out [these](https://camo.githubusercontent.com/6bbd36f4cf5b35a0f11a96dcd2e97711ffc2fb37/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130382f62626330636662302d356632392d313165322d393734662d3333393763363464633835382e676966) [animations](https://camo.githubusercontent.com/f4810e00e1c5f5f8addbe3e9f49064fd5d102699/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130312f38346339323036362d356632392d313165322d383134662d3964336430323431336266642e676966)
 * for how `cargo` and `queue` work.
 *
 * While [`queue`]{@link module:ControlFlow.queue} passes only one task to one of a group of workers
 * at a time, and [`cargo`]{@link module:ControlFlow.cargo} passes an array of tasks to a single worker,
 * the cargoQueue passes an array of tasks to multiple parallel workers.
 *
 * @name cargoQueue
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.queue]{@link module:ControlFlow.queue}
 * @see [async.cargo]{@link module:ControlFLow.cargo}
 * @category Control Flow
 * @param {AsyncFunction} worker - An asynchronous function for processing an array
 * of queued tasks. Invoked with `(tasks, callback)`.
 * @param {number} [concurrency=1] - An `integer` for determining how many
 * `worker` functions should be run in parallel.  If omitted, the concurrency
 * defaults to `1`.  If the concurrency is `0`, an error is thrown.
 * @param {number} [payload=Infinity] - An optional `integer` for determining
 * how many tasks should be processed per round; if omitted, the default is
 * unlimited.
 * @returns {module:ControlFlow.CargoQueueObject} A cargoQueue object to manage the tasks. Callbacks can
 * attached as certain properties to listen for specific events during the
 * lifecycle of the cargoQueue and inner queue.
 * @example
 *
 * // create a cargoQueue object with payload 2 and concurrency 2
 * var cargoQueue = async.cargoQueue(function(tasks, callback) {
 *     for (var i=0; i<tasks.length; i++) {
 *         console.log('hello ' + tasks[i].name);
 *     }
 *     callback();
 * }, 2, 2);
 *
 * // add some items
 * cargoQueue.push({name: 'foo'}, function(err) {
 *     console.log('finished processing foo');
 * });
 * cargoQueue.push({name: 'bar'}, function(err) {
 *     console.log('finished processing bar');
 * });
 * cargoQueue.push({name: 'baz'}, function(err) {
 *     console.log('finished processing baz');
 * });
 * cargoQueue.push({name: 'boo'}, function(err) {
 *     console.log('finished processing boo');
 * });
 */
export default function cargo(worker, concurrency, payload) {
    return queue(worker, concurrency, payload);
}
