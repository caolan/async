const async = require('async');
const {transformFile} = require('babel-core');
const _ = require('lodash');
const readdirR = require('recursive-readdir');
const pluginCJS = require('babel-plugin-transform-es2015-modules-commonjs');
const pluginModuleExports = require('babel-plugin-add-module-exports');
const pluginLodashImportRename = require('./plugin-lodash-import-rename');
const joinPath = require('path').join;
const fs = require('fs-extra');

module.exports = function(options, cb) {
    options = _.defaults({}, options, {
        path: 'lib/',
        outpath: 'build',
        es6: false,
        lodashRename: false
    });
    const plugins = [];
    const { path, outpath } = options;

    if (options.lodashRename) {
        plugins.push(pluginLodashImportRename);
    }
    if (!options.es6) {
        plugins.push(pluginModuleExports);
        plugins.push(pluginCJS);
    }

    readdirR(path, [], (err, files) => {
        fs.emptyDirSync(outpath);
        fs.emptyDirSync(joinPath(outpath, 'internal'));
        async.each(files, (file, callback) => {

            transformFile(file, {
                babelrc: false,
                plugins: plugins
            }, (err, content) => {
                if (err) { return callback(err); }
                const outfile = file.startsWith(path) ?
                    file.slice(path.length) :
                    file;
                const finalPath = joinPath(outpath, outfile);
                fs.writeFile(finalPath, content.code, callback);
            });
        }, cb);
    });
}
