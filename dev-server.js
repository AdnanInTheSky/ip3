// Zero-dependency static server with Vercel-style clean URLs, for local preview: npm run dev
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };
const root = __dirname;
function resolve(p) {
  p = decodeURIComponent(p.split('?')[0]);
  const cands = [p, p + '.html', path.join(p, 'index.html')];
  for (const c of cands) { const f = path.join(root, c); if (f.startsWith(root) && fs.existsSync(f) && fs.statSync(f).isFile()) return f; }
  return null;
}
http.createServer((req, res) => {
  const f = resolve(req.url === '/' ? '/index.html' : req.url);
  const send = (file, code) => {
    const stat = fs.statSync(file), type = TYPES[path.extname(file)] || 'application/octet-stream';
    const range = req.headers.range;
    if (range && type === 'video/mp4') {
      const [a, b] = range.replace('bytes=', '').split('-'); const start = +a, end = b ? +b : stat.size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
    res.writeHead(code, { 'Content-Type': type, 'Content-Length': stat.size, 'Accept-Ranges': 'bytes' });
    fs.createReadStream(file).pipe(res);
  };
  if (f) return send(f, 200);
  send(path.join(root, '404.html'), 404);
}).listen(PORT, () => console.log(`IP3 site → http://localhost:${PORT}`));
