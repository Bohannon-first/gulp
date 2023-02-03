const gulp = require('gulp');
const gulpSass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const rename = require('gulp-rename');
const csso = require('gulp-csso');
const svgstore = require('gulp-svgstore');
const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const webp = require('gulp-webp');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const gcmq = require('gulp-group-css-media-queries');
const del = require('del');
const eslint = require('gulp-eslint');

// Сopying bootstrap files
const connectBootstrap = (done) => {
  gulp.src([
    './source/css/bootstrap/**',
    './source/js/bootstrap/**',
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('./build'));
  done();
};

// Sass-compiler
const sassCompileCss = () => {
  return gulp.src('./source/scss/main.scss')
    .pipe(sourcemaps.init())
    .pipe(gulpSass())
    .pipe(gcmq())
    .pipe(gulp.dest('./source/css'))
    .pipe(gulp.dest('./build/css'))
    .pipe(postcss([autoprefixer()]))
    .pipe(csso())
    .pipe(rename('main.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build/css'))
    .pipe(browserSync.stream());
};

// Html
const html = () => {
  return gulp.src('./source/*.html')
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream());
};

// Scripts
const scripts = () => {
  return gulp.src('./source/js/*.js')
    .pipe(gulp.dest('./build/js'))
    .pipe(browserSync.stream());
};

// OptimizeImages
const optimizeImages = () => {
  return gulp.src('./source/img/**/*.{png,jpg,jpeg,svg}')
    .pipe(imagemin([
      imagemin.mozjpeg({quality: 80, progressive: true}),
      imageminPngquant({
        speed: 5,
        quality: [0.6, 0.8]
      }),
      imagemin.svgo()
    ]))

    .pipe(gulp.dest('./build/img'));
};

// CreateWebp
const createWebp = () => {
  return gulp.src('./build/img/**/*.{png,jpg,jpeg}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('./build/img'));
};

// Sprite
const sprite = () => {
  return gulp.src('./build/img/icons-sprite/*.svg')
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('./build/img'));
};

// Ttf2 to woff
const ttf2ToWoff = (done) => {
  gulp.src(['./source/fonts/*.ttf'])
    .pipe(ttf2woff())
    .pipe(gulp.dest('./build/fonts'));
  done();
};

// Ttf2 to woff2
const ttf2ToWoff2 = (done) => {
  gulp.src(['./source/fonts/*.ttf'])
    .pipe(ttf2woff2())
    .pipe(gulp.dest('./build/fonts'));
  done();
};

// Reload
const refresh = (done) => {
  browserSync.reload();
  done();
};

// Запуск сервера + работа вотчера
const server = () => {
  browserSync.init({
    server: 'build',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('source/scss/**/*.scss', gulp.series(sassCompileCss));
  gulp.watch('source/*.html', gulp.series(html));
  gulp.watch('source/js/*.js', gulp.series(scripts));
  gulp.watch('source/img/**/*.{png,jpg,jpeg,svg}', gulp.series(optimizeImages, createWebp, sprite, refresh));
};

// Clean
const clean = () => {
  return del('build');
};

// Eslint
const esLinter = () => {
  return gulp.src(['./source/js/**/*.js', '!./source/js/bootstrap/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
};

// Build
exports.build = gulp.series(
  clean,
  connectBootstrap,
  sassCompileCss,
  html,
  scripts,
  optimizeImages,
  createWebp,
  sprite,
  gulp.parallel(
    ttf2ToWoff2,
    ttf2ToWoff
  )
);

// Default
exports.start = gulp.series(
  clean,
  connectBootstrap,
  sassCompileCss,
  html,
  scripts,
  optimizeImages,
  createWebp,
  sprite,
  gulp.parallel(
    ttf2ToWoff2,
    ttf2ToWoff
  ),
  server
);

// Eslinter
exports.test = gulp.series(esLinter);
