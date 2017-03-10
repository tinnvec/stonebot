const del = require('del')
const gulp = require('gulp')
const gulpTypescript = require('gulp-typescript')

const project = gulpTypescript.createProject('tsconfig.json')

gulp.task('build', () => {
    del.sync(['./built/**/*.*'])

    gulp.src('./src/**/*.ts')
        .pipe(project())
        .pipe(gulp.dest('built/'))

    gulp.src('./src/**/*.js')
        .pipe(gulp.dest('built/'))

    gulp.src('./src/**/*.json')
        .pipe(gulp.dest('built/'))
})