const {rollup} = require('rollup');
const nodeResolve = require('rollup-plugin-node-resolve');

rollup({
    entry: 'build-es/index.js',
    plugins: [ nodeResolve() ]
})
.then(function ( bundle ) {
    return bundle.write({
        format: 'umd',
        moduleName: 'async',
        dest: 'build/dist/async.js'
    });
})
.catch((err) => { throw err; });
