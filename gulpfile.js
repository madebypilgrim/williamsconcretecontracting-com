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
    envify = require('envify'),
    gulpif = require('gulp-if'),
    imagemin = require('gulp-imagemin'),
    livereload = require('gulp-livereload'),
    minify = require('gulp-clean-css'),
    replace = require('gulp-string-replace'),
    sass = require('gulp-sass'),
    source = require('vinyl-source-stream'),
    stylelint = require('gulp-stylelint'),
    svgstore = require('gulp-svgstore'),
    uglify = require('gulp-uglify'),
    watchify = require('watchify');

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
const dstroot = process.env.WEB_DIR;

/**
 * CONFIG
 *
 * Create variables
 */
const lang = 'twig';

let config = {
    fonts: {
        src: './' + srcroot + '/fonts/',
        dst: './' + dstroot + '/fonts/',
    },

    images: {
        src: './' + srcroot + '/images/',
        dst: './' + dstroot + '/images/',
    },

    markup: {
        php: {
            entry: './views/_layouts/*.php',
            src: './views/',
            dst: './views/',
        },

        twig: {
            entry: './templates/_layouts/*.twig',
            src: './templates/',
            dst: './templates/',
        }
    },

    scripts: {
        entry: './' + srcroot + '/scripts/index.js',
        src: './' + srcroot + '/scripts/**/*.js',
        dst: './' + dstroot + '/scripts/',
    },

    styles: {
        entry: './' + srcroot + '/styles/index.scss',
        src: './' + srcroot + '/styles/**/*.scss',
        dst: './' + dstroot + '/styles/',
    },
};

config.markup = config.markup[lang];

/**
 * CLEAN
 *
 * Individual clean tasks
 */
gulp.task('clean:fonts', cb => {
    del([config.fonts.dst]);
    cb();
});
gulp.task('clean:images', cb => {
    del([config.images.dst]);
    cb();
});
gulp.task('clean:scripts', cb => {
    del([config.scripts.dst]);
    cb();
});
gulp.task('clean:styles', cb => {
    del([config.styles.dst]);
    cb();
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
 * IMAGES:RASTER
 *
 * Copies raster images to configured dist directory and
 * performs minimal optimization.
 *
 * optimizationLevel set to 0 to disable CPU-intensive image crunching.
 * Use ImageOptim (lossless) on your source images.
 *
 * We do want images to be progressive and interlaced, though.
 */
gulp.task('images:raster', () => gulp
    .src([
        config.images.src + '**/*.gif',
        config.images.src + '**/*.jpg',
        config.images.src + '**/*.png',
        config.images.src + '**/*.ico',
    ])
    .pipe(imagemin([
        imagemin.gifsicle({
            interlaced: true,
            optimizationLevel: 1
        }),
        imagemin.jpegtran({
            progressive: true
        }),
    ]))
    .pipe(gulp.dest(config.images.dst))
);

/**
 * IMAGES:VECTOR:SPRITES
 *
 * Combine all svgs in target directory into a single spritemap.
 */
gulp.task('images:vector:sprites', () => gulp
    .src([
        config.images.src + 'sprites/*.svg',
    ])
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(cheerio({
        run: $ => {
            $('svg').attr('style', 'display:none'); // make sure the spritemap doesn't show
            $('[fill]').removeAttr('fill'); // remove all 'fill' attributes in order to control via CSS
        },
        parserOptions: { lowerCaseAttributeNames: false },
    }))
    .pipe(gulp.dest(config.images.dst + 'sprites/'))
);

/**
 * IMAGES:VECTOR:PASSTHROUGH
 *
 * Regardless of other processing, at least copy all vectors to dist
 */
gulp.task('images:vector:passthrough', () => gulp
    .src([
        config.images.src + '**/*.svg',
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
        .on('error', err => { console.error(err); })
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
    const bundler = browserify(config.scripts.entry).transform(babel).transform(envify);

    return bundler.bundle()
        .on('error', err => { console.error(err); })
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
gulp.task('scripts:watch', () => {
    livereload.listen();

    const bundler = watchify(browserify(config.scripts.entry, { debug: true }).transform(babel).transform(envify));

    bundler.on('update', rebundle);

    function rebundle() {
        lintJs();

        return bundler.bundle()
            .on('error', err => { console.error(err); })
            .pipe(source('index.js'))
            .pipe(buffer())
            .pipe(gulp.dest(config.scripts.dst))
            .pipe(livereload());
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
        config.styles.entry,
    ])
    .pipe(sass().on('error', err => {
        console.error(err);
    }))
    .pipe(autoprefixer({
        cascade: false,
    }))
    .pipe(minify({
        mediaMerging: true,
        processImport: true,
        roundingPrecision: 10,
    }))
    .pipe(gulp.dest(config.styles.dst))
    .pipe(livereload())
);

/**
 * STYLES:WATCH
 *
 * Watch SASS for changes
 */
gulp.task('styles:watch', () => {
    livereload.listen();
    gulp.watch(config.styles.src, gulp.series(['styles:sass']));
});

/**
 * STYLES:FORMAT
 *
 * Autofix stylistic syntax in your source files using .csscomb.json
 */
gulp.task('styles:format', () => gulp
    .src([
        config.styles.src,
    ])
    .pipe(stylelint({
        fix: true,
        reporters: [
            { formatter: 'string', console: true },
        ],
    }))
    .pipe(gulpif(file => {
        // Hack: if the file was skipped by .stylelintignore file content will be []
        // gulp-stylelint doesn't seems to catch this and rewrites the file to []
        return file.contents.length > 2;
    }, gulp.dest(config.styles.dst.replace(dstroot, srcroot))))
);

/**
 * CACHEBUST
 *
 * Update timestamped asset filenames in layouts to bust cache
 */
gulp.task('cachebust', () => gulp
    .src([
        config.markup.entry,
    ])
    .pipe(replace(/index.(\d+).(js|css)/g, (match, p1, p2) => ['index', Date.now(), p2].join('.')))
    .pipe(gulp.dest(config.markup.dst + '_layouts/'))
);

/**
 * WATCH
 *
 * Watch styles and scripts
 */
gulp.task('watch', gulp.parallel(['styles:watch', 'scripts:watch']));

/**
 * TASK WRAPPERS
 *
 * Wrappers for the individual build tasks as well as a bundled build task
 */
gulp.task('clean', gulp.parallel(['clean:fonts', 'clean:images', 'clean:scripts', 'clean:styles']));
gulp.task('fonts', gulp.parallel(['fonts:passthrough']));
gulp.task('images', gulp.parallel(['images:raster', 'images:vector:sprites', 'images:vector:passthrough']));
gulp.task('scripts', gulp.parallel(['scripts:browserify']));
gulp.task('styles', gulp.parallel(['styles:sass']));
gulp.task('lint', gulp.series(['scripts:lint', 'styles:format']));
gulp.task('build', gulp.series(['lint', 'fonts', 'images', 'scripts', 'styles', 'cachebust']));

/**
 * DEFAULT
 *
 * This list will be written to the terminal when the default Gulp task is run.
 * The intention is to use direct tasks instead of a vague reference to the default task.
 */
gulp.task('default', cb => {
    console.log('\nHello!\n\nThis gulpfile doesn\'t do anything by default. Please use the following to see a list of available tasks:\n\n$ gulp --tasks-simple\n\n');
    cb();
});
