/* eslint-env node */
const gulp = require('gulp');
const zip = require('gulp-zip');
const del = require('del');
const pkg = require('./package.json');
let versionedPane = `panes-${pkg.emberVersionsSupported[0].replace(
  /\./g,
  '-',
)}`;

function compress(baseSrc, archiveName) {
  return gulp
    .src(`${baseSrc}/**/*`)
    .pipe(zip(archiveName))
    .pipe(gulp.dest('dist'));
}

exports['compress:chrome'] = () =>
  compress('dist/chrome', 'chrome/ember-inspector.zip');
exports['compress:firefox'] = () =>
  compress('dist/firefox', 'firefox/ember-inspector.zip');
exports['compress:chrome-pane'] = () =>
  compress(`dist/chrome/${versionedPane}`, 'chrome.zip');
exports['compress:firefox-pane'] = () =>
  compress(`dist/firefox/${versionedPane}`, 'firefox.zip');
exports['compress:bookmarklet-pane'] = () =>
  compress(`dist/bookmarklet/${versionedPane}`, 'bookmarklet.zip');

exports['clean-tmp'] = () => del('./tmp');
