const async = require('async');
const _ = require('lodash');
const readdirR = require('recursive-readdir');
const joinPath = require('path').join;
const fs = require('fs-extra');
const compileModule = require('./compile-module');

module.exports = function(options, cb) {
    options = _.defaults({}, options, {
        path: 'lib/',
        outpath: 'build',
        es6: false,
        lodashRename: false
    });
    const { path, outpath } = options;

    readdirR(path, [], (err, files) => {
        fs.emptyDirSync(outpath);
        fs.emptyDirSync(joinPath(outpath, 'internal'));
        async.each(files, (file, callback) => {
            const outfile = file.startsWith(path) ?
                file.slice(path.length) :
                file;
            const finalPath = joinPath(outpath, outfile);

            compileModule({
                file,
                output: finalPath,
                lodashRename: options.lodashRename,
                es6: options.es6
            }, callback)

        }, cb);
    });
}
