'use strict';

var gulp    = require('gulp');
var connect = require('gulp-connect');

gulp.task('preprocess:test', function() {
    return gulp.src([
            './__tests__/index.html',
            './__tests__/favicon.png',
            './node_modules/mocha/mocha.css',
            './node_modules/mocha/mocha.js'
        ])
        .pipe(gulp.dest('./test'))
        .pipe(connect.reload());
});