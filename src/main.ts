import { serve } from "std/http/server.ts";
import { handleRequest } from "src/web.tsx";
import { Context, Database } from "./common.ts";

const port = 8000;
const effects = {};

// TODO: Take database credentials as configuration.
const poolSize = 10;
const database = new Database({
  hostname: "localhost",
  database: "deno_starter",
  user: "postgres",
  password: "postgres",
}, poolSize);

function app(request: Request) {
  const context: Context = {
    db: () => database,
    request,
    effects,
    currentUser: undefined,
    params: {},
  };
  return handleRequest(context);
}

await serve(app, { port });
