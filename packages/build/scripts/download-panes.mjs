/**
 * Download all previous Ember Inspectors that
 * were uploaded to S3. Each version supports
 * a different Ember version range.
 *
 * These versions will end up in the folder
 * `dist_prev` to be added to the published
 * package.
 */

import got from 'got';
import fs from 'fs';
import { promisify } from 'util';
import stream from 'stream';
import yauzl from 'yauzl';
import path from 'path';
import { rimraf } from 'rimraf';
import packageJson from 'ember-inspector/package.json' with { type: 'json' };

const yauzlFromBuffer = promisify(yauzl.fromBuffer);
const pipeline = promisify(stream.pipeline);

async function main() {
  await rimraf('dist_prev');

  for (let version of packageJson.previousEmberVersionsSupported) {
    let dasherizedVersion = version.replace(/\./g, '-');
    let paneFolder = `panes-${dasherizedVersion}`;

    await downloadPane(paneFolder, 'chrome');
    await downloadPane(paneFolder, 'firefox');
    await downloadPane(paneFolder, 'bookmarklet');
  }
}

async function downloadPane(paneFolder, dist) {
  console.log(`Downloading ${dist} ${paneFolder}`);

  let response = await got(
    `https://github.com/emberjs/ember-inspector/blob/panes/${paneFolder}/${dist}.zip?raw=true`,
    {
      responseType: 'buffer',
    },
  );

  await unzip(response.body, `dist_prev/production/${dist}/${paneFolder}`);
}

async function unzip(zipFileBuffer, dir) {
  let zipfile = await yauzlFromBuffer(zipFileBuffer, { lazyEntries: true });
  let openReadStream = promisify(zipfile.openReadStream.bind(zipfile));

  zipfile.readEntry();
  zipfile.on('entry', async (entry) => {
    if (entry.fileName.endsWith('/')) {
      // skip directories, we are going to mkdirp on the file anyways
      zipfile.readEntry();
      return;
    }

    // file entry
    let readStream = await openReadStream(entry);
    let entryFullPath = `${dir}/${entry.fileName}`;

    // ensure parent directory exists
    fs.mkdirSync(path.dirname(entryFullPath), { recursive: true });

    readStream.on('end', function () {
      zipfile.readEntry();
    });

    await pipeline(readStream, fs.createWriteStream(entryFullPath));
  });
}

main();
