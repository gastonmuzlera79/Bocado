// Servidor estático mínimo para probar la web sin dependencias.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize as pathNormalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

// Solo se sirven web/ y lo necesario de src/.
const allowed = ['/web/', '/src/core/', '/src/data/'];

const server = createServer(async (req, res) => {
  let url = new URL(req.url, 'http://localhost').pathname;
  if (url === '/') {
    res.writeHead(302, { Location: '/web/' }).end();
    return;
  }
  if (url.endsWith('/')) url += 'index.html';
  const clean = pathNormalize(url);
  if (!allowed.some((p) => clean.startsWith(p))) {
    res.writeHead(404).end('No encontrado');
    return;
  }
  try {
    const body = await readFile(join(root, clean));
    res.writeHead(200, { 'Content-Type': types[extname(clean)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('No encontrado');
  }
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => console.log(`Bocado en http://localhost:${port}`));
