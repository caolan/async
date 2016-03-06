'use strict';

import applyEach from './applyEach';
import applyEachSeries from './applyEachSeries';
import apply from './apply';
import asyncify from './asyncify';
import auto from './auto';
import cargo from './cargo';
import compose from './compose';
import concat from './concat';
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
import filter from './filter';
import filterLimit from './filterLimit';
import filterSeries from './filterSeries';
import forever from './forever';
import iterator from './iterator';
import log from './log';
import map from './map';
import mapLimit from './mapLimit';
import mapSeries from './mapSeries';
import memoize from './memoize';
import nextTick from './nextTick';
import parallel from './parallel';
import parallelLimit from './parallelLimit';
import priorityQueue from './priorityQueue';
import queue from './queue';
import race from './race';
import reduce from './reduce';
import reduceRight from './reduceRight';
import reject from './reject';
import rejectLimit from './rejectLimit';
import rejectSeries from './rejectSeries';
import retry from './retry';
import seq from './seq';
import series from './series';
import setImmediate from './setImmediate';
import some from './some';
import someLimit from './someLimit';
import sortBy from './sortBy';
import times from './times';
import timesLimit from './timesLimit';
import timesSeries from './timesSeries';
import transform from './transform';
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
    cargo: cargo,
    compose: compose,
    concat: concat,
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
    filter: filter,
    filterLimit: filterLimit,
    filterSeries: filterSeries,
    forever: forever,
    iterator: iterator,
    log: log,
    map: map,
    mapLimit: mapLimit,
    mapSeries: mapSeries,
    memoize: memoize,
    nextTick: nextTick,
    parallel: parallel,
    parallelLimit: parallelLimit,
    priorityQueue: priorityQueue,
    queue: queue,
    race: race,
    reduce: reduce,
    reduceRight: reduceRight,
    reject: reject,
    rejectLimit: rejectLimit,
    rejectSeries: rejectSeries,
    retry: retry,
    seq: seq,
    series: series,
    setImmediate: setImmediate,
    some: some,
    someLimit: someLimit,
    sortBy: sortBy,
    times: times,
    timesLimit: timesLimit,
    timesSeries: timesSeries,
    transform: transform,
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
    cargo as cargo,
    compose as compose,
    concat as concat,
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
    filter as filter,
    filterLimit as filterLimit,
    filterSeries as filterSeries,
    forever as forever,
    iterator as iterator,
    log as log,
    map as map,
    mapLimit as mapLimit,
    mapSeries as mapSeries,
    memoize as memoize,
    nextTick as nextTick,
    parallel as parallel,
    parallelLimit as parallelLimit,
    priorityQueue as priorityQueue,
    queue as queue,
    race as race,
    reduce as reduce,
    reduceRight as reduceRight,
    reject as reject,
    rejectLimit as rejectLimit,
    rejectSeries as rejectSeries,
    retry as retry,
    seq as seq,
    series as series,
    setImmediate as setImmediate,
    some as some,
    someLimit as someLimit,
    sortBy as sortBy,
    times as times,
    timesLimit as timesLimit,
    timesSeries as timesSeries,
    transform as transform,
    unmemoize as unmemoize,
    until as until,
    waterfall as waterfall,
    whilst as whilst,

    // Aliases
    every as all,
    some as any,
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
