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
  buffer = require('vinyl-buffer'),
  cheerio = require('gulp-cheerio'),
  del = require('del'),
  eslint = require('gulp-eslint'),
  env = require('dotenv'),
  htmlhint = require('gulp-htmlhint'),
  imagemin = require('gulp-imagemin'),
  livereload = require('gulp-livereload'),
  lr = require('tiny-lr'),
  minify = require('gulp-clean-css'),
  replace = require('gulp-replace'),
  sass = require('gulp-sass'),
  source = require('vinyl-source-stream'),
  svgstore = require('gulp-svgstore'),
  stylelint = require('gulp-stylelint'),
  uglify = require('gulp-uglify'),
  watchify = require('watchify');

const server = lr();

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
gulp.task('clean:fonts', cb => {
  del([config.fonts.dst], cb);
});
gulp.task('clean:images', cb => {
  del([config.images.dst], cb);
});
gulp.task('clean:scripts', cb => {
  del([config.scripts.dst], cb);
});
gulp.task('clean:styles', cb => {
  del([config.styles.dst], cb);
});

/**
 * FONTS:PASSTHROUGH
 *
 * Copy raster fonts to dist (no processing)
 */
gulp.task('fonts:passthrough', () => gulp
  .src([
    config.fonts.src + '**/*.eot',
    config.fonts.src + '**/*.ttf',
    config.fonts.src + '**/*.woff',
    config.fonts.src + '**/*.woff2',
  ])
  .pipe(gulp.dest(config.fonts.dst))
);

/**
 * HTMLHINT
 *
 * Check HTML for closing tags etc
 */
gulp.task('htmlhint', () => gulp
  .src([
    config.markup.src + '*.html',
    config.markup.src + '*.php',
    config.markup.src + '*.twig',
  ])
  .pipe(htmlhint('.htmlhintrc'))
  .pipe(htmlhint.failReporter())
);

/**
 * IMAGES:RASTER
 *
 * optimizationLevel set to 0 to disable CPU-intensive image crunching.
 * Use ImageOptim (lossless) on your source images.
 * We do want images to be progressive and interlaced, though.
 */
gulp.task('images:raster', () => gulp
  .src([
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
  .pipe(gulp.dest(config.images.dst))
);

/**
 * IMAGES:VECTOR:SPRITES
 *
 * Combine all svgs in target directory into a single spritemap.
 */
gulp.task('images:vector:sprites', () => gulp
  .src([
    config.images.src + 'sprites/*.svg'
  ])
  .pipe(svgstore({ inlineSvg: true }))
  .pipe(cheerio({
    run: $ => {
      $('svg').attr('style', 'display:none'); // make sure the spritemap doesn't show
      $('[fill]').removeAttr('fill'); // remove all 'fill' attributes in order to control via CSS
    },
    parserOptions: { lowerCaseAttributeNames: false },
  }))
  .on('error', err => { displayError(err); })
  .pipe(gulp.dest(config.images.dst + 'sprites/'))
);

/**
 * IMAGES:VECTOR:PASSTHROUGH
 *
 * Regardless of other processing, at least copy all vectors to dist
 */
gulp.task('images:vector:passthrough', () => gulp
  .src([
    config.images.src + '**/*.svg'
  ])
  .pipe(gulp.dest(config.images.dst))
);

/**
 * SCRIPTS:LINT
 *
 * Lint scripts using .eslintrc
 */
function lintJs() {
  return gulp
    .src([
      config.scripts.src,
    ])
    .pipe(eslint())
    .pipe(eslint.format());
}
gulp.task('scripts:lint', lintJs);

/**
 * SCRIPTS:BROWSERIFY
 *
 * Transpile and bundle JS
 */
gulp.task('scripts:browserify', () => {
  const bundler = browserify(config.scripts.entry).transform(babel);

  return bundler.bundle()
    .on('error', err => {
      console.error(err);
      this.emit('end');
    })
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(config.scripts.dst));
});

/**
 * SCRIPTS:WATCH
 *
 * Watch JS for changes
 */
gulp.task('scripts:watchify', () => {
  const bundler = watchify(browserify(config.scripts.entry, { debug: true }).transform(babel));

  bundler.on('update', rebundle);

  function rebundle() {
    lintJs();

    return bundler.bundle()
      .on('error', err => {
        console.error(err);
        this.emit('end');
      })
      .pipe(source('index.js'))
      .pipe(gulp.dest(config.scripts.dst))
      .pipe(livereload(server));
  }

  return rebundle();
});

/**
 * STYLES:SASS
 *
 * Compile SASS
 */
gulp.task('styles:sass', () => gulp
  .src([
    config.styles.entry
  ])
  .pipe(sass().on('error', err => {
    console.error(err);
    this.emit('end');
  }))
  .pipe(autoprefixer({
    browsers: [
      'last 2 versions',
      'ie 9',
      'ios > 7',
    ],
    cascade: false,
  }))
  .pipe(minify({
    mediaMerging: true,
    processImport: true,
    roundingPrecision: 10,
  }))
  .pipe(gulp.dest(config.styles.dst))
  .pipe(livereload(server))
);

/**
 * STYLES:LINT
 *
 * Lint styles using .stylelintrc and
 */
gulp.task('styles:lint', () => gulp
  .src([
    config.styles.src
  ])
  .pipe(stylelint({
    reporters: [
      { formatter: 'string', console: true }
    ]
  }))
);

/**
 * STYLES:WATCH
 *
 * Watch SASS for changes
 */
gulp.task('styles:watch', () => gulp
  .watch(config.styles.src, ['styles:sass'])
);

/**
 * TWIG:REPLACE
 *
 * Replace build param on assets in layout to bust cache
 */
gulp.task('twig:replace', cb => gulp
  .src([
    config.twig.entry
  ])
  .pipe(replace(/\?build=(\d+)/g, '?build=' + Date.now()))
  .pipe(gulp.dest(config.twig.dst))
);

/**
 * WATCH
 *
 * Watch styles and scripts
 */
gulp.task('watch', ['styles:watch', 'scripts:watchify'], () => {
  livereload.listen(server);
});

/**
 * TASK WRAPPERS
 *
 * Wrappers for the individual build tasks as well as a bundled build task
 */
gulp.task('clean', ['clean:fonts', 'clean:images', 'clean:scripts', 'clean:styles']);
gulp.task('fonts', ['fonts:passthrough']);
gulp.task('images', ['images:raster', 'images:vector:sprites', 'images:vector:passthrough']);
gulp.task('scripts', ['scripts:browserify']);
gulp.task('styles', ['styles:sass']);
gulp.task('twig', ['twig:replace']);
gulp.task('build', ['fonts', 'images', 'scripts', 'styles']);

/**
 * DEFAULT
 *
 * This list will be written to the terminal when the default Gulp task is run.
 * The intention is to use direct tasks instead of a vague reference to the default task.
 */
gulp.task('default', () => {
  console.log('\nHello!\n\nThis gulpfile doesn\'t do anything by default. Please use the following to see a list of available tasks:\n\n$ gulp --tasks-simple\n\n');
});
