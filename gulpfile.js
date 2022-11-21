const { dest, parallel, series, src, watch } = require('gulp');
const autoprefixer = require('autoprefixer');
const browsersync = require('browser-sync').create();
const concat = require('gulp-concat');
const combinemq = require('postcss-combine-media-query');
const cssnano = require('cssnano');
const imagemin = require('gulp-imagemin');
const postcss = require('gulp-postcss');
const replace = require('gulp-replace');
const sass = require('gulp-sass')(require('sass'));
const svgo = require('gulp-svgo');
const uglify = require('gulp-uglify');

// html task // testing to see if I need an index.html in the dist folder
function htmlTask_PROD() {
  return src('index.html')
    .pipe(replace(/\.\/dist/g, '.'))
    .pipe(dest('dist'));
}

// assets
function assetsTask() {
  return src(['src/assets/**', '!src/assets/images/**']).pipe(
    dest('dist/assets')
  );
}

// images
function imageminTask() {
  return src('src/assets/images/*.{png,jpg,jpeg}')
    .pipe(imagemin({ verbose: true }))
    .pipe(dest('dist/assets/images'));
}

// svgs
function svgoTask() {
  return src('src/assets/images/*.svg')
    .pipe(svgo())
    .pipe(dest('dist/assets/images'));
}

// css
function cssTask() {
  const fileOrder = [
    'src/css/reset.css',
    'src/css/fonts.css',
    'src/css/global.css',
    'src/css/compositions.css',
    'src/css/utilities.css',
    'src/css/blocks.css',
    'src/css/exceptions.css',
  ];
  return src(fileOrder, { sourcemaps: true })
    .pipe(concat('styles.css'))
    .pipe(postcss([autoprefixer()]))
    .pipe(dest('dist/css', { sourcemaps: '.' }));
}

function cssTask_PROD() {
  const fileOrder = [
    'src/css/reset.css',
    'src/css/fonts.css',
    'src/css/global.css',
    'src/css/compositions.css',
    'src/css/utilities.css',
    'src/css/blocks.css',
    'src/css/exceptions.css',
  ];
  return src(fileOrder, { sourcemaps: true })
    .pipe(concat('styles.css'))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(dest('dist/css', { sourcemaps: '.' }));
}

// sass
function scssTask() {
  return src('src/sass/main.scss', { sourcemaps: true })
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(dest('dist/css', { sourcemaps: '.' }));
}

function scssTask_PROD() {
  return src('src/sass/main.scss', { sourcemaps: true })
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), combinemq(), cssnano()]))
    .pipe(dest('dist/css', { sourcemaps: '.' }));
}

// js
function jsTask() {
  return src(['src/js/**/*.js', '!src/js/tests/**'], { sourcemaps: true }).pipe(
    dest('dist/js', { sourcemaps: '.' })
  );
}

function jsTask_PROD() {
  return src(['src/js/**/*.js', '!src/js/tests/**'], { sourcemaps: true })
    .pipe(uglify())
    .pipe(dest('dist/js', { sourcemaps: '.' }));
}

// cache-busting
// note, don't forget to append within the index.html, ?cb=123 to any link and scripts
function cacheBustTask() {
  let cbNumber = new Date().getTime();
  return src('index.html')
    .pipe(replace(/cb=\d+/g, 'cb=' + cbNumber))
    .pipe(dest('.'));
}

// browsersync
function browserSyncServe(cb) {
  browsersync.init({
    server: {
      baseDir: '.',
    },
  });
  cb();
}

function browserSyncReload(cb) {
  browsersync.reload();
  cb();
}

// watch
function watchTask() {
  watch('index.html', browserSyncReload);

  watch(
    [
      'src/css/**/*.css',
      'src/sass/**/*.scss',
      'src/js/**/*.js',
      '!src/js/tests/*.js',
    ],
    series(cssTask, scssTask, jsTask, cacheBustTask, browserSyncReload)
  );
  watch('src/assets/images/*', series(imageminTask, browserSyncReload));
}

// I only want these to run once at the start since they're unlikely to change
exports.run = series(assetsTask, imageminTask, svgoTask);

exports.default = series(
  cssTask,
  scssTask,
  jsTask,
  cacheBustTask,
  browserSyncServe,
  watchTask
);

exports.prod = series(
  htmlTask_PROD,
  assetsTask,
  imageminTask,
  svgoTask,
  cssTask_PROD,
  scssTask_PROD,
  jsTask_PROD,
  cacheBustTask
);
