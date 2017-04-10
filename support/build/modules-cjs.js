const compileModules = require('./compile-modules');

compileModules({
    es6: false
}, err => { if (err) throw err; });
