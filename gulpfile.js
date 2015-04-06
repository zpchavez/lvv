'use strict';

var browserify  = require('browserify');
var connect     = require('gulp-connect');
var del         = require('del');
var glob        = require('glob');
var gulp        = require('gulp');
var gulpif      = require('gulp-if');
var gutil       = require('gulp-util');
var jshint      = require('gulp-jshint');
var minifycss   = require('gulp-minify-css');
var minifyhtml  = require('gulp-minify-html');
var processhtml = require('gulp-processhtml');
var proxyquire  = require('proxyquireify');
var reactify    = require('reactify');
var rename      = require('gulp-rename');
var rimraf      = require('gulp-rimraf');
var source      = require('vinyl-source-stream');
var streamify   = require('gulp-streamify');
var uglify      = require('gulp-uglify');
var watchify    = require('watchify');

var paths;
var watching = false;

require('./gulp-tasks/connect');
require('./gulp-tasks/preprocess');

paths = {
    assets: [
        './application/assets/**/*.*',
        '!./application/assets/psds/**',
        '!./application/assets/svgs/**',
        '!./application/assets/reference-images/**'
    ],
    css:    'application/css/*.css',
    libs:   [
        './node_modules/phaser/build/phaser.js',
        './node_modules/phaser-debug/dist/phaser-debug.js'
    ],
    js: [
        'application/src/*.js',
        'application/src/**/*.js',
        'application/src/components/**/*.jsx'
    ],
    entry: './application/src/main.js',
    dist: './build/',
    testBuild : './test'
};

gulp.task('clean', function () {
    return gulp.src(paths.dist, {read: false})
        .pipe(rimraf({ force: true }))
        .on('error', gutil.log);
});

gulp.task('copy', ['clean'], function () {
    gulp.src(paths.assets)
        .pipe(gulp.dest(paths.dist + 'assets'))
        .on('error', gutil.log);
});

gulp.task('copylibs', ['clean'], function () {
    gulp.src(paths.libs)
        .pipe(gulpif(!watching, uglify({outSourceMaps: false})))
        .pipe(gulp.dest(paths.dist + 'js/lib'))
        .on('error', gutil.log);
});

gulp.task('compile', ['clean'], function () {
    var bundler = browserify({
        cache      : {}, packageCache: {}, fullPaths: true,
        entries    : [paths.entry],
        extensions : ['.js', '.jsx'],
        debug      : watching
    })
    .transform(reactify);

    var bundlee = function() {
        return bundler
            .bundle()
            .pipe(source('main.min.js'))
            .pipe(jshint('.jshintrc'))
            .pipe(jshint.reporter('default'))
            .pipe(gulpif(!watching, streamify(uglify({outSourceMaps: false}))))
            .pipe(gulp.dest(paths.dist))
            .on('error', gutil.log);
    };

    if (watching) {
        bundler = watchify(bundler);
        bundler.on('update', bundlee);
    }

    return bundlee();
});

gulp.task('compile:test', ['clean'], function () {
    var path = gutil.env.path || './__tests__/**/*.js*';
    var entries = glob.sync(path);

    var bundler = browserify({
        cache        : {},
        packageCache : {},
        fullPaths    : true,
        entries      : entries,
        extensions   : ['.js'],
        debug        : watching
    })
    .plugin(proxyquire.plugin)
    .transform(reactify);

    var bundlee = function() {
        return bundler
            .bundle()
            .pipe(source('tests.js'))
            .pipe(jshint('.jshintrc'))
            .pipe(jshint.reporter('default'))
            .pipe(gulpif(!watching, streamify(uglify({outSourceMaps: false}))))
            .pipe(gulp.dest(paths.testBuild))
            .on('error', gutil.log);
    };

    if (watching) {
        bundler = watchify(bundler);
        bundler.on('update', bundlee);
    }

    return bundlee();
});

gulp.task('minifycss', ['clean'], function () {
    gulp.src(paths.css)
        .pipe(gulpif(!watching, minifycss({
            keepSpecialComments: false,
            removeEmpty: true
        })))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.dist))
        .on('error', gutil.log);
});

gulp.task('processhtml', ['clean'], function() {
    return gulp.src('application/index.html')
        .pipe(processhtml('index.html'))
        .pipe(gulp.dest(paths.dist))
        .on('error', gutil.log);
});

gulp.task('minifyhtml', ['processhtml'], function() {
    gulp.src('dist/index.html')
        .pipe(gulpif(!watching, minifyhtml()))
        .pipe(gulp.dest(paths.dist))
        .on('error', gutil.log);
});

gulp.task('html', ['build'], function(){
    gulp.src('dist/*.html')
        .pipe(connect.reload())
        .on('error', gutil.log);
});

gulp.task('watch', function () {
    watching = true;
    return gulp.watch(['./application/index.html', paths.css, paths.js, paths.assets], ['build', 'html']);
});

gulp.task('delta:test', function() {
    gulp.watch(['./tests/**/*.html'], ['preprocess:test']);
});

gulp.task('clean:test', function(cb) {
    del(['./test'], cb);
});

gulp.task('default', ['connect', 'watch', 'build']);
gulp.task('build', ['clean', 'copy', 'copylibs', 'compile', 'minifycss', 'processhtml', 'minifyhtml']);
gulp.task('test', ['preprocess:test', 'compile:test', 'connect:test', 'delta:test', 'watch']);
