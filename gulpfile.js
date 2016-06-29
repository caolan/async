var gulp = require('gulp');

var cleanCSS = require('gulp-clean-css');
var concatCSS = require('gulp-concat-css');
var rename = require('gulp-rename');
var streamify = require('gulp-streamify');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');

gulp.task('css', function() {
    return gulp.src([
        'node_modules/bootstrap/dist/css/bootstrap.css',
        'support/jsdoc/jsdoc-custom.css'
    ])
        .pipe(sourcemaps.init())
            .pipe(concatCSS('jsdoc-custom.css'))
            .pipe(cleanCSS({compatibility: 'ie8'}))
            .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('docs/styles'));
});

gulp.task('js', function() {
    // http://stackoverflow.com/questions/24992980/how-to-uglify-output-with-browserify-in-gulp
    return browserify('support/jsdoc/jsdoc-custom.js')
        .bundle()
        .pipe(source('jsdoc-custom.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('docs/scripts'));
});

gulp.task('jsdoc', [ 'css', 'js' ]);
