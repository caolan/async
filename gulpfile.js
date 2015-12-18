'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var header = require('gulp-header');
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buildModules = require('./support/modules/build');

var src = {
  main: './index.js'
};

var module = {
  filename: pkg.name + ".js",
  shortcut: "" + pkg.name,
  dist: 'dist'
};

var banner = [
  "/**",
  " * <%= pkg.name %> - <%= pkg.description %>",
  " * @version v<%= pkg.version %>",
  " * @link    <%= pkg.homepage %>",
  " * @license <%= pkg.license %>", " */"
  ].join("\n");

gulp.task('modules', function() {
    buildModules()
})

// gulp.task('browserify', function() {
//   browserify({
//     extensions: ['.coffee', '.js']
//   })
//   .require(src.main, {
//     expose: module.shortcut
//   })
//   .ignore('coffee-script')
//   .bundle()
//   .on('error', gutil.log)
//   .pipe(source(module.filename))
//   .pipe(buffer())
//   .pipe(uglify())
//   .pipe(header(banner, {
//     pkg: pkg
//   }))
//   .pipe(gulp.dest(module.dist));
// });

// gulp.task('default', function() {
//   gulp.start('browserify');
// });
