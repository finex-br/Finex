const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5500;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
};

const server = http.createServer((req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    let filePath = '.' + req.url;
    
    // Remove query string
    const urlParts = filePath.split('?');
    filePath = urlParts[0];
    
    if (filePath === './' || filePath === '.') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Frontend server running at http://localhost:${PORT}`);
    console.log(`📄 Open http://localhost:${PORT}/index.html in your browser`);
    console.log(`\n⚠️  Important: Update your Google OAuth redirect URI to:`);
    console.log(`   ${process.env.BACKEND_URL || 'http://localhost:3000'}/auth/oauth/google/callback`);
});
