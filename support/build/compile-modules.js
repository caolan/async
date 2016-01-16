import async from '../../lib';
import {transformFile} from 'babel-core';
import _ from 'lodash';
import readdirR from 'recursive-readdir';
import pluginCJS from 'babel-plugin-transform-es2015-modules-commonjs';
import pluginModuleExports from 'babel-plugin-add-module-exports';
import pluginLodashImportRename from './plugin-lodash-import-rename';
import {join as joinPath} from 'path';
import fs from 'fs-extra';

export default function(cb, options) {
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
