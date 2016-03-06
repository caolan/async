import aggregateBuild from './aggregate-build';

aggregateBuild({
    es6: true,
    outpath:'build/build-modules-es6',
    outfile: 'build/index.js',
    format: 'cjs',
    lodashRename: false
});
