var gulp = require('gulp'),
    sync = require('browser-sync'),
    sass = require('gulp-sass'),
    sys = require('sys'),
    exec = require('child_process').exec,
    concat = require('gulp-concat');

function puts(error, stdout, stderr) { 
    sys.puts(stdout); 
    console.log('mudou');
    sync.reload();
}

gulp.task('default', ['sync'], function () {
    gulp.watch('src/js/**/*', ['js']);
    gulp.watch('src/css/**/*', ['sass']);
    gulp.watch('{src/content,templates}/**/*', ['templates']);
});

gulp.task('templates', function() {
    exec('node index.js', puts);
});

gulp.task('js', function() {

  gulp.src('./src/js/*.js')
    .pipe(concat('main.js'))

    // Specify the output destination
    .pipe(gulp.dest('./build/js/'))

    // Reload the browser-sync
    .pipe(sync.reload({stream:true}));
});

gulp.task('sass', function() {
    gulp.src('./src/css/**/*.scss')
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
