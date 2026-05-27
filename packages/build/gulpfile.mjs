import { src, dest, parallel, series } from 'gulp';
import zip from 'gulp-zip';
import { deleteAsync } from 'del';
import pkg from 'ember-inspector/package.json' with { type: 'json' };

const versionedPane = `panes-${pkg.emberVersionsSupported[0].replace(
  /\./g,
  '-',
)}`;

const compress = (baseSrc, archiveName) =>
  function compress() {
    return src(`${baseSrc}/**/*`).pipe(zip(archiveName)).pipe(dest('dist'));
  };

export const cleanDist = () => deleteAsync('./dist');

export const cleanTmp = () => deleteAsync('./tmp');

export const compressExtensions = parallel(
  compress('dist/chrome', 'chrome/ember-inspector.zip'),
  compress('dist/firefox', 'firefox/ember-inspector.zip'),
);

export const compressPanes = series(
  parallel(
    compress(`dist/chrome/${versionedPane}`, 'chrome.zip'),
    compress(`dist/firefox/${versionedPane}`, 'firefox.zip'),
    compress(`dist/bookmarklet/${versionedPane}`, 'bookmarklet.zip'),
  ),
  cleanTmp,
);
