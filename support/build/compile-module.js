const fs = require('fs');
const {transformFile} = require('babel-core');
const _ = require('lodash');
const pluginCJS = require('babel-plugin-transform-es2015-modules-commonjs');
const pluginModuleExports = require('babel-plugin-add-module-exports');
const pluginLodashImportRename = require('./plugin-lodash-import-rename');

module.exports = function compileModule(opts, callback) {
    const options = _.defaults({}, opts, {
        es6: false,
        lodashRename: false
    });
    const plugins = [];

    if (options.lodashRename) {
        plugins.push(pluginLodashImportRename);
    }
    if (!options.es6) {
        plugins.push(pluginModuleExports);
        plugins.push(pluginCJS);
    }

    const {file, output} = options;

    transformFile(file, {
        babelrc: false,
        plugins
    }, (err, content) => {
        if (err) return callback(err);
        if (!output) {
            process.stdout.write(content.code);
            return callback();
        }
        fs.writeFile(output, content.code, callback)
    })
}
