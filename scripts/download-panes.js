/**
 * Download all previous Ember Inspectors that
 * were uploaded to S3. Each version supports
 * a different Ember version range.
 *
 * These versions will end up in the folder
 * `dist_prev` to be added to the published
 * package.
 */

const http = require('http');
const fs = require('fs');
const packageJson = require('../package.json');
const mkdirp = require('mkdirp');
const yauzl = require('yauzl');
const path = require('path');
const rimraf = require('rimraf');

const env = process.env.EMBER_ENV || 'development';
const S3_BUCKET_URL =
  'http://s3-eu-west-1.amazonaws.com/ember-inspector-panes/';

rimraf('dist_prev', function (err) {
  if (err) {
    throw err;
  }
  packageJson.previousEmberVersionsSupported.forEach(function (version) {
    let dasherizedVersion = version.replace(/\./g, '-');
    let paneFolder = 'panes-' + dasherizedVersion;
    ['chrome', 'firefox', 'bookmarklet'].forEach(function (dist) {
      downloadPane(paneFolder, dist);
    });
  });
});

function downloadPane(paneFolder, dist) {
  let dir = 'dist_prev/' + env + '/' + dist;
  let zipFile = dir + '/' + paneFolder + '.zip';
  mkdirp(dir, function () {
    let request = http.get(
      S3_BUCKET_URL + env + '/' + paneFolder + '/' + dist + '.zip',
      function (response) {
        let file = fs.createWriteStream(zipFile);
        file.on('finish', function () {
          dir += '/' + paneFolder;
          unzip(zipFile, dir);
        });
        response.pipe(file);
      }
    );
  });
}

function unzip(zipFile, dir) {
  yauzl.open(zipFile, { lazyEntries: true }, function (err, zipfile) {
    if (err) throw err;
    zipfile.once('end', function () {
      zipfile.close();
      rimraf(zipFile, function (err) {
        if (err) {
          throw err;
        }
      });
    });
    zipfile.readEntry();
    zipfile.on('entry', function (entry) {
      if (/\/$/.test(entry.fileName)) {
        // directory file names end with '/'
        mkdirp(dir + '/' + entry.fileName, function (err) {
          if (err) throw err;
          zipfile.readEntry();
        });
      } else {
        // file entry
        zipfile.openReadStream(entry, function (err, readStream) {
          if (err) throw err;
          // ensure parent directory exists
          mkdirp(path.dirname(dir + '/' + entry.fileName), function (err) {
            if (err) throw err;
            readStream.pipe(fs.createWriteStream(dir + '/' + entry.fileName));
            readStream.on('end', function () {
              zipfile.readEntry();
            });
          });
        });
      }
    });
  });
}
