       var gulp      = require('gulp'), // Подключаем Gulp
        sass        = require('gulp-sass'), //Подключаем Sass пакет,
        browserSync = require('browser-sync')
        concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
	      uglify       = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS); // Подключаем Browser Sync
        cssnano     = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
        cssmin = require('gulp-cssmin'),
        rename      = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
        del         = require('del'), // Подключаем библиотеку для удаления файлов и папок
        plumber = require('gulp-plumber'),
        notify = require('gulp-notify'),
        compass = require('gulp-compass'),
        watch = require('gulp-watch'),
        jadeInheritance = require('gulp-jade-inheritance'),
        jade = require('gulp-jade'),
        changed = require('gulp-changed'),
        cached = require('gulp-cached'),
        gulpif = require('gulp-if'),
        filter = require('gulp-filter');


/*
gulp.task('jades', function() {
 
  gulp.src('app/jade/*.jade')
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('app/'))
    .pipe(browserSync.reload({stream: true})) 
  
});
*/

gulp.task('jade', function() {
    return gulp.src('app/jade/**/*.jade')
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        //only pass unchanged *main* files and *all* the partials
        .pipe(changed('dist', {extension: '.html'}))

        //filter out unchanged partials, but it only works when watching
        .pipe(gulpif(global.isWatching, cached('jade')))

        //find files that depend on the files that have changed
        .pipe(jadeInheritance({basedir: 'app/jade'}))

        //filter out partials (folders and files starting with "_" )
        .pipe(filter(function (file) {
            return !/\/_/.test(file.path) && !/^_/.test(file.relative);
        }))

        //process jade templates
        .pipe(jade())

        //save all the files
        .pipe(gulp.dest('app/'));
});
gulp.task('setWatch', function() {
    global.isWatching = true;
});

gulp.task('sass', function() {
  gulp.src('app/sass/**/*.scss')
  	//.pipe(plumber(plumberErrorHandler))
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(compass({
      config_file: 'config.rb',
      css: 'app/css',
      sass: 'app/sass',
    }))
    .pipe(sass({
          outputStyle: 'compressed',
          includePaths: ['node_modules/susy/sass']
      }).on('error', sass.logError))
  
    .pipe(cssmin())
    .pipe(gulp.dest('app/css')) 
    .pipe(browserSync.reload({stream: true})) 
   
});



gulp.task('browser-sync', function() { // Создаем таск browser-sync
        browserSync({ // Выполняем browser Sync
            server: { // Определяем параметры сервера
                baseDir: 'app' // Директория для сервера - app
            },
            online: true,

            notify: false // Отключаем уведомления
        });
});

gulp.task('scripts', function() {
	return gulp.src([ // Берем все необходимые библиотеки
		'app/libs/jquery/dist/jquery.min.js', // Берем jQuery
		'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // Берем Magnific Popup
		])
		.pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
		.pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});



gulp.task('clean', function() {
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('clear', function (callback) {
	return cache.clearAll();
})




gulp.task('watch', ['browser-sync', 'sass', 'setWatch', 'jade' ,'scripts'], function() {
    gulp.watch('app/sass/**/*.scss', ['sass']);
    gulp.watch('app/jade/**/*.jade',['jade']);
    gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('app/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
    
});   

gulp.task('build', ['clean', 'sass', 'scripts'], function() {

	var buildCss = gulp.src([ // Переносим библиотеки в продакшен
		'app/css/main.css',
		'app/css/libs.min.css'
		])
	.pipe(gulp.dest('dist/css'))

	var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
	.pipe(gulp.dest('dist/fonts'))
    
    var buildImg = gulp.src('app/img/**/*') // Переносим шрифты в продакшен
	.pipe(gulp.dest('dist/img'))
    
    var buildImages = gulp.src('app/images/**/*') // Переносим шрифты в продакшен
	.pipe(gulp.dest('dist/images'))

	var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
	.pipe(gulp.dest('dist/js'))

	var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
	.pipe(gulp.dest('dist'));

});

gulp.task('default', ['watch']);