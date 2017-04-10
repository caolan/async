const aggregateBuild = require('./aggregate-build');
const compileModules = require('./compile-modules');
const {series} = require('async');
const outpath = 'build/modules-for-umd';

series([
    compileModules.bind(null, {
        es6: true,
        outpath,
        lodashRename: true
    }),
    aggregateBuild.bind(null, {
        entriesPath: outpath,
        outfile: 'build/dist/async.js',
        format: 'umd',
    })
], err => { if (err) throw err; })
