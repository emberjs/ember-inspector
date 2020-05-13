/**
 * Uploads the current Ember Inspector pane
 * to S3 to later be downloaded by future versions
 * before publishing.
 *
 * Make sure you add the correct AWS credentials
 * to `config/secrets.yml` before uploading.
 */
const AWS = require('aws-sdk');
const packageJson = require('../package.json');
const fs = require('fs');

// eslint-disable-next-line node/no-missing-require
const secrets = require('../config/secrets.json');

const version = packageJson.emberVersionsSupported[0];

function main() {
  if (!packageJson.emberVersionsSupported[1]) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      '[FAILED] You need to set the right limit for the Ember versions supported (in package.json). Exiting...'
    );
    process.exitCode = 1;
    return;
  }

  let config = {
    accessKeyId: secrets.accessKeyId,
    secretAccessKey: secrets.secretAccessKey,
    region: 'eu-west-1',
  };
  AWS.config.update(config);

  let env = process.env.EMBER_ENV || 'development';

  let folderName = 'panes-' + version.replace(/\./g, '-');
  let s3 = new AWS.S3({
    params: { Bucket: 'ember-inspector-panes', ACL: 'public-read' },
  });

  ['chrome', 'firefox', 'bookmarklet'].forEach(function (dist) {
    let body = fs.createReadStream(`dist/${dist}-pane.zip`);

    s3.upload({
      Body: body,
      Key: `${env}/${folderName}/${dist}.zip`,
    }).send(function (err) {
      if (err) {
        throw err;
      }
    });
  });
}

main();
