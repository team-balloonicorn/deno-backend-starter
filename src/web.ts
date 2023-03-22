import { serveDir } from "std/http/file_server.ts";

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
  effects: Effects
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

function home(_context: Context): Response {
  return new Response("Hello there! Good to see you!", { status: 200 });
}

function greet(context: Context): Response {
  return new Response(`Hello, ${context.params.name}!`, { status: 404 });
}

export function notFound(_context: Context): Response {
  return new Response("There's nothing here...", { status: 404 });
}

function staticFile(context: Context): Promise<Response> {
  // https://deno.land/std@0.180.0/http/file_server.ts?s=ServeDirOptions
  return serveDir(context.request, {
    fsRoot: "static",
    urlRoot: "static",
    quiet: true,
  });
}
