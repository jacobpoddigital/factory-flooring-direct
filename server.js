#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const { watch } = require('fs');

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

// Simple static file server with live reload
const server = http.createServer((req, res) => {
  // Strip query string from URL
  const urlWithoutQuery = req.url.split('?')[0];
  let filePath = path.join(ROOT, urlWithoutQuery === '/' ? 'index.html' : urlWithoutQuery);

  // Security: prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // If directory, try index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Serve file if it exists
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
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
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n✅ Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving from: ${ROOT}\n`);
  console.log('🔄 Watching for changes...\n');
});

// Watch for file changes and log them
watch(ROOT, { recursive: true, persistent: true }, (eventType, filename) => {
  // Ignore node_modules, .git, and hidden files
  if (filename && !filename.includes('node_modules') && !filename.includes('.git') && !filename.startsWith('.')) {
    console.log(`📝 ${eventType}: ${filename}`);
  }
});
