import aggregateBuild from './aggregate-build';

aggregateBuild({
    es6: true,
    outpath:'build/build-modules-es6',
    outfile: 'build/dist/async.js',
    format: 'umd',
    lodashRename: true
});
