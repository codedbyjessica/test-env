const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const $ = gulpLoadPlugins();
const reload = browserSync.reload;

var dev = false;


//
// SCSS/CSS
//
gulp.task('styles', () => {
  return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.if(dev, $.sourcemaps.write()))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(browserSync.stream());
});


//
// JS
//
gulp.task('scripts', () => {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(dev, $.sourcemaps.write('.')))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(browserSync.stream());
});

const lint = (files) => {
  return gulp.src(files)
    .pipe($.eslint({ fix: true }))
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('app/scripts/**/*.js')
    .pipe(gulp.dest('app/scripts'));
});


//
// HTML
//
gulp.task('nunjucks', function() {
  return gulp.src('app/views/pages/**/*.+(html|nunjucks)')
    .pipe($.nunjucksRender({
        path: ['app/views/']
    }).on('error',function(e){console.log(e);}))
    .pipe(gulp.dest('app'))
});

gulp.task('html', () => {
  return gulp.src([
    'app/*.html'
  ])
  .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
  .pipe($.if(/\.js$/, $.uglify({compress: {drop_console: false}})))
  .pipe($.if(/\.css$/, $.cleanCss()))
  .pipe($.if(/\.html$/, $.htmlmin({
    collapseWhitespace: true,
    conservativeCollapse: true,
    minifyCSS: true,
    minifyJS: {compress: {drop_console: true}},
    processConditionalComments: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true
  })))
  .pipe(gulp.dest('dist'));
});


//
// Website Assets
//
gulp.task('optimize-images', () => {

  // // Optimizes JPGs.
  // console.log("Image optimization: jpg start");
  // exec('find ./app/images/*.jpg -type f | klick-cloudinary-cli ./dist/images/[filename]', function(err, stdout, stderr) {
  //   if (err) {
  //     console.log('optimize-images: failed to optimize jpg images');
  //     return;
  //   }

  //   console.log("stdout: " + stdout);
  //   console.log("stderr: " + stderr);
  //   console.log("Image optimization: JPG end");
  // });

  // // Optimizes icons.
  // console.log("Image optimization: Icons start");
  // exec('find ./app/images/_icons/*.png -type f | klick-cloudinary-cli --format png ./dist/images/_icons/[filename] -c cloudinary.json', function(err, stdout, stderr) {
  //   if (err) {
  //     console.log('optimize-images: failed to optimize icon png images');
  //     return;
  //   }

  //   console.log("stdout: " + stdout);
  //   console.log("stderr: " + stderr);
  //   console.log("Image optimization: Icons end");
  // });

  // // Optimizes PNGs.
  // console.log("Image optimization: PNG start");
  // exec('find ./app/images/*.png -type f | klick-cloudinary-cli --format png ./dist/images/[filename] -c cloudinary.json', function(err, stdout, stderr) {
  //   if (err) {
  //     console.log('optimize-images: failed to optimize png images');
  //     return;
  //   }

  //   console.log("stdout: " + stdout);
  //   console.log("stderr: " + stderr);
  //   console.log("Image optimization: PNG end");
  // });

  return gulp.src([
      // '!app/images/**/*.jpg',
      'app/images/**/*'
    ])
    // .pipe(using({}))
    // .pipe($.cache($.imagemin()))
    .pipe(gulp.dest('./dist/images'));
});

gulp.task('videos', () => {
  return gulp.src('app/videos/**/*')
    .pipe(gulp.dest('dist/videos'));
});

gulp.task('fonts', () => {
  return gulp.src('app/fonts/**/*')
    //.concat('app/fonts/**/*'))
    .pipe($.if(dev, gulp.dest('.tmp/fonts'), gulp.dest('dist/fonts')));
});

gulp.task('pdfs', () => {
  return gulp.src(['app/pdfs/*.pdf','!app/pdfs/doctor-discussion-guide-custom.pdf','!app/pdfs/doctor-discussion-guide-custom_PLS_CLEAR_API_CACHE_WHEN_UPDATE.pdf'])
    .pipe(gulp.dest('dist/pdfs'));
});

gulp.task('pdfs_talkaboutoff', () => {
  return gulp.src(['app/pdfs/doctor-discussion-guide.pdf','app/pdfs/doctor-discussion-guide-custom.pdf', 'app/pdfs/guia-de-conversacion-con-medicos.pdf'])
    .pipe(gulp.dest('dist_talkaboutoff/pdfs'));
});

gulp.task('pdfs-root', () => {
  return gulp.src('app/pdfs/*.pdf')
    .pipe(gulp.dest('app'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*',
    '!app/*.html',
    '!app/Web_talkaboutoff.config'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});


//
// Cleanup
//
gulp.task('clean', (done) => {
  console.log('Task - Clean')
  del.bind(null, ['.tmp', 'dist']);
  done();
});

gulp.task('clean-hard', () => {
  return gulp.src([
    '.tmp',
    'dist',
    'app/*.html',
  ]).pipe($.clean());
});


//
// BrowserSync
//
const browser_sync = (done) => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app']
    },
    serveStatic: ['.tmp', 'app'],
    serveStaticOptions: {
      extensions: ["html","js"]
    }
  });

  done();
}

const watchFiles = (done) => {
  console.log("Watching files for changes...");

  gulp.watch([
    'app/*.html',
    'app/images/**/*',
    '.tmp/**/*'
  ]).on('change', reload);

  gulp.watch('app/views/**/*.html', gulp.series('nunjucks'));
  gulp.watch('app/styles/**/*.scss', gulp.series('styles'));
  gulp.watch('app/scripts/**/*.js', gulp.series('scripts'));
  gulp.watch('app/fonts/**/*', gulp.series('fonts'));

  done();
} 

const devFlag = (done) => {
  dev = false;
  done();
}


//
// Custom Tasks
//
gulp.task('serve', gulp.series('clean', gulp.parallel('styles', 'scripts'), 'nunjucks', gulp.parallel(browser_sync, watchFiles)), (done) => {
  done();
});

gulp.task('build', gulp.series([devFlag, 'clean-hard', 'nunjucks', 'styles', 'scripts', 'lint', 'html']),(done) => {
  done();
});

gulp.task('default', gulp.series('serve'), (done) => {
  done();
});