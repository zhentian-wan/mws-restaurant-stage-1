const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const minifyCss = require('gulp-minify-css');
const runSequence = require('run-sequence');
const del = require('del');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const eslint = require('gulp-eslint');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const htmlmin = require('gulp-htmlmin');
const shell = require('gulp-shell');
const gConfig = require('./gulp.config.js');


//Default task
gulp.task('default', function (callback) {
    runSequence('start', [ 'watch'], callback);
});

gulp.task('start', function (callback) {
    runSequence('clean', 'copy-build', callback); //run clean first, then copy-build
});

gulp.task('clean', function (callback) {
    return del([gConfig.build.dir], {force: true}, callback);
});

gulp.task('copy-build', ['html', 'styles', 'sw', 'libs', 'imgs', 'scripts:main', 'scripts:restaurant']);

gulp.task('html', function () {
    gulp.src(gConfig.app_file.html_src)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});

gulp.task('styles', function () {
    gulp.src(gConfig.app_file.scss_src)
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(minifyCss())
        .pipe(gulp.dest(gConfig.build.build_css));
});

gulp.task('lint', () => {
    return gulp.src(['**/*.js', '!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});


gulp.task('scripts:main', function () {
    gulp.src(gConfig.app_file.js_main_src)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(gConfig.build.build_js));
});

gulp.task('scripts:restaurant', function () {
    gulp.src(gConfig.app_file.js_restaurant_src)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('restaurant_info.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(gConfig.build.build_js))
});

gulp.task('libs', function () {
    gulp.src(gConfig.app_file.libs)
        .pipe(plumber())
        .pipe(concat('vender.js'))
        .pipe(uglify())
        .pipe(gulp.dest(gConfig.build.build_libs));
});

gulp.task('sw', function () {
    gulp.src(gConfig.app_file.sw_src)
        .pipe(gulp.dest(gConfig.build.dir));
});

gulp.task('imgs', shell.task('grunt'));

gulp.task('watch', function () {
    gulp.watch(gConfig.app_file.img_src, ['imgs']);
    gulp.watch(gConfig.app_file.html_src, ['html']);
    gulp.watch(gConfig.app_file.sw_src, ['sw']);
    gulp.watch(gConfig.app_file.scss_src, ['styles']);
    gulp.watch(gConfig.app_file.js_main_src, ['scripts:main']);
    gulp.watch(gConfig.app_file.js_restaurant_src, ['scripts:restaurant']);
});