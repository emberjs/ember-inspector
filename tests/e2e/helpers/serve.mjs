import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';

const TYPES = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
};

/**
 * Serves a built directory.
 * Paths without a file fall back to `index.html`, like an app host does.
 */
export async function serve(dir) {
  let server = createServer((request, response) => {
    let path = join(dir, decodeURIComponent(new URL(request.url, 'http://x').pathname));

    if (!existsSync(path) || statSync(path).isDirectory()) {
      path = extname(path) ? null : join(dir, 'index.html');
    }

    if (!path) {
      response.statusCode = 404;
      response.end();
      return;
    }

    response.setHeader('Content-Type', TYPES[extname(path)] ?? 'text/plain');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.end(readFileSync(path));
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  return {
    url: `http://127.0.0.1:${server.address().port}/`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
