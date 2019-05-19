import onlyOnce from './onlyOnce';
import setImmediate from './setImmediate';
import DLL from './DoublyLinkedList';
import wrapAsync from './wrapAsync';

export default function queue(worker, concurrency, payload) {
    if (concurrency == null) {
        concurrency = 1;
    }
    else if(concurrency === 0) {
        throw new RangeError('Concurrency must not be zero');
    }

    var _worker = wrapAsync(worker);
    var numRunning = 0;
    var workersList = [];
    const events = {
        error: [],
        drain: [],
        saturated: [],
        unsaturated: [],
        empty: []
    }

    function on (event, handler) {
        events[event].push(handler)
    }

    function once (event, handler) {
        const handleAndRemove = (...args) => {
            off(event, handleAndRemove)
            handler(...args)
        }
        events[event].push(handleAndRemove)
    }

    function off (event, handler) {
        if (!event) return Object.keys(events).forEach(ev => events[ev] = [])
        if (!handler) return events[event] = []
        events[event] = events[event].filter(ev => ev !== handler)
    }

    function trigger (event, ...args) {
        events[event].forEach(handler => handler(...args))
    }

    var processingScheduled = false;
    function _insert(data, insertAtFront, callback) {
        if (callback != null && typeof callback !== 'function') {
            throw new Error('task callback must be a function');
        }
        q.started = true;
        if (Array.isArray(data)) {
            if (data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return setImmediate(() => trigger('drain'));
            }

            return data.map(datum => _insert(datum, insertAtFront, callback));
        }

        var res;

        var item = {
            data,
            callback: callback || function (err, ...args) {
                // we don't care about the error, let the global error handler
                // deal with it
                if (err) return
                if (args.length <= 1) return res(args[0])
                res(args)
            }
        };

        if (insertAtFront) {
            q._tasks.unshift(item);
        } else {
            q._tasks.push(item);
        }

        if (!processingScheduled) {
            processingScheduled = true;
            setImmediate(() => {
                processingScheduled = false;
                q.process();
            });
        }

        if (!callback) {
            return new Promise((resolve) => {
                res = resolve
            })
        }
    }

    function _createCB(tasks) {
        return function (err, ...args) {
            numRunning -= 1;

            for (var i = 0, l = tasks.length; i < l; i++) {
                var task = tasks[i];

                var index = workersList.indexOf(task);
                if (index === 0) {
                    workersList.shift();
                } else if (index > 0) {
                    workersList.splice(index, 1);
                }

                task.callback(err, ...args);

                if (err != null) {
                    trigger('error', err, task.data);
                }
            }

            if (numRunning <= (q.concurrency - q.buffer) ) {
                trigger('unsaturated')
            }

            if (q.idle()) {
                trigger('drain')
            }
            q.process();
        };
    }

    const eventMethod = (name) => (handler) => {
        if (!handler) {
            return new Promise((resolve, reject) => {
                once(name, (err, data) => {
                    if (err) return reject(err)
                    resolve(data)
                })
            })
        }
        off(name)
        on(name, handler)

    }

    var isProcessing = false;
    var q = {
        _tasks: new DLL(),
        *[Symbol.iterator] () {
            yield* q._tasks[Symbol.iterator]()
        },
        concurrency,
        payload,
        saturated: eventMethod('saturated'),
        unsaturated: eventMethod('unsaturated'),
        buffer: concurrency / 4,
        empty: eventMethod('empty'),
        drain: eventMethod('drain'),
        error: eventMethod('error'),
        started: false,
        paused: false,
        push (data, callback) {
            return _insert(data, false, callback);
        },
        kill () {
            off()
            q._tasks.empty();
        },
        unshift (data, callback) {
            return _insert(data, true, callback);
        },
        remove (testFn) {
            q._tasks.remove(testFn);
        },
        process () {
            // Avoid trying to start too many processing operations. This can occur
            // when callbacks resolve synchronously (#1267).
            if (isProcessing) {
                return;
            }
            isProcessing = true;
            while(!q.paused && numRunning < q.concurrency && q._tasks.length){
                var tasks = [], data = [];
                var l = q._tasks.length;
                if (q.payload) l = Math.min(l, q.payload);
                for (var i = 0; i < l; i++) {
                    var node = q._tasks.shift();
                    tasks.push(node);
                    workersList.push(node);
                    data.push(node.data);
                }

                numRunning += 1;

                if (q._tasks.length === 0) {
                    trigger('empty');
                }

                if (numRunning === q.concurrency) {
                    trigger('saturated');
                }

                var cb = onlyOnce(_createCB(tasks));
                _worker(data, cb);
            }
            isProcessing = false;
        },
        length () {
            return q._tasks.length;
        },
        running () {
            return numRunning;
        },
        workersList () {
            return workersList;
        },
        idle() {
            return q._tasks.length + numRunning === 0;
        },
        pause () {
            q.paused = true;
        },
        resume () {
            if (q.paused === false) { return; }
            q.paused = false;
            setImmediate(q.process);
        }
    };
    return q;
}
