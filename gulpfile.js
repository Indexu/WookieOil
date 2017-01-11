// Dependencies
var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();

// Sass
gulp.task('sass', function () {
    return gulp.src('app/resources/sass/*.scss')
        .pipe(sass())
        .pipe(gulp.dest("app/resources/css/"))
        .pipe(browserSync.reload({
            stream: true
        }));

    return gulp.src('app/vendors/materialize/sass/materialize.scss')
        .pipe(sass())
        .pipe(gulp.dest("app/vendors/materialize/css/"))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// BrowserSync
gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: 'app'
        },
    })
})

// Watch
gulp.task('watch', function () {
    gulp.watch('app/resources/sass/*.scss', ['sass']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
});

// Default
gulp.task('default', ['browserSync', 'sass', 'watch'], function () {
    // Stuff
});