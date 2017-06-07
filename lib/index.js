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

import applyEach from './applyEach';
import applyEachSeries from './applyEachSeries';
import apply from './apply';
import asyncify from './asyncify';
import auto from './auto';
import autoInject from './autoInject';
import cargo from './cargo';
import compose from './compose';
import concat from './concat';
import concatLimit from './concatLimit';
import concatSeries from './concatSeries';
import constant from './constant';
import detect from './detect';
import detectLimit from './detectLimit';
import detectSeries from './detectSeries';
import dir from './dir';
import doDuring from './doDuring';
import doUntil from './doUntil';
import doWhilst from './doWhilst';
import during from './during';
import each from './each';
import eachLimit from './eachLimit';
import eachOf from './eachOf';
import eachOfLimit from './eachOfLimit';
import eachOfSeries from './eachOfSeries';
import eachSeries from './eachSeries';
import ensureAsync from './ensureAsync';
import every from './every';
import everyLimit from './everyLimit';
import everySeries from './everySeries';
import filter from './filter';
import filterLimit from './filterLimit';
import filterSeries from './filterSeries';
import forever from './forever';
import groupBy from './groupBy';
import groupByLimit from './groupByLimit';
import groupBySeries from './groupBySeries';
import log from './log';
import map from './map';
import mapLimit from './mapLimit';
import mapSeries from './mapSeries';
import mapValues from './mapValues';
import mapValuesLimit from './mapValuesLimit';
import mapValuesSeries from './mapValuesSeries';
import memoize from './memoize';
import nextTick from './nextTick';
import parallel from './parallel';
import parallelLimit from './parallelLimit';
import priorityQueue from './priorityQueue';
import queue from './queue';
import race from './race';
import reduce from './reduce';
import reduceRight from './reduceRight';
import reflect from './reflect';
import reject from './reject';
import reflectAll from './reflectAll';
import rejectLimit from './rejectLimit';
import rejectSeries from './rejectSeries';
import retry from './retry';
import retryable from './retryable';
import seq from './seq';
import series from './series';
import setImmediate from './setImmediate';
import some from './some';
import someLimit from './someLimit';
import someSeries from './someSeries';
import sortBy from './sortBy';
import timeout from './timeout';
import times from './times';
import timesLimit from './timesLimit';
import timesSeries from './timesSeries';
import transform from './transform';
import tryEach from './tryEach';
import unmemoize from './unmemoize';
import until from './until';
import waterfall from './waterfall';
import whilst from './whilst';

export default {
    applyEach: applyEach,
    applyEachSeries: applyEachSeries,
    apply: apply,
    asyncify: asyncify,
    auto: auto,
    autoInject: autoInject,
    cargo: cargo,
    compose: compose,
    concat: concat,
    concatLimit: concatLimit,
    concatSeries: concatSeries,
    constant: constant,
    detect: detect,
    detectLimit: detectLimit,
    detectSeries: detectSeries,
    dir: dir,
    doDuring: doDuring,
    doUntil: doUntil,
    doWhilst: doWhilst,
    during: during,
    each: each,
    eachLimit: eachLimit,
    eachOf: eachOf,
    eachOfLimit: eachOfLimit,
    eachOfSeries: eachOfSeries,
    eachSeries: eachSeries,
    ensureAsync: ensureAsync,
    every: every,
    everyLimit: everyLimit,
    everySeries: everySeries,
    filter: filter,
    filterLimit: filterLimit,
    filterSeries: filterSeries,
    forever: forever,
    groupBy: groupBy,
    groupByLimit: groupByLimit,
    groupBySeries: groupBySeries,
    log: log,
    map: map,
    mapLimit: mapLimit,
    mapSeries: mapSeries,
    mapValues: mapValues,
    mapValuesLimit: mapValuesLimit,
    mapValuesSeries: mapValuesSeries,
    memoize: memoize,
    nextTick: nextTick,
    parallel: parallel,
    parallelLimit: parallelLimit,
    priorityQueue: priorityQueue,
    queue: queue,
    race: race,
    reduce: reduce,
    reduceRight: reduceRight,
    reflect: reflect,
    reflectAll: reflectAll,
    reject: reject,
    rejectLimit: rejectLimit,
    rejectSeries: rejectSeries,
    retry: retry,
    retryable: retryable,
    seq: seq,
    series: series,
    setImmediate: setImmediate,
    some: some,
    someLimit: someLimit,
    someSeries: someSeries,
    sortBy: sortBy,
    timeout: timeout,
    times: times,
    timesLimit: timesLimit,
    timesSeries: timesSeries,
    transform: transform,
    tryEach: tryEach,
    unmemoize: unmemoize,
    until: until,
    waterfall: waterfall,
    whilst: whilst,

    // aliases
    all: every,
    any: some,
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
    wrapSync: asyncify
};

export {
    applyEach as applyEach,
    applyEachSeries as applyEachSeries,
    apply as apply,
    asyncify as asyncify,
    auto as auto,
    autoInject as autoInject,
    cargo as cargo,
    compose as compose,
    concat as concat,
    concatLimit as concatLimit,
    concatSeries as concatSeries,
    constant as constant,
    detect as detect,
    detectLimit as detectLimit,
    detectSeries as detectSeries,
    dir as dir,
    doDuring as doDuring,
    doUntil as doUntil,
    doWhilst as doWhilst,
    during as during,
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
    asyncify as wrapSync
};
