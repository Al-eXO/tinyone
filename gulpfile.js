var gulp            = require('gulp'),
    sass            = require('gulp-sass'),
    browserSync     = require('browser-sync'),
    fileinclude     = require('gulp-file-include'),
    sourcemaps      = require('gulp-sourcemaps'),
    gulpRemoveHtml  = require('gulp-remove-html'),
    concat          = require('gulp-concat'),
    cssNano         = require('gulp-cssnano'),
    rename          = require('gulp-rename'),
    autoprefixer    = require('gulp-autoprefixer'),
    del             = require('del'),
    cache           = require('gulp-cache'),
    imagemin        = require('gulp-imagemin'),
    pngquant        = require('imagemin-pngquant');

gulp.task('sass', function(){ // таск Sass
    return gulp.src(['src/assets/sass/**/*.sass'])
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(sass())
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest('src/assets/css'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'src'
        },
        notify: false
    });
});

gulp.task('buildhtml', function() {
    gulp.src(['src/*.html'])
        .pipe(fileinclude({
            prefix: '@@'
        }))
        .pipe(gulpRemoveHtml())
        .pipe(gulp.dest('src/'));
});

gulp.task('watch', ['browser-sync'], function() {
    gulp.watch('src/assets/sass/**/*.sass', ['sass']);
    gulp.watch('src/*.html', browserSync.reload);
    gulp.watch('src/assets/js/**/*.js', browserSync.reload);
});

gulp.task('clean', function() {
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
    return gulp.src('src/assets/img/**/*')
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('clear', function (callback) {
    return cache.clearAll();
})

gulp.task('build', ['clean', 'img', 'sass'], function() {

    var buildCss = gulp.src('src/assets/css/**/*')
        .pipe(concat("main.css"))
        .pipe(cssNano())
        .pipe(gulp.dest('dist/css'))

    var buildFonts = gulp.src('src/assets/fonts/**/*') // Переносим шрифты в продакшен
        .pipe(gulp.dest('dist/fonts'))

    var buildJs = gulp.src('src/assets/js/**/*') // Переносим скрипты в продакшен
        .pipe(gulp.dest('dist/js'))

    var buildPlugins = gulp.src('src/assets/libs/**/*') // Переносим скрипты в продакшен
        .pipe(gulp.dest('dist/libs'))

    var buildHtml = gulp.src('src/*.html') // Переносим HTML в продакшен
        .pipe(gulp.dest('dist'));

});

gulp.task('default', ['watch']);