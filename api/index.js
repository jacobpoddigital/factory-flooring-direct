const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, '..')));

app.get('/*splat', (req, res) => {
  const urlPath = req.path === '/' ? '/index.html' : req.path;
  const filePath = path.join(__dirname, '..', urlPath);

  res.sendFile(filePath, (err) => {
    if (err) res.status(404).send('Not Found');
  });
});

module.exports = app;
