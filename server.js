const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.rar': 'application/x-rar-compressed',
  '.zip': 'application/zip',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2'
};

const root = __dirname;
const defaultPort = 3000;

function startServer(attemptPort) {
  const server = http.createServer((req, res) => {
    let safeUrl = req.url.split('?')[0].split('#')[0];
    if (safeUrl === '/') safeUrl = '/index.html';
    const filePath = path.join(root, decodeURIComponent(safeUrl.replace(/^\//, '')));

    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('404 Not Found');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      // Support Range requests (useful for 71MB mods.rar downloads)
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        });
        file.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': stats.size,
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
        fs.createReadStream(filePath).pipe(res);
      }
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      startServer(attemptPort + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(attemptPort, () => {
    const url = `http://localhost:${attemptPort}`;
    console.log(`Minecrafteri server running at: ${url}`);
  });
}

startServer(defaultPort);
