import compileModules from './compile-modules';
import rollup from 'rollup';

function buildBundle() {
    rollup.rollup({
      entry: 'build/modules-es6/index.js'
    }).then(function ( bundle ) {
        bundle.write({
            format: 'cjs',
            dest: 'build/async-bundle.js'
        });
    });
}

compileModules(buildBundle, {es6: true, outpath:'build/modules-es6'});
