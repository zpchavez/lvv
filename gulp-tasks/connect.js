'use strict';

var gulp    = require('gulp');
var connect = require('gulp-connect');

gulp.task('connect', function () {
    return connect.server({
        root       : ['./build'],
        port       : 9000,
        livereload : true
    });
});

gulp.task('connect:examples', function() {
    return connect.server({
        root       : 'examples/examples',
        port       : 8000,
        livereload : false
    });
});

gulp.task('connect:test', function() {
    return connect.server({
        root       : 'test',
        port       : 9001,
        livereload : true
    });
});