'use strict';

const express = require('express');
const cors = require('cors');
const { readFileSync } = require('fs');

module.exports = (app) => {
  const router = express.Router();

  router.use(cors());

  router.get('/load_inspector.js', (_, res) => {
    const loadInspector = readFileSync(require.resolve('build/load_inspector'));

    res.set('Content-Type', 'application/javascript');
    res.send(loadInspector.toString().replaceAll('{{PANE_ROOT}}', '..'));
  });

  app.use('/bookmarklet', router);
};
