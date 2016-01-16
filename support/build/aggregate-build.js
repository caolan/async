import compileModules from './compile-modules';
import rollup from 'rollup';
import rimraf from 'rimraf/rimraf';

export default function buildBundle(options) {
    function bundle() {
        rollup.rollup({
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
