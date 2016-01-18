/**
 *  项目启动
 */

import gulp from  'gulp';
import gulpLoadPlugins from  'gulp-load-plugins';
import del from  'del';
import runSequence from  'run-sequence';
import browserSync from 'browser-sync';
import webpack from 'webpack-stream';

const $ = gulpLoadPlugins();
const isProduction = process.env.NODE_ENV === "production";

const AUTOPREFIXER_BROWSERS = [
  'ie_mob >= 10',
  'ff >= 40',
  'chrome >= 40',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 2.3',
  'bb >= 10'
];

const paths = {
  dist: {
    base: 'dist',
    js: 'dist/js',
    css: 'dist/css',
    i: 'dist/i',
    fonts: 'dist/css/fonts'
  }
};

// JavaScript 格式校验
gulp.task('jshint', () => {
  return gulp.src('app/js/**/*.js')
    .pipe($.eslint())
    .pipe($.eslint.format());
    // .pipe($.eslint.failOnError());
});

// 图片优化
gulp.task('images', () => {
  return gulp.src('app/i/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(paths.dist.i))
    .pipe($.size({title: 'images'}));
});

// 清除 gulp-cache 缓存
gulp.task('clearCache', (done) => {
  return $.cache.clearAll(done);
});

// 拷贝相关资源
gulp.task('copy', () => {
  return gulp.src([
    'app/*',
    '!app/*.html',
    '!app/js',
    '!app/style',
    '!app/i',
    'node_modules/amazeui-touch/dist/amazeui.touch.min.css',
    'node_modules/amazeui-touch/dist/fonts/*'
  ], {
    dot: true
  }).pipe(gulp.dest(function(file) {
    var filePath = file.path.toLowerCase();
    if (filePath.indexOf('.css') > -1) {
      return paths.dist.css;
    } else if (filePath.indexOf('ratchicons') > -1) {
      return paths.dist.fonts;
    }
    return paths.dist.base;
  }))
    .pipe($.size({title: 'copy'}));
});

// 编译 Sass，添加浏览器前缀
gulp.task('styles', () => {
  return gulp.src(['app/style/app.scss'])
    .pipe($.sass({
      outputStyle: 'expanded'
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe(gulp.dest('dist/css'))
    .pipe($.csso())
    .pipe($.rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/css'))
    .pipe($.size({title: 'styles'}));
});

// 打包 JS
gulp.task('js', () => {
  const s = gulp.src('./app/js/app.js')
    .pipe(webpack({
      watch: false,
      output: {
        filename: 'app.js'
      },
      module: {
        loaders: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel'
          }
        ]
      },
    }))
    .pipe(gulp.dest(paths.dist.js))
    .pipe($.size({title: 'script'}));

  return !isProduction ? s : s.pipe($.uglify())
    .pipe($.rename({suffix: '.min'}))
    .pipe(gulp.dest(paths.dist.js))
    .pipe($.size({
      title: 'script minify'
    }));
});

// 压缩 HTML
gulp.task('html', () => {
  return gulp.src('app/**/*.html')
    .pipe($.minifyHtml())
    .pipe($.replace(/\{\{__VERSION__\}\}/g, isProduction ? '.min' : ''))
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'html'}));
});

// 洗刷刷
gulp.task('clean', () => {
  return del(['dist/*', '!dist/.git'], {dot: true});
});

// 监视源文件变化自动编译
gulp.task('watch', () => {
  gulp.watch('app/**/*.html', ['html']);
  gulp.watch('app/style/**/*.scss', ['styles']);
  gulp.watch('app/i/**/*', ['images']);
  gulp.watch('app/js/**/*', ['jshint', 'js']);
});

// 启动预览服务，并监视 Dist 目录变化自动刷新浏览器
gulp.task('default', ['build', 'watch'], () => {
  const bs = browserSync.create();

  bs.init({
    notify: false,
    logPrefix: 'AMT',
    server: ['dist']
  });

  gulp.watch(['dist/**/*'], bs.reload);
});

gulp.task('build', (cb) => {
  runSequence('clean', ['styles', 'jshint', 'html', 'images', 'copy', 'js'], cb);
});
