/**
 * An "async function" in the context of Async is an asynchronous function with
 * a variable number of parameters, with the final parameter being a callback.
 * (`function (arg1, arg2, ..., callback) {}`)
 * The final callback is of the form `callback(err, results...)`, which must be
 * called once the function is completed.  The callback should be called with a
 * Error as its first argument to signal that an error occurred.
 * Otherwise, if no error occurred, it should be called with `null` as the first
 * argument, and any additional `result` arguments that may apply, to signal
 * successful completion.
 * The callback must be called exactly once, ideally on a later tick of the
 * JavaScript event loop.
 *
 * This type of function is also referred to as a "Node-style async function",
 * or a "continuation passing-style function" (CPS). Most of the methods of this
 * library are themselves CPS/Node-style async functions, or functions that
 * return CPS/Node-style async functions.
 *
 * Wherever we accept a Node-style async function, we also directly accept an
 * [ES2017 `async` function]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function}.
 * In this case, the `async` function will not be passed a final callback
 * argument, and any thrown error will be used as the `err` argument of the
 * implicit callback, and the return value will be used as the `result` value.
 * (i.e. a `rejected` of the returned Promise becomes the `err` callback
 * argument, and a `resolved` value becomes the `result`.)
 *
 * Note, due to JavaScript limitations, we can only detect native `async`
 * functions and not transpilied implementations.
 * Your environment must have `async`/`await` support for this to work.
 * (e.g. Node > v7.6, or a recent version of a modern browser).
 * If you are using `async` functions through a transpiler (e.g. Babel), you
 * must still wrap the function with [asyncify]{@link module:Utils.asyncify},
 * because the `async function` will be compiled to an ordinary function that
 * returns a promise.
 *
 * @typedef {Function} AsyncFunction
 * @static
 */

/**
 * Async is a utility module which provides straight-forward, powerful functions
 * for working with asynchronous JavaScript. Although originally designed for
 * use with [Node.js](http://nodejs.org) and installable via
 * `npm install --save async`, it can also be used directly in the browser.
 * @module async
 * @see AsyncFunction
 */


/**
 * A collection of `async` functions for manipulating collections, such as
 * arrays and objects.
 * @module Collections
 */

/**
 * A collection of `async` functions for controlling the flow through a script.
 * @module ControlFlow
 */

/**
 * A collection of `async` utility functions.
 * @module Utils
 */

import apply from './apply.js'
import applyEach from './applyEach.js'
import applyEachSeries from './applyEachSeries.js'
import asyncify from './asyncify.js'
import auto from './auto.js'
import autoInject from './autoInject.js'
import cargo from './cargo.js'
import cargoQueue from './cargoQueue.js'
import compose from './compose.js'
import concat from './concat.js'
import concatLimit from './concatLimit.js'
import concatSeries from './concatSeries.js'
import constant from './constant.js'
import detect from './detect.js'
import detectLimit from './detectLimit.js'
import detectSeries from './detectSeries.js'
import dir from './dir.js'
import doUntil from './doUntil.js'
import doWhilst from './doWhilst.js'
import each from './each.js'
import eachLimit from './eachLimit.js'
import eachOf from './eachOf.js'
import eachOfLimit from './eachOfLimit.js'
import eachOfSeries from './eachOfSeries.js'
import eachSeries from './eachSeries.js'
import ensureAsync from './ensureAsync.js'
import every from './every.js'
import everyLimit from './everyLimit.js'
import everySeries from './everySeries.js'
import filter from './filter.js'
import filterLimit from './filterLimit.js'
import filterSeries from './filterSeries.js'
import forever from './forever.js'
import groupBy from './groupBy.js'
import groupByLimit from './groupByLimit.js'
import groupBySeries from './groupBySeries.js'
import log from './log.js'
import map from './map.js'
import mapLimit from './mapLimit.js'
import mapSeries from './mapSeries.js'
import mapValues from './mapValues.js'
import mapValuesLimit from './mapValuesLimit.js'
import mapValuesSeries from './mapValuesSeries.js'
import memoize from './memoize.js'
import nextTick from './nextTick.js'
import parallel from './parallel.js'
import parallelLimit from './parallelLimit.js'
import priorityQueue from './priorityQueue.js'
import queue from './queue.js'
import race from './race.js'
import reduce from './reduce.js'
import reduceRight from './reduceRight.js'
import reflect from './reflect.js'
import reflectAll from './reflectAll.js'
import reject from './reject.js'
import rejectLimit from './rejectLimit.js'
import rejectSeries from './rejectSeries.js'
import retry from './retry.js'
import retryable from './retryable.js'
import seq from './seq.js'
import series from './series.js'
import setImmediate from './setImmediate.js'
import some from './some.js'
import someLimit from './someLimit.js'
import someSeries from './someSeries.js'
import sortBy from './sortBy.js'
import timeout from './timeout.js'
import times from './times.js'
import timesLimit from './timesLimit.js'
import timesSeries from './timesSeries.js'
import transform from './transform.js'
import tryEach from './tryEach.js'
import unmemoize from './unmemoize.js'
import until from './until.js'
import waterfall from './waterfall.js'
import whilst from './whilst.js'

export default {
    apply,
    applyEach,
    applyEachSeries,
    asyncify,
    auto,
    autoInject,
    cargo,
    cargoQueue,
    compose,
    concat,
    concatLimit,
    concatSeries,
    constant,
    detect,
    detectLimit,
    detectSeries,
    dir,
    doUntil,
    doWhilst,
    each,
    eachLimit,
    eachOf,
    eachOfLimit,
    eachOfSeries,
    eachSeries,
    ensureAsync,
    every,
    everyLimit,
    everySeries,
    filter,
    filterLimit,
    filterSeries,
    forever,
    groupBy,
    groupByLimit,
    groupBySeries,
    log,
    map,
    mapLimit,
    mapSeries,
    mapValues,
    mapValuesLimit,
    mapValuesSeries,
    memoize,
    nextTick,
    parallel,
    parallelLimit,
    priorityQueue,
    queue,
    race,
    reduce,
    reduceRight,
    reflect,
    reflectAll,
    reject,
    rejectLimit,
    rejectSeries,
    retry,
    retryable,
    seq,
    series,
    setImmediate,
    some,
    someLimit,
    someSeries,
    sortBy,
    timeout,
    times,
    timesLimit,
    timesSeries,
    transform,
    tryEach,
    unmemoize,
    until,
    waterfall,
    whilst,

    // aliases
    all: every,
    allLimit: everyLimit,
    allSeries: everySeries,
    any: some,
    anyLimit: someLimit,
    anySeries: someSeries,
    find: detect,
    findLimit: detectLimit,
    findSeries: detectSeries,
    flatMap: concat,
    flatMapLimit: concatLimit,
    flatMapSeries: concatSeries,
    forEach: each,
    forEachSeries: eachSeries,
    forEachLimit: eachLimit,
    forEachOf: eachOf,
    forEachOfSeries: eachOfSeries,
    forEachOfLimit: eachOfLimit,
    inject: reduce,
    foldl: reduce,
    foldr: reduceRight,
    select: filter,
    selectLimit: filterLimit,
    selectSeries: filterSeries,
    wrapSync: asyncify,
    during: whilst,
    doDuring: doWhilst
};

export {
    apply as apply,
    applyEach as applyEach,
    applyEachSeries as applyEachSeries,
    asyncify as asyncify,
    auto as auto,
    autoInject as autoInject,
    cargo as cargo,
    cargoQueue as cargoQueue,
    compose as compose,
    concat as concat,
    concatLimit as concatLimit,
    concatSeries as concatSeries,
    constant as constant,
    detect as detect,
    detectLimit as detectLimit,
    detectSeries as detectSeries,
    dir as dir,
    doUntil as doUntil,
    doWhilst as doWhilst,
    each as each,
    eachLimit as eachLimit,
    eachOf as eachOf,
    eachOfLimit as eachOfLimit,
    eachOfSeries as eachOfSeries,
    eachSeries as eachSeries,
    ensureAsync as ensureAsync,
    every as every,
    everyLimit as everyLimit,
    everySeries as everySeries,
    filter as filter,
    filterLimit as filterLimit,
    filterSeries as filterSeries,
    forever as forever,
    groupBy as groupBy,
    groupByLimit as groupByLimit,
    groupBySeries as groupBySeries,
    log as log,
    map as map,
    mapLimit as mapLimit,
    mapSeries as mapSeries,
    mapValues as mapValues,
    mapValuesLimit as mapValuesLimit,
    mapValuesSeries as mapValuesSeries,
    memoize as memoize,
    nextTick as nextTick,
    parallel as parallel,
    parallelLimit as parallelLimit,
    priorityQueue as priorityQueue,
    queue as queue,
    race as race,
    reduce as reduce,
    reduceRight as reduceRight,
    reflect as reflect,
    reflectAll as reflectAll,
    reject as reject,
    rejectLimit as rejectLimit,
    rejectSeries as rejectSeries,
    retry as retry,
    retryable as retryable,
    seq as seq,
    series as series,
    setImmediate as setImmediate,
    some as some,
    someLimit as someLimit,
    someSeries as someSeries,
    sortBy as sortBy,
    timeout as timeout,
    times as times,
    timesLimit as timesLimit,
    timesSeries as timesSeries,
    transform as transform,
    tryEach as tryEach,
    unmemoize as unmemoize,
    until as until,
    waterfall as waterfall,
    whilst as whilst,

    // Aliases
    every as all,
    everyLimit as allLimit,
    everySeries as allSeries,
    some as any,
    someLimit as anyLimit,
    someSeries as anySeries,
    detect as find,
    detectLimit as findLimit,
    detectSeries as findSeries,
    concat as flatMap,
    concatLimit as flatMapLimit,
    concatSeries as flatMapSeries,
    each as forEach,
    eachSeries as forEachSeries,
    eachLimit as forEachLimit,
    eachOf as forEachOf,
    eachOfSeries as forEachOfSeries,
    eachOfLimit as forEachOfLimit,
    reduce as inject,
    reduce as foldl,
    reduceRight as foldr,
    filter as select,
    filterLimit as selectLimit,
    filterSeries as selectSeries,
    asyncify as wrapSync,
    whilst as during,
    doWhilst as doDuring
};
