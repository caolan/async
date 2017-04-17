const fs = require('fs');
const {transformFile} = require('babel-core');
const pluginCJS = require('babel-plugin-transform-es2015-modules-commonjs');
const pluginModuleExports = require('babel-plugin-add-module-exports');

module.exports = function compileModule(options, callback) {
    const {file, output} = options;
    const plugins = [
        pluginModuleExports,
        pluginCJS
    ];

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
