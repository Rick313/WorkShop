gulp = require ('gulp')
/*Html*/
pug = require ('gulp-pug') 
/*Css*/
sass = require ('gulp-sass')
autoprefixer = require ('gulp-autoprefixer')
imageMin = require ('gulp-imagemin')
unCss = require ('gulp-uncss')
critical = require ('gulp-critical-css')
/*JavaScript*/
coffee = require ('gulp-coffee')
sourcemaps = require('gulp-sourcemaps')
/*Other*/
watch = require ('gulp-watch')
serve = require('gulp-serve') //Useless
connect = require('gulp-connect');
uglify = require ('gulp-uglify')
rename = require ('gulp-rename')
runSequence = require('run-sequence');

/*Path*/
src = "Public"
dest = "Dist"

/*Server*/
gulp.task('webserver', () => 
  connect.server({
    port: 8075,
    //host: "gulp",
    livereload:{
        port: 8074,
        //hostname: 'live'
    },
     root: [dest+'/', dest+'/']
  })
)
 
gulp.task('reload', () => 
  gulp.src([dest+'/*.html', dest+'/Css/*.css', dest+'/Js/*.js'])
    .pipe(connect.reload())
)
gulp.task('watch', function () {
  gulp.watch([
      [dest+'/*.html'], ['reload'], 
      [dest+'/Css/*.css'], ['reload'],
      [dest+'/Js/*.js'], ['reload']
      ]);
//   gulp.watch([dest+'/Css/*.css'], ['livereload']);
//   gulp.watch([dest+'/Js/*.js'], ['livereload']);
});

gulp.task('devServe', ['webserver', 'didYouSee', 'watch'])

/*Html - task*/
gulp.task('pugLife', function buildHTML() {
  return gulp.src(src+'/Pug/*.pug')
  .pipe(pug({
      pretty:true
  }))
  .pipe(gulp.dest(dest))
 })

/*Css - task*/
gulp.task('sass', ()=> {
    return gulp.src(src+'/Sass/**/*.sass')
        .pipe(sourcemaps.init())
        .pipe(sass( 
             /*Values: nested, expanded, compact, compressed*/
            {outputStyle: 'nested'})           
        .on('error', sass.logError))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(dest+'/Css/'))
})

gulp.task('minSass', () => {
     return gulp.src(src+'/Sass/**/*.sass')
        .pipe(sass(
            /*Values: nested, expanded, compact, compressed*/
            {outputStyle: 'compressed'}))
        .pipe(rename("*.min.css"))
        .pipe(gulp.dest(dest+'/Css/'))
})

gulp.task('prefixer', () =>
    gulp.src(src+'/Css/*.css')
        .pipe(autoprefixer({
            browsers: ['last 4 versions'],
            cascade: false
        }))
        .pipe(gulp.dest(dest+'/Css'))
)

gulp.task('critical', () => 
    gulp.src(src+'/Css/*css')
        .pipe(criticalCss())
        .pipe(gulp.dest(dest+'/Css'))
)

gulp.task('imageMin', () =>
    gulp.src(src+'/Img/*')
        .pipe(imageMin({
            interlaced: true,
            progressive: true,
            optimizationLevel: 5,
            svgoPlugins: [{removeViewBox: true}]
            }))
        .pipe(gulp.dest(dest+'/ImgMin'))
)

/*DANGER with class in JS*/
gulp.task('unCss', () => 
    gulp.src(src+'/Css/*.css')
        .pipe(unCss({
            html: ['index.html', 'posts/**/*.html', 'http://example.com'],
            ignore: ['']
        }))
        .pipe(gulp.dest(dest+'/Css'))
)

/*JavaScript - task*/
gulp.task('coffee', () =>
    gulp.src(src+'/Coffee/*.coffee')
        .pipe(sourcemaps.init())
        .pipe(coffee({ bare: true }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(dest+'/Js')) 
)

gulp.task('drinkCoffee',() => {
    return watch(src+'/Coffee/*.coffee', () => {
        gulp.src(src+'/Coffee/*.coffee')
            .pipe(sourcemaps.init())
            .pipe(coffee({ bare: true }))
            .pipe(sourcemaps.write('./maps'))
            .pipe(gulp.dest(dest+'/Js')) 
    })
})

/*Other - task*/
gulp.task('serve', serve('public'))
gulp.task('serve-build', serve(['public', 'build']))
gulp.task('serve-prod', serve({
  root: ['public', 'build'],
  port: 8075,
  middleware: function(req, res) {
  }
}))

gulp.task('rename', () =>
    gulp.src("", { base: process.cwd() })
        .pipe(rename({
            dirname: "",
            basename: "",
            prefix: "",
            suffix: "a",
            extname: ""
        }))
    .pipe(gulp.dest(""))
)

gulp.task('factory', function(callback) {
  runSequence('sass', 'prefixer', 'imageMin', callback);
});

/*Watcher*/
gulp.task('didYouSee',() => {
    console.log('Ok, I try to see')
    gulp.watch(src+'/Pug/**/*.pug',['pugLife'])
    gulp.watch(src+'/Sass/**/*.sass',['factory'])
    gulp.watch(src+'/Coffee/**/*.coffee',['coffee'])
})
