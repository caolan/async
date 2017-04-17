#!/usr/bin/env node

const yargs = require('yargs');
const fs = require('fs');
const {transformFile} = require('babel-core');
const pluginCJS = require('babel-plugin-transform-es2015-modules-commonjs');
const pluginModuleExports = require('babel-plugin-add-module-exports');

compileModule(yargs.argv, (err) => {
    if (err) throw err;
})

function compileModule(options, callback) {
    const {file, output} = options;
    const plugins = [
        pluginModuleExports,
        pluginCJS
    ];

    transformFile(file, {
        babelrc: false,
        ast: false,
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
