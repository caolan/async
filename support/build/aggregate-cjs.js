const aggregateBuild = require('./aggregate-build');
const compileModules = require('./compile-modules');
const {series} = require('async');
const outpath = 'build/modules-for-cjs';

series([
    compileModules.bind(null, {
        es6: true,
        outpath,
        lodashRename: false
    }),
    aggregateBuild.bind(null, {
        entriesPath: outpath,
        outfile: 'build/index.js',
        format: 'cjs',
    })
], err => { if (err); throw err; });
