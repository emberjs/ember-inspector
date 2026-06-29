'use strict';

const express = require('express');
const cors = require('cors');
const { readFileSync } = require('fs');
const { sync: globSync } = require('glob');
const { dirname, join } = require('path');

module.exports = (app) => {
  const router = express.Router();

  router.use(cors());

  const cwd = join(
    dirname(require.resolve('ember-debug/package.json')),
    'dist',
  );
  const files = globSync('**/*.js', { cwd });

  for (const file of files) {
    router.get(
      `/${file === 'bookmarklet-debug.js' ? 'ember_debug.js' : file}`,
      (_, res) => {
        const raw = readFileSync(join(cwd, file));

        res.set('Content-Type', 'application/javascript');
        res.send(raw.toString());
      },
    );
  }

  app.use('/', router);
};
