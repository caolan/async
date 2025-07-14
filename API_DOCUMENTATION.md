# Async.js - Comprehensive API Documentation

## Overview

Async is a utility module which provides straight-forward, powerful functions for working with asynchronous JavaScript. Although originally designed for use with Node.js, it can also be used directly in the browser.

**Version:** 3.2.6  
**Homepage:** https://caolan.github.io/async/  
**Repository:** https://github.com/caolan/async

## Installation

```bash
npm install async
```

## Basic Usage

```javascript
// CommonJS
const async = require('async');

// ES6 Modules
import async from 'async';

// Browser (global)
<script src="async.js"></script>
```

## Function Types

All async functions support three usage patterns:

1. **Callbacks** - Traditional Node.js style callbacks
2. **Promises** - Returns a Promise when no callback is provided
3. **Async/Await** - Works with ES2017 async/await syntax

## API Categories

- [Collections](#collections) - Functions for manipulating arrays and objects
- [Control Flow](#control-flow) - Functions for controlling script execution flow  
- [Utils](#utils) - Utility functions

---

## Collections

Functions for manipulating collections such as arrays and objects.

### each / forEach

Applies the function `iteratee` to each item in `coll`, in parallel.

```javascript
// Callback style
async.each(['file1','file2','file3'], fs.unlink, function(err) {
    // if any of the file removals produced an error, err would equal that error
});

// Promise style
async.each(['file1','file2','file3'], fs.unlink)
.then(() => {
    // all files have been deleted
}).catch(err => {
    // handle error
});

// Async/await style
try {
    await async.each(['file1','file2','file3'], fs.unlink);
    // all files have been deleted
} catch (err) {
    // handle error
}
```

**Parameters:**
- `coll` - A collection to iterate over
- `iteratee` - An async function to apply to each item in coll
- `callback` - Optional callback when all iteratee functions have finished

### eachSeries / forEachSeries

Same as `each`, but runs only one iteratee at a time.

```javascript
async.eachSeries(['file1','file2','file3'], fs.unlink, callback);
```

### eachLimit / forEachLimit

Same as `each`, but runs a maximum of `limit` iteratees at a time.

```javascript
async.eachLimit(['file1','file2','file3'], 2, fs.unlink, callback);
```

### eachOf / forEachOf

Like `each`, except that it passes the key (or index) as the second argument to the iteratee.

```javascript
const obj = {dev: "/dev.json", test: "/test.json", prod: "/prod.json"};

async.eachOf(obj, (value, key, callback) => {
    console.log(`Processing ${key}: ${value}`);
    callback();
}, err => {
    // finished
});
```

### eachOfSeries / forEachOfSeries

Same as `eachOf`, but runs only one iteratee at a time.

### eachOfLimit / forEachOfLimit

Same as `eachOf`, but runs a maximum of `limit` iteratees at a time.

### map

Produces a new collection by mapping each value through the `iteratee` function.

```javascript
// Example: Get file sizes
async.map(['file1.txt','file2.txt','file3.txt'], fs.stat, function(err, results) {
    // results is now an array of stats for each file
});

// With async/await
const results = await async.map(['file1.txt','file2.txt','file3.txt'], fs.stat);
```

**Parameters:**
- `coll` - A collection to iterate over
- `iteratee` - An async function to apply to each item
- `callback` - Callback with (err, results)

### mapSeries

Same as `map`, but runs only one iteratee at a time.

### mapLimit

Same as `map`, but runs a maximum of `limit` iteratees at a time.

### mapValues

Like `map`, but for objects. Produces a new Object by mapping each value through the `iteratee` function.

```javascript
async.mapValues({
    f1: 'file1',
    f2: 'file2', 
    f3: 'file3'
}, fs.stat, function(err, result) {
    // result is now {f1: stat, f2: stat, f3: stat}
});
```

### mapValuesSeries

Same as `mapValues`, but runs only one iteratee at a time.

### mapValuesLimit

Same as `mapValues`, but runs a maximum of `limit` iteratees at a time.

### filter / select

Returns a new array of all the values in `coll` which pass an async truth test.

```javascript
async.filter(['file1','file2','file3'], fs.exists, function(err, results) {
    // results now equals an array of the existing files
});
```

### filterSeries / selectSeries

Same as `filter`, but runs only one iteratee at a time.

### filterLimit / selectLimit

Same as `filter`, but runs a maximum of `limit` iteratees at a time.

### reject

The opposite of `filter`. Removes values that pass an async truth test.

```javascript
async.reject(['file1','file2','file3'], fs.exists, function(err, results) {
    // results now equals an array of the non-existing files
});
```

### rejectSeries

Same as `reject`, but runs only one iteratee at a time.

### rejectLimit

Same as `reject`, but runs a maximum of `limit` iteratees at a time.

### reduce / inject / foldl

Reduces `coll` into a single value using an async `iteratee` to return each successive step.

```javascript
async.reduce([1,2,3], 0, function(memo, item, callback) {
    // pointless async:
    process.nextTick(function() {
        callback(null, memo + item)
    });
}, function(err, result) {
    // result is now equal to the last value of memo, which is 6
});
```

### reduceRight / foldr

Same as `reduce`, but processes the array from right to left.

### detect / find

Returns the first value in `coll` that passes an async truth test.

```javascript
async.detect(['file1','file2','file3'], fs.exists, function(err, result) {
    // result now equals the first file in the list that exists
});
```

### detectSeries / findSeries

Same as `detect`, but runs only one iteratee at a time.

### detectLimit / findLimit

Same as `detect`, but runs a maximum of `limit` iteratees at a time.

### sortBy

Sorts a list by the results of running each `coll` value through an async `iteratee`.

```javascript
async.sortBy(['file1','file2','file3'], function(file, callback) {
    fs.stat(file, function(err, stats) {
        callback(err, stats.mtime);
    });
}, function(err, results) {
    // results is now the original array of files sorted by modified date
});
```

### some / any

Returns `true` if at least one element in the `coll` satisfies an async test.

```javascript
async.some(['file1','file2','file3'], fs.exists, function(err, result) {
    // if result is true then at least one of the files exists
});
```

### someSeries / anySeries

Same as `some`, but runs only one iteratee at a time.

### someLimit / anyLimit

Same as `some`, but runs a maximum of `limit` iteratees at a time.

### every / all

Returns `true` if every element in `coll` satisfies an async test.

```javascript
async.every(['file1','file2','file3'], fs.exists, function(err, result) {
    // if result is true then every file exists
});
```

### everySeries / allSeries

Same as `every`, but runs only one iteratee at a time.

### everyLimit / allLimit

Same as `every`, but runs a maximum of `limit` iteratees at a time.

### groupBy

Returns a new object, where each value corresponds to an array of items, from `coll`, that returned the corresponding key.

```javascript
async.groupBy(['userId1', 'userId2', 'userId3'], function(userId, callback) {
    db.findById(userId, function(err, user) {
        if (err) return callback(err);
        return callback(null, user.age);
    });
}, function(err, result) {
    // result is something like:
    // { 30: ['userId1'], 25: ['userId2', 'userId3'] }
});
```

### groupBySeries

Same as `groupBy`, but runs only one iteratee at a time.

### groupByLimit

Same as `groupBy`, but runs a maximum of `limit` iteratees at a time.

### concat / flatMap

Applies `iteratee` to each item in `coll`, concatenating the results.

```javascript
async.concat(['dir1','dir2','dir3'], fs.readdir, function(err, files) {
    // files is now a flattened array of all files in the three directories
});
```

### concatSeries / flatMapSeries

Same as `concat`, but runs only one iteratee at a time.

### concatLimit / flatMapLimit

Same as `concat`, but runs a maximum of `limit` iteratees at a time.

---

## Control Flow

Functions for controlling the flow through a script.

### series

Run the functions in the `tasks` collection in series, each one running once the previous function has completed.

```javascript
async.series([
    function(callback) {
        // do some stuff ...
        callback(null, 'one');
    },
    function(callback) {
        // do some more stuff ...
        callback(null, 'two');
    }
], function(err, results) {
    // results is now equal to ['one', 'two']
});

// Using object instead of array
async.series({
    one: function(callback) {
        setTimeout(function() {
            callback(null, 1);
        }, 200);
    },
    two: function(callback){
        setTimeout(function() {
            callback(null, 2);
        }, 100);
    }
}, function(err, results) {
    // results is now equal to: {one: 1, two: 2}
});
```

### parallel

Run the `tasks` collection of functions in parallel, without waiting until the previous function has completed.

```javascript
async.parallel([
    function(callback) {
        setTimeout(function() {
            callback(null, 'one');
        }, 200);
    },
    function(callback) {
        setTimeout(function() {
            callback(null, 'two');
        }, 100);
    }
], function(err, results) {
    // the results array will equal ['one','two'] even though
    // the second function had a shorter timeout.
});
```

### parallelLimit

Same as `parallel`, but runs a maximum of `limit` async operations at a time.

```javascript
async.parallelLimit([
    asyncTask1,
    asyncTask2,
    asyncTask3
], 2, callback);
```

### waterfall

Runs the `tasks` array of functions in series, each passing their results to the next in the array.

```javascript
async.waterfall([
    function(callback) {
        callback(null, 'one', 'two');
    },
    function(arg1, arg2, callback) {
        // arg1 now equals 'one' and arg2 now equals 'two'
        callback(null, 'three');
    },
    function(arg1, callback) {
        // arg1 now equals 'three'
        callback(null, 'done');
    }
], function (err, result) {
    // result now equals 'done'
});
```

### auto

Determines the best order for running the async functions in `tasks`, based on their requirements.

```javascript
async.auto({
    get_data: function(callback) {
        console.log('in get_data');
        // async code to get some data
        callback(null, 'data', 'converted to array');
    },
    make_folder: function(callback) {
        console.log('in make_folder');
        // async code to create a directory to store a file in
        // this is run at the same time as getting the data
        callback(null, 'folder');
    },
    write_file: ['get_data', 'make_folder', function(results, callback) {
        console.log('in write_file', JSON.stringify(results));
        // once there is some data and the directory exists,
        // write the data to a file in the directory
        callback(null, 'filename');
    }],
    email_link: ['write_file', function(results, callback) {
        console.log('in email_link', JSON.stringify(results));
        // once the file is written let's email a link to it...
        callback(null, {'file':results.write_file, 'email':'user@example.com'});
    }]
}, function(err, results) {
    console.log('err = ', err);
    console.log('results = ', results);
});
```

### autoInject

A dependency-injected version of the `auto` function.

```javascript
async.autoInject({
    get_data: function(callback) {
        // async code to get some data
        callback(null, 'data', 'converted to array');
    },
    make_folder: function(callback) {
        // async code to create a directory to store a file in
        callback(null, 'folder');
    },
    write_file: function(get_data, make_folder, callback) {
        // once there is some data and the directory exists,
        // write the data to a file in the directory
        callback(null, 'filename');
    },
    email_link: function(write_file, callback) {
        // once the file exists let's email a link to it...
        callback(null, {'file':write_file, 'email':'user@example.com'});
    }
}, function(err, results) {
    console.log('err = ', err);
    console.log('results = ', results);
});
```

### queue

Creates a queue object with the specified concurrency. Tasks added to the queue are processed in parallel (up to the concurrency limit).

```javascript
// create a queue object with concurrency 2
const q = async.queue(function(task, callback) {
    console.log('hello ' + task.name);
    callback();
}, 2);

// assign a callback
q.drain(function() {
    console.log('all items have been processed');
});

// add some items to the queue
q.push({name: 'foo'}, function(err) {
    console.log('finished processing foo');
});

// add some items to the queue (batch-wise)
q.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}], function(err) {
    console.log('finished processing item');
});

// add some items to the front of the queue
q.unshift({name: 'bar'}, function (err) {
    console.log('finished processing bar');
});
```

**Queue Object Properties:**
- `length()` - Number of items waiting to be processed
- `running()` - Number of items currently being processed
- `workersList()` - Array of items currently being processed
- `idle()` - Returns true if no items are waiting or being processed
- `concurrency` - Integer for determining how many workers run in parallel
- `push(task, [callback])` - Add a new task to the queue
- `unshift(task, [callback])` - Add a new task to the front of the queue
- `pause()` - Pause the processing of tasks
- `resume()` - Resume the processing of queued tasks
- `kill()` - Remove the drain callback and empty remaining tasks

### priorityQueue

Same as `queue`, but tasks are assigned a priority and completed in ascending priority order.

```javascript
const q = async.priorityQueue(function(task, callback) {
    console.log('hello ' + task.name);
    callback();
}, 2);

// add some items to the queue with priority
q.push({name: 'foo'}, 1, function(err) {
    console.log('finished processing foo');
});

q.push({name: 'bar'}, 2, function(err) {
    console.log('finished processing bar');
});
```

### cargo

Creates a cargo object with the specified payload. Tasks added to the cargo will be processed altogether (up to the payload limit).

```javascript
const cargo = async.cargo(function(tasks, callback) {
    for (let i=0; i<tasks.length; i++) {
        console.log('hello ' + tasks[i].name);
    }
    callback();
}, 2);

// add some items
cargo.push({name: 'foo'}, function(err) {
    console.log('finished processing foo');
});
```

### cargoQueue

Creates a cargoQueue object with the specified payload. Tasks added to the cargoQueue will be processed altogether (up to the payload limit).

### race

Runs the `tasks` array of functions in parallel, without waiting until the previous function has completed. Once any of the `tasks` complete or pass an error to its callback, the main `callback` is immediately called.

```javascript
async.race([
    function(callback) {
        setTimeout(function() {
            callback(null, 'one');
        }, 200);
    },
    function(callback) {
        setTimeout(function() {
            callback(null, 'two');
        }, 100);
    }
], function(err, result) {
    // the result will be equal to 'two' as it finishes earlier
});
```

### tryEach

Runs the `tasks` array of functions in series, each one running once the previous function has completed. If any functions in the series pass an error to its callback, the next function is run; if no function in the series passes an error, the results of the last function are passed to the callback.

```javascript
async.tryEach([
    function(callback) {
        fs.readFile('file1.txt', callback);
    },
    function(callback) {
        fs.readFile('file2.txt', callback);
    }
], function(err, result) {
    // result now equals the first file that was successfully read
});
```

### whilst

Repeatedly call `iteratee`, while `test` returns `true`. Calls `callback` when stopped or an error occurs.

```javascript
let count = 0;
async.whilst(
    function test(cb) { cb(null, count < 5); },
    function iteratee(callback) {
        count++;
        setTimeout(function() {
            callback(null, count);
        }, 1000);
    },
    function (err, n) {
        // 5 seconds have passed, n = 5
    }
);
```

### doWhilst

A post-check version of `whilst`. Calls `iteratee` at least once, then repeatedly calls `iteratee` while `test` returns `true`.

### until

Repeatedly call `iteratee` until `test` returns `true`. Calls `callback` when stopped or an error occurs.

### doUntil

A post-check version of `until`. Calls `iteratee` at least once, then repeatedly calls `iteratee` until `test` returns `true`.

### forever

Calls the asynchronous function `fn` with a callback parameter that allows it to call itself again, in series, indefinitely.

```javascript
async.forever(
    function(next) {
        // next is suitable for passing to things that need a callback(err [, whatever]);
        // it will result in this function being called again.
    },
    function(err) {
        // if next is called with a truthy error argument,
        // it will be passed to this callback
    }
);
```

### compose

Creates a function which is a composition of the passed asynchronous functions.

```javascript
function add1(n, callback) {
    setTimeout(function () {
        callback(null, n + 1);
    }, 10);
}

function mul3(n, callback) {
    setTimeout(function () {
        callback(null, n * 3);
    }, 10);
}

const add1mul3 = async.compose(mul3, add1);
add1mul3(4, function (err, result) {
    // result now equals 15
});
```

### seq

Version of the compose function that is more natural to read. Each function consumes the return value of the previous function.

```javascript
const add1mul3 = async.seq(add1, mul3);
add1mul3(4, function (err, result) {
    // result now equals 15
});
```

### applyEach

Applies the provided arguments to each function in the array, calling `callback` after all functions have completed.

```javascript
async.applyEach([enableSearch, updateSchema], 'bucket', callback);
```

### applyEachSeries

Same as `applyEach`, but runs only one function at a time.

### times

Calls the `iteratee` function `n` times, and accumulates results in the same manner as `map`.

```javascript
async.times(5, function(n, next) {
    createUser(n, function(err, user) {
        next(err, user);
    });
}, function(err, users) {
    // we should now have 5 users
});
```

### timesSeries

Same as `times`, but runs only one iteratee at a time.

### timesLimit

Same as `times`, but runs a maximum of `limit` iteratees at a time.

---

## Utils

Utility functions.

### asyncify / wrapSync

Take a sync function and make it async, passing its return value to a callback.

```javascript
// Wrapping a sync function
async.waterfall([
    async.apply(fs.readFile, filename, "utf8"),
    async.asyncify(JSON.parse),
    function (data, next) {
        // data is the result of parsing the text.
        // If there was a parsing error, it would have been caught.
    }
], callback);

// Wrapping a function returning a promise
async.waterfall([
    async.apply(fs.readFile, filename, "utf8"),
    async.asyncify(function (contents) {
        return db.model.create(contents);
    }),
    function (model, next) {
        // `model` is the instantiated model object.
        // If there was an error, this function would be skipped.
    }
], callback);
```

### apply

Creates a continuation function with some arguments already applied.

```javascript
// using apply
async.parallel([
    async.apply(fs.writeFile, 'testfile1', 'test1'),
    async.apply(fs.writeFile, 'testfile2', 'test2')
]);

// the same process without using apply
async.parallel([
    function(callback) {
        fs.writeFile('testfile1', 'test1', callback);
    },
    function(callback) {
        fs.writeFile('testfile2', 'test2', callback);
    }
]);
```

### nextTick

Calls `callback` on a later loop around the event loop.

```javascript
async.nextTick(function() {
    console.log('call on next tick');
});
```

### setImmediate

Calls `callback` as soon as possible.

```javascript
async.setImmediate(function (a, b, c) {
    // a, b, c equal 1, 2, 3
}, 1, 2, 3);
```

### memoize

Caches the results of an async function. When the memoized function is called, its callback is called immediately if the key has already been computed.

```javascript
const memoizedFn = async.memoize(function(key, callback) {
    // expensive operation
    callback(null, result);
});

memoizedFn('key1', function(err, result) {
    // result is computed
});

memoizedFn('key1', function(err, result) {
    // result is retrieved from cache
});
```

### unmemoize

Undoes a memoized function, reverting it to the original, unmemoized form.

```javascript
const unmemoizedFn = async.unmemoize(memoizedFn);
```

### ensureAsync

Wrap an async function and ensure it calls its callback on a later tick of the event loop.

```javascript
function sometimesAsync(arg, callback) {
    if (cache[arg]) {
        return callback(null, cache[arg]); // this would be synchronous!!
    } else {
        doSomeIO(arg, callback); // this IO would be asynchronous
    }
}

// this has a risk of stack overflows if many results are cached in a row
async.mapSeries(args, sometimesAsync, done);

// this is always safe:
async.mapSeries(args, async.ensureAsync(sometimesAsync), done);
```

### constant

Returns a function that when called, calls-back with the values provided.

```javascript
const getValue = async.constant(42);
getValue(function(err, value) {
    console.log(value); // 42
});
```

### log

Logs the result of an async function.

```javascript
async.waterfall([
    function(callback) {
        callback(null, 'one', 'two');
    },
    async.log,
    function(arg1, arg2, callback) {
        // 'one' and 'two' will be logged
        callback(null, 'three');
    }
], done);
```

### dir

Logs the result of an async function with `console.dir`.

### reflect

Wraps the async function in another function that always completes with a result object, even when it errors out.

```javascript
async.parallel([
    async.reflect(function(callback) {
        // do some stuff ...
        callback(null, 'one');
    }),
    async.reflect(function(callback) {
        // do some more stuff but error ...
        callback('bad stuff happened');
    }),
    async.reflect(function(callback) {
        // do some more stuff ...
        callback(null, 'two');
    })
], function(err, results) {
    // results is now:
    // [
    //   { value: 'one' },
    //   { error: 'bad stuff happened' },
    //   { value: 'two' }
    // ]
});
```

### reflectAll

A helper function that wraps an array of async functions with `reflect`.

```javascript
const tasks = async.reflectAll([task1, task2, task3]);
async.parallel(tasks, callback);
```

### timeout

Sets a time limit on an asynchronous function. If the function does not call its callback within the specified milliseconds, it will be called with a timeout error.

```javascript
function myFunction(foo, callback) {
    doAsyncTask(foo, function(err, data) {
        // handle errors
        if (err) return callback(err);

        // do some stuff ...
        callback(null, data);
    });
}

const wrapped = async.timeout(myFunction, 1000);

// call `wrapped` as you would `myFunction`
wrapped({ ... }, function(err, data) {
    // if `myFunction` takes < 1000 ms to execute, `err`
    // and `data` will have their expected values

    // if `myFunction` takes > 1000 ms to execute, `err` will
    // be an Error with the code 'ETIMEDOUT'
});
```

### retry

Attempts to get a successful response from `task` no more than `times` times before returning an error.

```javascript
async.retry(3, function(callback, results) {
    // attempt task
    // results contains any previous successful/failed attempts
    callback(err, result);
}, function(err, result) {
    // final result
});

// with options
async.retry({times: 3, interval: 200}, function(callback) {
    // attempt task
    callback(err, result);
}, callback);
```

### retryable

A close relative of `retry`. This method wraps a task and makes it retryable, rather than immediately calling it with retries.

```javascript
const retryableTask = async.retryable(3, function(callback) {
    // attempt task
    callback(err, result);
});

// use the retryable task
retryableTask(function(err, result) {
    // final result after retries
});
```

### transform

A relative of `reduce`. Takes an Object or Array, and iterates over each element in parallel, each step potentially mutating an `accumulator` value.

```javascript
async.transform([1, 2, 3], function(acc, item, index, callback) {
    // pointless async:
    process.nextTick(function() {
        acc[index] = item * 2;
        callback(null);
    });
}, function(err, result) {
    // result is {0: 2, 1: 4, 2: 6}
});
```

---

## Aliases

Many functions have aliases for compatibility and convenience:

- `all` → `every`
- `allLimit` → `everyLimit`
- `allSeries` → `everySeries`
- `any` → `some`
- `anyLimit` → `someLimit`
- `anySeries` → `someSeries`
- `find` → `detect`
- `findLimit` → `detectLimit`
- `findSeries` → `detectSeries`
- `flatMap` → `concat`
- `flatMapLimit` → `concatLimit`
- `flatMapSeries` → `concatSeries`
- `forEach` → `each`
- `forEachSeries` → `eachSeries`
- `forEachLimit` → `eachLimit`
- `forEachOf` → `eachOf`
- `forEachOfSeries` → `eachOfSeries`
- `forEachOfLimit` → `eachOfLimit`
- `inject` → `reduce`
- `foldl` → `reduce`
- `foldr` → `reduceRight`
- `select` → `filter`
- `selectLimit` → `filterLimit`
- `selectSeries` → `filterSeries`
- `wrapSync` → `asyncify`
- `during` → `whilst`
- `doDuring` → `doWhilst`

---

## Error Handling

All async functions follow Node.js callback conventions:
- Callbacks take the form `(err, result)`
- If an error occurs, `err` will be non-null and `result` may be undefined
- If no error occurs, `err` will be null and `result` will contain the result

### Error-First Callbacks

```javascript
async.map(['file1', 'file2'], fs.readFile, function(err, results) {
    if (err) {
        console.error('Error reading files:', err);
        return;
    }
    console.log('Files read successfully:', results);
});
```

### Promise Error Handling

```javascript
async.map(['file1', 'file2'], fs.readFile)
.then(results => {
    console.log('Files read successfully:', results);
})
.catch(err => {
    console.error('Error reading files:', err);
});
```

### Async/Await Error Handling

```javascript
try {
    const results = await async.map(['file1', 'file2'], fs.readFile);
    console.log('Files read successfully:', results);
} catch (err) {
    console.error('Error reading files:', err);
}
```

---

## TypeScript Support

Async.js includes TypeScript definitions. Here's an example of usage:

```typescript
import * as async from 'async';

interface FileInfo {
    name: string;
    size: number;
}

const files: string[] = ['file1.txt', 'file2.txt'];

async.map<string, FileInfo>(files, (file: string, callback) => {
    fs.stat(file, (err, stats) => {
        if (err) return callback(err);
        callback(null, { name: file, size: stats.size });
    });
}, (err: Error | null, results?: FileInfo[]) => {
    if (err) {
        console.error(err);
    } else {
        console.log(results);
    }
});
```

---

## Performance Tips

1. **Use appropriate concurrency limits** - Don't run unlimited parallel operations
2. **Choose the right function** - Use `Series` for order-dependent operations, `Limit` for controlled concurrency
3. **Error handling** - Always handle errors appropriately to prevent uncaught exceptions
4. **Memory management** - Be careful with large collections and memory usage
5. **Use Promises/async-await** when appropriate for cleaner code

---

## Browser Support

Async.js works in all modern browsers and Node.js environments. For older browsers, you may need polyfills for Promise support.

---

## Migration Notes

### From v2 to v3
- Some function signatures have changed
- Better Promise support
- Improved TypeScript definitions
- See CHANGELOG.md for detailed migration guide

---

## Contributing

For bug reports and feature requests, please visit the [GitHub repository](https://github.com/caolan/async).

## License

MIT License - see LICENSE file for details.