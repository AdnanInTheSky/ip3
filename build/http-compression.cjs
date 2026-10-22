const fs = require('node:fs'), zlib = require('node:zlib');
function sendFile(req, res, filename, type, code = 200, gzip = true) {
  const compressible = /^(text\/|application\/(javascript|json|xml|manifest\+json)|image\/svg\+xml)/.test(type);
  const acceptsGzip = (req.headers['accept-encoding'] || '').split(',').some(value => {
    const [name, ...parameters] = value.trim().split(';');
    return name.toLowerCase() === 'gzip' && !parameters.some(p => /^\s*q\s*=\s*0(?:\.0*)?\s*$/.test(p));
  });
  res.setHeader('Content-Type', type);
  if (compressible && gzip) res.setHeader('Vary', 'Accept-Encoding');
  if (compressible && gzip && acceptsGzip) {
    res.setHeader('Content-Encoding', 'gzip'); res.writeHead(code);
    const input = fs.createReadStream(filename), output = zlib.createGzip({ level: 6 });
    input.on('error', () => res.destroy()); output.on('error', () => res.destroy());
    input.pipe(output).pipe(res);
  } else {
    res.setHeader('Content-Length', fs.statSync(filename).size); res.writeHead(code);
    const input = fs.createReadStream(filename); input.on('error', () => res.destroy()); input.pipe(res);
  }
}
module.exports = { sendFile };
