let projectFolder = 'dist';
let sourceFolder = '#src';
let fs = require('fs');

let path = {
	build: {
		html: projectFolder + '/',
		css: projectFolder + '/css/',
		js: projectFolder + '/js/',
		images: projectFolder + '/images/',
		fonts: projectFolder + '/fonts/'
	},
	src: {
		html: [sourceFolder + '/*.html', '!' + sourceFolder + '/_*.html'],
		css: sourceFolder + '/scss/style.scss',
		js: sourceFolder + '/js/main.js',
		images: sourceFolder + '/images/**/*.{jpg,png,svg,gif,ico,webp}',
		fonts: sourceFolder + '/fonts/*.{ttf,eot}'
	},
	watch: {
		html: sourceFolder + '/**/*.html',
		css: sourceFolder + '/scss/**/*.scss',
		js: sourceFolder + '/js/**/*.js',
		images: sourceFolder + '/images/**/*.{jpg,png,svg,gif,ico,webp}',
		fonts: sourceFolder + '/fonts/*.{ttf,eot}'
	},
	clean: './' + projectFolder + '/'
};


// здесь объявляются все переменные для gulp +++++++++++++++++++++++++++
let { src, dest } = require('gulp'),
	gulp = require('gulp'),
	browsersync = require('browser-sync').create(),
	fileinclude = require('gulp-file-include'),
	del = require('del'),
	scss = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	groupmedia = require('gulp-group-css-media-queries'),     /* плагин для группировки медиа-запросов и формирует их в один, ставит в конец файла */
	cleancss = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify-es').default,
	imagemin = require('gulp-imagemin'),
	webp = require('gulp-webp'),
	webphtml = require('gulp-webp-html'),
	webpcss = require('gulp-webpcss'),
	svgSprite = require('gulp-svg-sprite'),
	ttf2woff = require('gulp-ttf2woff'),
	ttf2woff2 = require('gulp-ttf2woff2'),
	fonter = require('gulp-fonter'),
	concat = require('gulp-concat');
// +++++++++++++++++++++++++++


// настройки браузерсинк +++++++++++++++++++++++++++ 
gulp.task('browser-sync', function () {
	browsersync.init({
		server: {
			baseDir: './' + projectFolder + '/'
		},
		port: 3000,
		notify: false
	})
});
// +++++++++++++++++++++++++++


// таск для работы с html файлами +++++++++++++++++++++++++++
gulp.task('html', function () {
	return src(path.src.html)
		.pipe(fileinclude())
		.pipe(webphtml())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream())
});
// +++++++++++++++++++++++++++


// работаем с CSS/SASS файлами +++++++++++++++++++++++++++
gulp.task('css', function () {
	return src(path.src.css, gulp.parallel('html'))
		.pipe(
			scss({
				outputStyle: 'expanded'
			})
		)
		.pipe(
			groupmedia()
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 8 versions"],
				browsers: [
					"Android >= 4",
					"Chrome >= 20",
					"Firefox >= 24",
					"Explorer >= 11",
					"iOS >= 6",
					"Opera >= 12",
					"Safari >= 6",
				],
				cascade: true
			})
		)
		.pipe(webpcss())
		.pipe(dest(path.build.css))
		.pipe(cleancss())
		.pipe(
			rename({
				extname: '.min.css'
			})
		)
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
});
// +++++++++++++++++++++++++++


gulp.task('js', function () {
	return src(path.src.js)
		.pipe(fileinclude())
		.pipe(dest(path.build.js))
		.pipe(
			uglify()
		)
		.pipe(
			rename({
				extname: '.min.js'
			})
		)
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream())
});


// удаление лишнего из build +++++++++++++++++++++++++++
gulp.task('clean', function () {
	return del.sync(path.clean, gulp.parallel('html'));
});
// +++++++++++++++++++++++++++


// работа с графикой +++++++++++++++++++++++++++
gulp.task('images', function () {
	return src(path.src.images)
		.pipe(
			webp({
				quality: 70
			})
		)
		.pipe(dest(path.build.images))
		.pipe(src(path.src.images))
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				interplaced: true,
				optimizationLevel: 3 // 0 to 7
			})
		)
		.pipe(dest(path.build.images))
		.pipe(browsersync.stream())
});
// +++++++++++++++++++++++++++


// обрабатываем шрифты  +++++++++++++++++++++++++++
gulp.task('fonts', function () {
	gulp.src(path.src.fonts)
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts));
	return gulp.src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts));
});
// +++++++++++++++++++++++++++


// конвертируем шрифты из отф в ттф  (отдельно вызываем командой gulp otf2ttf)  +++++++++++++++++++++++++++
gulp.task('otf2ttf', function () {
	return gulp.src([sourceFolder + '/fonts/*.otf'])
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(dest(sourceFolder + '/fonts/'))
});
// +++++++++++++++++++++++++++

// спрайты ++++++++++++++++++++++ (вызываем отдельно командой gulp svgSprite)
gulp.task('svgSprite', function () {
	return gulp.src([sourceFolder + '/iconsprite/*.{svg,png,jpg}'])
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: '../icons/icons.svg', // sprite file name
					// example: true
				}
			},
		}))
		.pipe(dest(path.build.images))
});



// +++++++++++++++++++++++


gulp.task('fontsStyle', function () {
	let file_content = fs.readFileSync(sourceFolder + '/scss/_fonts.scss');
	if (file_content == '') {
		fs.writeFile(sourceFolder + '/scss/_fonts.scss', '', cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(sourceFolder + '/scss/_fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
				}
			}
		})
	}
});

function cb() {

}


// создаём библиотеку для  js плагинов
gulp.task('libsJs', function () {
	return gulp.src([
		'node_modules/jquery/dist/jquery.js',
		'node_modules/slick-carousel/slick/slick.js'
	])
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('#src/js'))
		.pipe(gulp.dest('dist/js'))
});
// +++++++++++++++++++++++++++

// создаём библиотеку для  css плагинов
gulp.task('libsCSS', function () {
	return gulp.src([
		'node_modules/slick-carousel/slick/slick.css',
		'node_modules/normalize.css/normalize.css',
	])
		.pipe(concat('libs.min.css'))
		.pipe(cleancss())
		.pipe(dest(path.build.css))
	// .pipe(gulp.dest('#src/css'))
	// .pipe(gulp.dest('dist/js'))
});
// +++++++++++++++++++++++++++

// отслеживаем изменения файлов и переносим из src в dist +++++++++++++++++++++++++++
gulp.task('watch', function () {
	gulp.watch([path.watch.html], gulp.parallel('html'));
	gulp.watch([path.watch.css], gulp.parallel('css'));
	gulp.watch([path.watch.js], gulp.parallel('js'));
	gulp.watch([path.watch.images], gulp.parallel('images'));
});
// +++++++++++++++++++++++++++


// запускаем задачи +++++++++++++++++++++++++++ 
gulp.task(
	'default',
	gulp.parallel(
		'browser-sync',
		'libsJs',
		'libsCSS',
		'fontsStyle',
		'fonts',
		'images',
		'css',
		'js',
		'clean',
		'watch',
		'html',
	),
);
// +++++++++++++++++++++++++++

