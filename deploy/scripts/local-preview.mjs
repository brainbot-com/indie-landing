import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..');
const host = '127.0.0.1';
const port = Number.parseInt(process.env.PREVIEW_PORT || '3000', 10);
const apiOrigin = process.env.API_ORIGIN || 'http://127.0.0.1:8080';

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8']
]);

function normalizePathname(rawPathname) {
  if (!rawPathname || rawPathname === '/') return '/index.html';
  if (rawPathname.endsWith('/')) return `${rawPathname}index.html`;
  return rawPathname;
}

function resolveFilePath(rawPathname) {
  const pathname = normalizePathname(rawPathname);
  const normalized = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
  return path.join(projectRoot, normalized);
}

function setCorslessHeaders(res, headers) {
  for (const [key, value] of headers.entries()) {
    if (['connection', 'content-encoding', 'content-length', 'keep-alive', 'transfer-encoding'].includes(key.toLowerCase())) {
      continue;
    }

    res.setHeader(key, value);
  }
}

async function proxyApi(req, res) {
  const targetUrl = new URL(req.url, apiOrigin);
  const bodyAllowed = !['GET', 'HEAD'].includes(req.method || 'GET');
  const body = bodyAllowed ? req : undefined;

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: req.headers,
    body,
    duplex: bodyAllowed ? 'half' : undefined,
    redirect: 'manual'
  });

  res.statusCode = upstream.status;
  setCorslessHeaders(res, upstream.headers);

  if (!upstream.body) {
    res.end();
    return;
  }

  Readable.fromWeb(upstream.body).pipe(res);
}

async function serveFile(req, res) {
  const filePath = resolveFilePath(new URL(req.url, `http://${req.headers.host}`).pathname);

  if (!filePath.startsWith(projectRoot)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      throw new Error('not a file');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = contentTypes.get(ext) || 'application/octet-stream';
    const content = await fs.readFile(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': content.length
    });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if ((req.url || '').startsWith('/api/')) {
      await proxyApi(req, res);
      return;
    }

    await serveFile(req, res);
  } catch (error) {
    res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Preview proxy error: ${error.message}`);
  }
});

server.listen(port, host, () => {
  console.log(`preview server listening on http://${host}:${port}`);
});
