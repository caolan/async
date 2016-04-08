# v2.0.0

Lots of changes here! The biggest feature is modularization. You can now `require("async/series")` to only require the `series` function. Every Async library function is available this way. You still can `require("async")` to require the entire library, like you could do before.

We also provide Async as a collection of ES2015 modules. You can now `import {each} from 'async-es'` or `import waterfall from 'async-es/waterfall'`. If you are using only a few Async functions, and are using a ES bundler such as Rollup, this can significantly lower your build size.

Major thanks to [**@Kikobeats**](github.com/Kikobeats), [**@aearly**](github.com/aearly) and [**@megawac**](github.com/megawac) for doing the majority of the modularization work, as well as [**@jdalton**](github.com/jdalton) and [**@Rich-Harris**](github.com/Rich-Harris) for advisory work on the general modularization strategy.

Another one of the general themes of the 2.0 release is standardization of what an "async" function is. We are now more strictly following the node-style continuation passing style. That is, an async function is a function that:

1. Takes a variable number of arguments
2. The last argument is always a callback
3. The callback can accept any number of arguments
4. The first argument passed to the callback will be treated as an error result, if the argument is truthy
5. Any number of result arguments can be passed after the "error" argument
6. The callback is called once and exactly once, either on the same tick or later tick of the JavaScript event loop.

There were several cases where Async accepted some functions that did not strictly have these properties, most notably `auto`, `every`, `some`, and `filter`.

Another theme is performance. We have eliminated internal deferrals in all cases where they make sense. For example, in `waterfall` and `auto`, there was a `setImmediate` between each task -- these deferrals have been removed. A `setImmediate` call can add up to 1ms of delay. This might not seem like a lot, but it can add up if you are using many Async functions in the course of processing a HTTP request, for example. Nearly all asynchronous functions that do I/O already have some sort of deferral built in, so the extra deferral is unnecessary. The trade-off of this change is removing our built-in stack-overflow defense. Many synchronous callback calls in series can quickly overflow the JS call stack. If you do have a function that is sometimes synchronous (calling its callback on the same tick), and are running into stack overflows, wrap it with `async.ensureAsync()`.

## New Features

- Async is now modularized. Individual functions can be `require()`d from the main package. (`require('async/auto')`) (#984, #996)
- Async is also available as a collection of ES2015 modules in the new `async-es` package. (`import {forEachSeries} from 'async-es'`) (#984, #996)
- Added `race`, analogous to `Promise.race()`. It will run an array of async tasks in parallel and will call its callback with the result of the first task to respond. (#568, #1038)
- Collection methods now accept ES2015 iterators.  Maps, Sets, and anything that implements the iterator spec can now be passed directly to `each`, `map`, `parallel`, etc.. (#579, #839, #1074)
- Added `timeout`, a wrapper for an async function that will make the task time-out after the specified time. (#1007, #1027)
- Added `reflect` and `reflectAll`, analagous to [`Promise.reflect()`](http://bluebirdjs.com/docs/api/reflect.html), a wrapper for async tasks that always succeeds, by gathering results and errors into an object.  (#942, #1012, #1095)
- `constant` supports dynamic arguments -- it will now always use its last argument as the callback. (#1016, #1052)
- `setImmediate` and `nextTick` now support arguments to partially apply to the deferred function, like the node-native versions do. (#940, #1053)
- Added `autoInject`, a relative of `auto` that automatically spreads a task's dependencies as arguments to the task function. (#608, #1055, #1099, #1100)
- You can now limit the concurrency of `auto` tasks. (#635, #637)
- Added `retryable`, a relative of `retry` that wraps an async function, making it retry when called. (#1058)
- Added `q.unsaturated` -- callback called when a `queue`'s number of running workers falls below a threshold. (#868, #1030, #1033, #1034)
- `applyEach` and `applyEachSeries` now pass results to the final callback. (#1088)

## Breaking changes

- Calling a callback more than once is considered an error, and an error will be thrown. This had an explicit breaking change in `waterfall`. If you were relying on this behavior, you should more accurately represent your control flow as an event emitter or stream. (#814, #815, #1048, #1050)
- `auto` task functions now always take the callback as the last argument. If a task has dependencies, the `results` object will be passed as the first argument. To migrate old task functions, wrap them with [`_.flip`](https://lodash.com/docs#flip) (#1036, #1042)
- Internal `setImmediate` calls have been refactored away. This may make existing flows vulnerable to stack overflows if you use many synchronous functions in series. Use `ensureAsync` to work around this. (#696, #704, #1049, #1050)
- `filter`, `reject`, `some`, `every`, and related functions now expect an error as the first callback argument, rather than just a simple boolean. Pass `null` as the first argument, or use `fs.access` instead of `fs.exists`. (#118, #774, #1028, #1041)
- `{METHOD}` and `{METHOD}Series` are now implemented in terms of `{METHOD}Limit`. This is a major internal simplification, and is not expected to cause many problems, but it does subtly affect how functions execute internally. (#778, #847)
- `retry`'s callback is now optional. Previously, omitting the callback would partially apply the function, meaning it could be passed directly as a task to `series` or `auto`. The partially applied "control-flow" behavior has been separated out into `retryable`. (#1054, #1058)
- The timing of the `q.saturated()` callback in a `queue` has been modified to better reflect when tasks pushed to the queue will start queueing. (#724, #1078)

## Other

- Added `someSeries` and `everySeries` for symmetry, as well as a complete set of `any`/`anyLimit`/`anySeries` and `all`/`/allLmit`/`allSeries` aliases.
- Added `find` as an alias for `detect. (as well as `findLimit` and `findSeries`).
- Various doc fixes (#1005, #1008, #1010, #1015, #1021, #1037, #1102)

------------------------------------------

# v1.5.2
- Allow using `"constructor"` as an argument in `memoize` (#998)
- Give a better error messsage when `auto` dependency checking fails (#994)
- Various doc updates (#936, #956, #979, #1002)

# v1.5.1
- Fix issue with `pause` in `queue` with concurrency enabled (#946)
- `while` and `until` now pass the final result to callback (#963)
- `auto` will properly handle concurrency when there is no callback (#966)
- `auto` will no. properly stop execution when an error occurs (#988, #993)
- Various doc fixes (#971, #980)

# v1.5.0

- Added `transform`, analogous to [`_.transform`](http://lodash.com/docs#transform) (#892)
- `map` now returns an object when an object is passed in, rather than array with non-numeric keys. `map` will begin always returning an array with numeric indexes in the next major release. (#873)
- `auto` now accepts an optional `concurrency` argument to limit the number o. running tasks (#637)
- Added `queue#workersList()`, to retrieve the lis. of currently running tasks. (#891)
- Various code simplifications (#896, #904)
- Various doc fixes :scroll: (#890, #894, #903, #905, #912)

# v1.4.2

- Ensure coverage files don't get published on npm (#879)

# v1.4.1

- Add in overlooked `detectLimit` method (#866)
- Removed unnecessary files from npm releases (#861)
- Removed usage of a reserved word to prevent :boom: in older environments (#870)

# v1.4.0

- `asyncify` now supports promises (#840)
- Added `Limit` versions of `filter` and `reject` (#836)
- Add `Limit` versions of `detect`, `some` and `every` (#828, #829)
- `some`, `every` and `detect` now short circuit early (#828, #829)
- Improve detection of the global object (#804), enabling use in WebWorkers
- `whilst` now called with arguments from iterator (#823)
- `during` now gets called with arguments from iterator (#824)
- Code simplifications and optimizations aplenty ([diff](https://github.com/caolan/async/compare/v1.3.0...v1.4.0))


# v1.3.0

New Features:
- Added `constant`
- Added `asyncify`/`wrapSync` for making sync functions work with callbacks. (#671, #806)
- Added `during` and `doDuring`, which are like `whilst` with an async truth test. (#800)
- `retry` now accepts an `interval` parameter to specify a delay between retries. (#793)
- `async` should work better in Web Workers due to better `root` detection (#804)
- Callbacks are now optional in `whilst`, `doWhilst`, `until`, and `doUntil` (#642)
- Various internal updates (#786, #801, #802, #803)
- Various doc fixes (#790, #794)

Bug Fixes:
- `cargo` now exposes the `payload` size, and `cargo.payload` can be changed on the fly after the `cargo` is created. (#740, #744, #783)


# v1.2.1

Bug Fix:

- Small regression with synchronous iterator behavior in `eachSeries` with a 1-element array. Before 1.1.0, `eachSeries`'s callback was called on the same tick, which this patch restores. In 2.0.0, it will be called on the next tick. (#782)


# v1.2.0

New Features:

- Added `timesLimit` (#743)
- `concurrency` can be changed after initialization in `queue` by setting `q.concurrency`. The new concurrency will be reflected the next time a task is processed. (#747, #772)

Bug Fixes:

- Fixed a regression in `each` and family with empty arrays that have additional properties. (#775, #777)


# v1.1.1

Bug Fix:

- Small regression with synchronous iterator behavior in `eachSeries` with a 1-element array. Before 1.1.0, `eachSeries`'s callback was called on the same tick, which this patch restores. In 2.0.0, it will be called on the next tick. (#782)


# v1.1.0

New Features:

- `cargo` now supports all of the same methods and event callbacks as `queue`.
- Added `ensureAsync` - A wrapper that ensures an async function calls its callback on a later tick. (#769)
- Optimized `map`, `eachOf`, and `waterfall` families of functions
- Passing a `null` or `undefined` array to `map`, `each`, `parallel` and families will be treated as an empty array (#667).
- The callback is now optional for the composed results of `compose` and `seq`. (#618)
- Reduced file size by 4kb, (minified version by 1kb)
- Added code coverage through `nyc` and `coveralls` (#768)

Bug Fixes:

- `forever` will no longer stack overflow with a synchronous iterator (#622)
- `eachLimit` and other limit functions will stop iterating once an error occurs (#754)
- Always pass `null` in callbacks when there is no error (#439)
- Ensure proper conditions when calling `drain()` after pushing an empty data set to a queue (#668)
- `each` and family will properly handle an empty array (#578)
- `eachSeries` and family will finish if the underlying array is modified during execution (#557)
- `queue` will throw if a non-function is passed to `q.push()` (#593)
- Doc fixes (#629, #766)


# v1.0.0

No known breaking changes, we are simply complying with semver from here on out.

Changes:

- Start using a changelog!
- Add `forEachOf` for iterating over Objects (or to iterate Arrays with indexes available) (#168 #704 #321)
- Detect deadlocks in `auto` (#663)
- Better support for require.js (#527)
- Throw if queue created with concurrency `0` (#714)
- Fix unneeded iteration in `queue.resume()` (#758)
- Guard against timer mocking overriding `setImmediate` (#609 #611)
- Miscellaneous doc fixes (#542 #596 #615 #628 #631 #690 #729)
- Use single noop function internally (#546)
- Optimize internal `_each`, `_map` and `_keys` functions.
