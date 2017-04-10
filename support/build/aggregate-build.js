const {rollup} = require('rollup');

module.exports = function buildBundle(options, cb) {
    const {format, entriesPath, outfile} = options;
    return rollup({
        entry: entriesPath + '/index.js'
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
