/**
 * gulpfile.js
 */

/**
 * CONFIG
 *
 * Require packages
 */
const gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  babel = require('babelify'),
  browserify = require('browserify'),
  bs = require('browser-sync').create(),
  buffer = require('vinyl-buffer'),
  cheerio = require('gulp-cheerio'),
  del = require('del'),
  env = require('dotenv'),
  eslint = require('gulp-eslint'),
  exec = require('child_process').exec,
  htmlhint = require('gulp-htmlhint'),
  imagemin = require('gulp-imagemin'),
  minify = require('gulp-clean-css'),
  replace = require('gulp-replace'),
  sass = require('gulp-sass'),
  source = require('vinyl-source-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  svgstore = require('gulp-svgstore'),
  stylelint = require('gulp-stylelint'),
  uglify = require('gulp-uglify');

/**
 * ENV
 *
 * Set user environment variables.
 * Require statements need to be declared before this setting.
 */
env.config();

/**
 * ROOTS
 */
const srcroot = 'src';
const dstroot = process.env.WEB_PATH;

/**
 * CONFIG
 *
 * Create variables
 */
const config = {
  fonts: {
    src: './' + srcroot + '/fonts/',
    dst: './' + dstroot + '/fonts/',
  },

  images: {
    src: './' + srcroot + '/images/',
    dst: './' + dstroot + '/images/',
  },

  markup: {
    entry: './templates/_layout.twig',
    src: './templates/',
    dst: './templates/',
  },

  styles: {
    entry: './' + srcroot + '/styles/index.scss',
    src: './' + srcroot + '/styles/**/*.scss',
    dst: './' + dstroot + '/styles/',
  },

  scripts: {
    entry: './' + srcroot + '/scripts/index.js',
    src: './' + srcroot + '/scripts/**/*.js',
    dst: './' + dstroot + '/scripts/',
  },
};

/**
 * CLEAN
 *
 * Individual clean tasks
 */
gulp.task('clean:fonts', function (cb) {
  del([config.fonts.dst], cb);
});
gulp.task('clean:images', function (cb) {
  del([config.images.dst], cb);
});
gulp.task('clean:scripts', function (cb) {
  del([config.scripts.dst], cb);
});
gulp.task('clean:styles', function (cb) {
  del([config.styles.dst], cb);
});

/**
 * FONTS:PASSTHROUGH
 *
 * Copy fonts to dist (no processing)
 */
gulp.task('fonts:passthrough', function () {
  gulp.src([
      config.fonts.src + '**/*.eot',
      config.fonts.src + '**/*.ttf',
      config.fonts.src + '**/*.woff',
      config.fonts.src + '**/*.woff2',
    ])
    .pipe(gulp.dest(config.fonts.dst));
});

/**
 * IMAGES:RASTER
 *
 * optimizationLevel set to 0 to disable CPU-intensive image crunching.
 * Use ImageOptim (lossless) on your source images.
 * We do want images to be progressive and interlaced, though.
 */
gulp.task('images:raster', function () {
  gulp.src([
      config.images.src + '**/*.gif',
      config.images.src + '**/*.jpg',
      config.images.src + '**/*.png',
      config.images.src + '**/*.svg',
      config.images.src + '**/*.ico',
    ])
    .pipe(imagemin({
      optimizationLevel: 0,
      progressive: true,
      interlaced: true,
    }))
    .pipe(gulp.dest(config.images.dst));
});

/**
 * IMAGES:VECTOR:SPRITES
 *
 * Combine all svgs in target directory into a single spritemap.
 */
gulp.task('images:vector:sprites', function () {
  gulp.src([
      config.images.src + 'sprites/*.svg',
    ])
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(cheerio({
      run: function ($) {
        $('svg').attr('style', 'display:none'); // make sure the spritemap doesn't show
        $('[fill]').removeAttr('fill'); // remove all 'fill' attributes in order to control via CSS
      },
      parserOptions: { lowerCaseAttributeNames: false },
    }))
    .on('error', function (err) { displayError(err); })
    .pipe(gulp.dest(config.images.dst + 'sprites/'));
});

/**
 * IMAGES:VECTOR:PASSTHROUGH
 *
 * Regardless of other processing, at least copy all vectors to dist
 */
gulp.task('images:vector:passthrough', function () {
  gulp.src([
      config.images.src + '**/*.svg'
    ])
    .pipe(gulp.dest(config.images.dst));
});

/**
 * MARKUP:REPLACE
 *
 * Replace build param on assets in layout to bust cache
 */
gulp.task('markup:replace', function () {
  gulp.src([
      config.markup.entry,
    ])
    .pipe(replace(/\?build=(\d+)/g, '?build=' + Date.now()))
    .pipe(gulp.dest(config.markup.dst));
});

/**
 * MARKUP:LINT
 *
 * Check HTML for closing tags etc
 */
gulp.task('markup:lint', function () {
  gulp.src([
      config.markup.src + '**/*.html',
      config.markup.src + '**/*.php',
      config.markup.src + '**/*.twig',
    ])
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.reporter());
});

/**
 * STYLES:SASS
 *
 * Compile SASS
 */
gulp.task('styles:sass', function () {
  return gulp.src([
      config.styles.entry,
    ])
    .pipe(sass().on('error', function (err) {
      console.error(err);
      this.emit('end');
    }))
    .pipe(autoprefixer({
      browsers: [
        'last 2 versions',
        'ie 11',
        'ios > 8',
      ],
      cascade: false,
    }))
    .pipe(minify({
      mediaMerging: true,
      processImport: true,
      roundingPrecision: 10,
    }))
    .pipe(gulp.dest(config.styles.dst))
    .pipe(bs.stream());
});

/**
 * STYLES:LINT
 *
 * Lint styles using .stylelintrc
 */
gulp.task('styles:lint', function () {
  gulp.src([
      config.styles.src,
    ])
    .pipe(stylelint({
      reporters: [
        { formatter: 'string', console: true }
      ]
    }));
});

/**
 * SCRIPTS:BROWSERIFY
 *
 * Transpile and bundle JS
 */
gulp.task('scripts:es6', function () {
  return browserify({ entries: config.scripts.entry, debug: true })
    .transform(babel)
    .bundle()
    .on('error', function (err) {
      console.error(err);
      this.emit('end');
    })
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.scripts.dst))
    .pipe(bs.stream());
});

/**
 * SCRIPTS:LINT
 *
 * Lint scripts using .eslintrc
 */
gulp.task('scripts:lint', function () {
  return gulp.src([
      config.scripts.src,
    ])
    .pipe(eslint())
    .pipe(eslint.format());
});

/**
 * WATCH
 *
 * Init broswer sync then watch styles and scripts
 */
gulp.task('watch', function () {
  bs.init({
    proxy: process.env.ASSETS_URL,
    host: process.env.ASSETS_URL.split('http://')[1],
    open: false,
  });
  gulp.watch(config.styles.src, ['styles:sass']);
  gulp.watch(config.scripts.src, ['scripts:es6']);
});

/**
 * TASK WRAPPERS
 *
 * Wrappers for the individual build tasks as well as a bundled build task
 */
gulp.task('clean', ['clean:fonts', 'clean:images', 'clean:scripts', 'clean:styles']);
gulp.task('fonts', ['fonts:passthrough']);
gulp.task('images', ['images:raster', 'images:vector:sprites', 'images:vector:passthrough']);
gulp.task('markup', ['markup:replace']);
gulp.task('styles', ['styles:sass']);
gulp.task('scripts', ['scripts:es6']);
gulp.task('build', ['fonts', 'images', 'markup', 'styles', 'scripts']);

/**
 * DEFAULT
 *
 * This list will be written to the terminal when the default Gulp task is run.
 * The intention is to use direct tasks instead of a vague reference to the default task.
 */
gulp.task('default', function () {
  console.log('\nHello!\n\nThis gulpfile doesn\'t do anything by default. Please use the following to see a list of available tasks:\n\n$ gulp --tasks-simple\n\n');
});
