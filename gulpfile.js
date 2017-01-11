// Dependencies
var gulp = require("gulp");
var sass = require("gulp-sass");
var browserSync = require("browser-sync").create();
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var cssnano = require("gulp-cssnano");

// Sass
gulp.task("sass", function () {
    return gulp.src("app/resources/sass/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("app/resources/css/"))
        .pipe(browserSync.reload({
            stream: true
        }));

    return gulp.src("app/vendors/materialize/sass/materialize.scss")
        .pipe(sass())
        .pipe(gulp.dest("app/vendors/materialize/css/"))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// BrowserSync
gulp.task("browserSync", function () {
    browserSync.init({
        server: {
            baseDir: "app"
        },
    })
});

// Scripts - concatinate and uglify all js files
gulp.task("scripts", function () {
    return gulp.src("app/resources/js/**/*.js")
        .pipe(concat("scripts.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest("app/dist/scripts"));
});

// Styles - concatinate and minify all css files
gulp.task("styles", function () {
    return gulp.src("app/resources/css/**/*.css")
        .pipe(concat("style.min.css"))
        .pipe(cssnano())
        .pipe(gulp.dest("app/dist/css"));
});

// Build
gulp.task("build", ["scripts", "styles"], function () {
    // Stuff
});

// Watch
gulp.task("watch", function () {
    gulp.watch("app/resources/sass/*.scss", ["sass"]);
    gulp.watch("app/*.html", browserSync.reload);
    gulp.watch("app/js/**/*.js", browserSync.reload);
});

// Default
gulp.task("default", ["browserSync", "sass", "watch"], function () {
    // Stuff
});