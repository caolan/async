const async = require('async');
const {transformFile} = require('babel-core');
const _ = require('lodash');
const readdirR = require('recursive-readdir');
const pluginCJS = require('babel-plugin-transform-es2015-modules-commonjs');
const pluginModuleExports = require('babel-plugin-add-module-exports');
const pluginLodashImportRename = require('./plugin-lodash-import-rename');
const joinPath = require('path').join;
const fs = require('fs-extra');

module.exports = function(cb, options) {
    options = _.defaults({}, options, {
        path:'lib/',
        outpath:'build',
        es6: false,
        lodashRename: false
    });
    let plugins = [];

    if (options.lodashRename) {
        plugins.push(pluginLodashImportRename);
    }
    if (!options.es6) {
        plugins.push(pluginModuleExports);
        plugins.push(pluginCJS);
    }

    readdirR(options.path, [], function(err, files) {
        fs.emptyDirSync(options.outpath);
        fs.emptyDirSync(joinPath(options.outpath, 'internal'));
        async.each(files, (file, callback) => {
            let filename = file.startsWith(options.path) ?
                file.slice(options.path.length) :
                file;

            transformFile(file, {
                babelrc: false,
                plugins: plugins
            }, function(err, content) {
                let outpath = joinPath(options.outpath, filename);
                fs.writeFile(outpath, content.code, callback);
            });
        }, cb);
    });
}
