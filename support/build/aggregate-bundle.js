const aggregateBuild = require('./aggregate-build');

aggregateBuild({
    entriesPath: 'build-es',
    outfile: 'build/dist/async.js',
    format: 'umd',
}, err => { if (err) throw err; })
