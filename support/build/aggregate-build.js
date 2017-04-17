const {rollup} = require('rollup');
const nodeResolve = require('rollup-plugin-node-resolve');

module.exports = function buildBundle(options, cb) {
    const {format, entriesPath, outfile} = options;
    return rollup({
        entry: entriesPath + '/index.js',
        plugins: [ nodeResolve() ]
    })
    .then(function ( bundle ) {
        return bundle.write({
            format,
            moduleName: 'async',
            dest: outfile
        });
    })
    .then(() => cb())
    .catch(cb);
}
