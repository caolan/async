'use strict';

var buffer = require('vinyl-buffer')
var source = require('vinyl-source-stream')
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var pkg = require('./package.json');
var rename = require('gulp-rename');
var header = require('gulp-header');
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var browserify = require('browserify');
var bundleModule = require('./support/bundle-modules');

function bannerModule(module) {
    return [
        "/**",
        " * <%= pkg.name %>." + module + " – " + bundleModule.descriptions[module],
        " * @version v<%= pkg.version %>",
        " * @link    <%= pkg.homepage %>",
        " * @license <%= pkg.license %>", " */"
    ].join("\n");
}

var modulesPath = 'lib/';

gulp.task('modules', function() {
    return bundleModule.modules.map(function(module) {
        bundleModule.buildPackage(module);

        var requirePath = path.resolve(modulesPath, module, 'index.js');
        var requireName = pkg.name + '.' + module;
        var browserBuilPath = bundleModule.rootPath(module, 'dist');
        var filename = requireName + '.js';

        return browserify({
                extensions: ['.js']
            })
            .require(requirePath, {
                expose: requireName
            })
            .bundle()
            .pipe(source(filename))
            .pipe(buffer())
            .pipe(header(bannerModule(module), {pkg: pkg}))
            .pipe(gulp.dest(browserBuilPath))
            .pipe(uglify())
            .pipe(rename(requireName + '.min.js'))
            .pipe(header(bannerModule(module), {pkg: pkg}))
            .pipe(gulp.dest(browserBuilPath));
    });
});
