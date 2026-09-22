const http = require('http');
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Strip query string from URL
  const urlWithoutQuery = req.url.split('?')[0];
  const filePath = path.join(__dirname, '..', urlWithoutQuery === '/' ? 'index.html' : urlWithoutQuery);

  // Security: prevent directory traversal
  if (!filePath.startsWith(path.join(__dirname, '..'))) {
    res.status(403).end('Forbidden');
    return;
  }

  // If directory, try index.html
  let finalPath = filePath;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    finalPath = path.join(filePath, 'index.html');
  }

  // Serve file if it exists
  if (fs.existsSync(finalPath)) {
    const ext = path.extname(finalPath);
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.md': 'text/markdown',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.status(200).end(fs.readFileSync(finalPath));
  } else {
    res.status(404).end('Not Found');
  }
};
