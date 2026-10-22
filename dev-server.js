// Static server with Vercel-style clean URLs, for local preview: npm run dev
const http = require('http'), fs = require('fs'), path = require('path');
const { sendFile } = require('./build/http-compression.cjs');
const PORT = process.env.PORT || 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm', '.xml': 'application/xml', '.txt': 'text/plain', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };
const root = path.join(__dirname, 'dist');
function resolve(p) {
  p = decodeURIComponent(p.split('?')[0]);
  const cands = [p, p + '.html', path.join(p, 'index.html')];
  for (const c of cands) {
    const f = path.resolve(root, `.${path.sep}${c}`);
    const rel = path.relative(root, f);
    if (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel) && fs.existsSync(f) && fs.statSync(f).isFile()) return f;
  }
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
    if (type === 'video/mp4') res.setHeader('Accept-Ranges', 'bytes');
    sendFile(req, res, file, type, code);
  };
  if (f) return send(f, 200);
  send(path.join(root, '404.html'), 404);
}).listen(PORT, () => console.log(`IP3 site → http://localhost:${PORT}`));
