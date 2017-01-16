// Dependencies
var gulp = require("gulp");
var sass = require("gulp-sass");
var browserSync = require("browser-sync").create();
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var cssnano = require("gulp-cssnano");
var plumber = require("gulp-plumber");

// Sass
gulp.task("sass", function () {
    return gulp.src("src/public/resources/sass/*.scss")
        .pipe(plumber())
        .pipe(sass())
        .pipe(gulp.dest("src/public/resources/css/"))
        .pipe(browserSync.reload({
            stream: true
        }));

    return gulp.src("src/public/vendors/materialize/sass/materialize.scss")
        .pipe(plumber())
        .pipe(sass())
        .pipe(gulp.dest("src/public/vendors/materialize/css/"))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// BrowserSync
gulp.task("browserSync", function () {
    browserSync.init(null, {
        proxy: "http://localhost:3000",
        files: ["public/**/*.*"],
        browser: "google chrome",
        port: 7000,
    });
});

// Scripts - concatinate and uglify all js files
gulp.task("scripts", function () {
    return gulp.src("src/public/resources/js/**/*.js")
        .pipe(plumber())
        .pipe(concat("scripts.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest("src/public/dist/scripts"));
});

// Styles - concatinate and minify all css files
gulp.task("styles", function () {
    return gulp.src("src/public/resources/css/**/*.css")
        .pipe(plumber())
        .pipe(concat("style.min.css"))
        .pipe(cssnano())
        .pipe(gulp.dest("src/public/dist/css"));
});

// Build
gulp.task("build", ["scripts", "styles"], function () {
    // Stuff
});

// Watch
gulp.task("watch", function () {
    gulp.watch("src/public/resources/sass/*.scss", ["sass"]);
    gulp.watch("src/public/*.html", browserSync.reload);
    gulp.watch("src/public/js/**/*.js", browserSync.reload);
});

// Default
gulp.task("default", ["browserSync", "sass", "watch"], function () {
    // Stuff
});