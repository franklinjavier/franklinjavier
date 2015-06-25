var gulp = require('gulp'),
  sync = require('browser-sync'),
  sass = require('gulp-sass'),
  sys = require('sys'),
  exec = require('child_process').exec,
  concat = require('gulp-concat'),
  rsync  = require('gulp-rsync'),
  htmlmin = require('gulp-htmlmin'),
  uglify = require('gulp-uglify');


function puts(error, stdout, stderr) { 
  sync.reload();
}

gulp.task('default', ['sync'], function () {
  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch('src/css/**/*.{scss,css}', ['sass']);
  gulp.watch('{src/content,templates}/**/*', ['templates']);
});

gulp.task('templates', function() {
  exec('node index.js', puts);
});

gulp.task('js', function() {
  gulp.src('./src/js/**/*.js')
  .pipe(concat('main.js'))

  // Specify the output destination
  .pipe(gulp.dest('./build/js/'))

  // Reload the browser-sync
  .pipe(sync.reload({stream:true}));
});

gulp.task('sass', function() {
  return gulp.src('./src/css/**/*.scss')
  .pipe(sass({
    //includePaths: ['scss']
  }))

  // Specify the output destination
  .pipe(gulp.dest('./build/css/'))

  // Reload the browser-sync
  .pipe(sync.reload({stream:true}));
});

gulp.task('sync', function() {

  sync.init(['./**/*.html', './**/*.css', './**/*.js'], {
    server: {
      baseDir: './build'
    },
    open: false,     // don't open the browser
    notify: false,   // hide the notify on the corner
    ghostMode: {
      clicks: true,
      location: true,
      forms: true,
      scroll: true
    }
  });

});


/**
 * Minimize HTML files
 */
gulp.task('minify:html', function() {
  return gulp.src('./build/**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./build/'));
});


/**
 * Minimize JS files
 */
gulp.task('minify:js', function() {
  return gulp.src('./build/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./build/'));
});


/**
 * Deploy to server build files
 */
gulp.task('deploy', ['minify:html', 'minify:js'], function() {
  return gulp.src('./build/**')
  .pipe(rsync({
    destination: '/var/www/franklinjavier/',
    root: 'build',
    hostname: 'franklinjavier.com',
    username: 'site',
    incremental: true,
    progress: true,
    relative: true,
    emptyDirectories: true,
    recursive: true,
    exclude: ['.DS_Store', 'node_modules'],
    include: []
  }));

});


