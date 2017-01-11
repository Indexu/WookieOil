var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass', function () {
    gulp.src('resources/sass/*.scss')
        .pipe(sass())
        .pipe(gulp.dest(function (f) {
            return "resources/css/";
        }));

    gulp.src('vendors/materialize/sass/materialize.scss')
        .pipe(sass())
        .pipe(gulp.dest(function (f) {
            return "vendors/materialize/css/";
        }))
});

gulp.task('default', ['sass'], function () {
    gulp.watch('resources/sass/*.scss', ['sass']);
})