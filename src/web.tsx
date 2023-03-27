import { h, Node, renderToString } from "jsx";
import { serveDir } from "std/http/file_server.ts";
import { Status } from "std/http/http_status.ts";
import { logInfo } from "src/log.ts";
import { JsonValue } from "std/json/mod.ts";
import { login, withUserFromSession } from "src/web/authentication.tsx";

const routes: Array<[URLPattern, Handler]> = Object.entries({
  "/": home,
  "/static/*": staticFile,
  "/login": login,
  "/greet/:name": greet,
}).map(([pathname, f]) => [new URLPattern({ pathname }), f]);

export type Context = {
  currentUser: number | undefined;
  request: Request;
  params: Params;
  effects: Effects;
};

export type Params = { [key: string]: string };

// export type Effects = {};
export type Effects = Record<string, never>;

export type Handler = (context: Context) => Promise<Response>;

export async function handleRequest(
  request: Request,
  effects: Effects,
): Promise<Response> {
  const before = Date.now();
  const context: Context = {
    request,
    effects,
    currentUser: undefined,
    params: {},
  };
  const response = await withUserFromSession(context, router);

  logInfo({
    event: "responded",
    status: response.status,
    method: request.method,
    url: request.url,
    ms: Date.now() - before,
  });
  return response;
}

export async function router(
  context: Context,
): Promise<Response> {
  // Find a route that matches this request
  for (const [urlPattern, handler] of routes) {
    const params = urlPattern.exec(context.request.url)?.pathname.groups;
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

export type MethodHandlers = {
  GET?: Handler;
  POST?: Handler;
  PUT?: Handler;
  DELETE?: Handler;
  PATCH?: Handler;
};

// Dispatch to a handler based on the HTTP method, returning a 405 if there is
// no handler for the method.
export function methodDispatch(
  context: Context,
  handlers: Record<string, Handler>,
) {
  const handler = handlers[context.request.method];
  if (handler) {
    return handler(context);
  }
  const content = (
    <div>
      There's nothing here... Expected HTTP methods are:
      {" " + Object.keys(handlers).join(", ")}
    </div>
  );
  return html(405, content);
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

// Web browsers only support GET and POST, but we want to use PUT, PATCH, and
// DELETE too.
//
// This function will override the request method of POST requests with a method
// taken from the _method parameter, if it is set.
//
// GET requests are not overridden, for security reasons.
//
export function methodOverride(request: Request): Request {
  if (request.method === "POST") {
    const method = new URL(request.url).searchParams.get("_method");
    if (method && ["PUT", "PATCH", "DELETE"].includes(method)) {
      return new Request(request, { method: method });
    }
  }
  return request;
}
