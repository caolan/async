const compileModules = require('./compile-modules');

compileModules({
    es6: false,
    path: 'lib/',
    outpath: 'build'
}, err => { if (err) throw err; });
