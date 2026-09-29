#!/usr/bin/env node

const yargs = require('yargs');
const {hideBin} = require('yargs/helpers');
const fs = require('fs');
const {transformFile} = require('@babel/core');
const pluginCJS = require('@babel/plugin-transform-modules-commonjs');
const pluginModuleExports = require('babel-plugin-add-module-exports');

compileModule(yargs(hideBin(process.argv)).argv, (err) => {
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
        configFile: false,
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
