const { series, parallel, watch, dest, src } = require('gulp');
const imagemin = require('gulp-imagemin');
const svgo = require('gulp-svgo');

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

// sass

// js

// browsersync

// cache-busting

// watch

exports.default = series(imageminTask, svgoTask);

// exports.prod = series();
