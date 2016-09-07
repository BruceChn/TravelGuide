var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('js',function(){
    gulp.src(['js/app.module.js','js/**/*.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('.'))
});
gulp.task('watch',['js'],function(){
    gulp.watch('js/**/*.js',['js']);
});

gulp.task('default',['js','watch']);
