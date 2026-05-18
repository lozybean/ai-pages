import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const configuredBase = process.env.PAGES_BASE || "/ai-pages/";
const base = normalizeBase(configuredBase);

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"]
]);

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host}`);
  const pathname = decodeURIComponent(requestUrl.pathname);

  if (pathname === "/" && base !== "/") {
    response.writeHead(302, { Location: base });
    response.end();
    return;
  }

  if (base !== "/" && pathname === base.slice(0, -1)) {
    response.writeHead(302, { Location: `${base}${requestUrl.search}` });
    response.end();
    return;
  }

  if (!pathname.startsWith(base)) {
    sendNotFound(response);
    return;
  }

  const sitePath = pathname.slice(base.length) || "index.html";
  const file = await resolveFile(sitePath, pathname, requestUrl.search);

  if (!file) {
    sendNotFound(response);
    return;
  }

  if (file.redirectTo) {
    response.writeHead(302, { Location: file.redirectTo });
    response.end();
    return;
  }

  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": mimeTypes.get(extname(file.filePath)) || "application/octet-stream"
  });
  createReadStream(file.filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Preview server running at http://${host}:${port}${base}`);
  console.log(`Serving ${root}`);
});

function normalizeBase(value) {
  if (!value || value === "/") {
    return "/";
  }
  return `/${value.replace(/^\/+|\/+$/g, "")}/`;
}

async function resolveFile(sitePath, pathname, search) {
  const safePath = normalize(sitePath).replace(/^(\.\.[/\\])+/, "");
  let candidate = join(root, safePath);

  if (isOutsideRoot(candidate)) {
    return null;
  }

  try {
    const info = await stat(candidate);
    if (info.isDirectory()) {
      if (!pathname.endsWith("/")) {
        return { redirectTo: `${pathname}/${search}` };
      }
      candidate = join(candidate, "index.html");
    }
  } catch {
    return null;
  }

  try {
    const info = await stat(candidate);
    return info.isFile() ? { filePath: candidate } : null;
  } catch {
    return null;
  }
}

function isOutsideRoot(filePath) {
  const pathFromRoot = relative(root, filePath);
  return pathFromRoot.startsWith("..");
}

function sendNotFound(response) {
  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("404 Not Found\n");
}
