const compileModules = require('./compile-modules');
const {rollup} = require('rollup');
const rimraf = require('rimraf/rimraf');

module.exports = function buildBundle(options) {
    function bundle() {
        rollup({
            entry: options.outpath + '/index.js'
        }).then(function ( bundle ) {
            bundle.write({
                format: options.format,
                moduleName: 'async',
                dest: options.outfile
            });
            rimraf.sync(options.outpath);
        }).catch(console.error);
    }

    compileModules(bundle, options);
}
