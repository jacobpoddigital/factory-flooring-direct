const express = require('express');
const path = require('path');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Handle all routes to serve files with query string support
app.get('*', (req, res) => {
  // Strip query string from URL
  const urlWithoutQuery = req.path === '/' ? '/index.html' : req.path;
  const filePath = path.join(__dirname, '..', urlWithoutQuery);

  // Security: prevent directory traversal
  const resolvedPath = path.resolve(filePath);
  const rootPath = path.resolve(path.join(__dirname, '..'));
  if (!resolvedPath.startsWith(rootPath)) {
    return res.status(403).send('Forbidden');
  }

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Not Found');
    }
  });
});

module.exports = app;
