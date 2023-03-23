import { h, Node, renderToString } from "jsx";
import { serveDir } from "std/http/file_server.ts";
import { Status } from "std/http/http_status.ts";
import { info } from "src/log.ts";
import { JsonValue } from "std/json/mod.ts";

const routes: Array<[URLPattern, Handler]> = Object.entries({
  "/": home,
  "/static/*": staticFile,
  "/greet/:name": greet,
}).map(([pathname, f]) => [new URLPattern({ pathname }), f]);

export type Context = {
  request: Request;
  params: Params;
  effects: Effects;
};

export type Params = { [key: string]: string };

// export type Effects = {};
export type Effects = Record<string, never>;

export type Handler = (context: Context) => Promise<Response> | Response;

export async function handleRequest(
  request: Request,
  effects: Effects,
): Promise<Response> {
  const before = Date.now();
  const response = await router(request, effects);

  info({
    event: "responded",
    status: response.status,
    method: request.method,
    url: request.url,
    ms: Date.now() - before,
  });
  return response;
}

export async function router(
  request: Request,
  effects: Effects,
): Promise<Response> {
  const context: Context = { request, effects, params: {} };

  // Find a route that matches this request
  for (const [urlPattern, handler] of routes) {
    const params = urlPattern.exec(request.url)?.pathname.groups;
    if (params) {
      context.params = params;
      return await handler(context);
    }
  }

  // If no route matches, return a 404
  return notFound(context);
}

export async function html(
  status: Status,
  node: Node,
  headers: Headers = new Headers(),
): Promise<Response> {
  headers.set("content-type", "text/html; charset=utf-8");
  return new Response(await renderToString(node), { status, headers });
}

export function json(
  status: Status,
  json: JsonValue,
  headers: Headers = new Headers(),
): Response {
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(json), { status, headers });
}

function home(_context: Context) {
  return html(200, <div>Hello there!</div>);
}

function greet(context: Context) {
  return html(200, <div>Hello, {context.params.name}!</div>);
}

export function notFound(_context: Context) {
  return html(404, <div>There's nothing here...</div>);
}

function staticFile(context: Context) {
  // https://deno.land/std@0.180.0/http/file_server.ts?s=ServeDirOptions
  return serveDir(context.request, {
    fsRoot: "static",
    urlRoot: "static",
    quiet: true,
  });
}
