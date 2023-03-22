import { serve } from "std/http/server.ts";
import { handleRequest } from "src/web.tsx";

const port = 8000;
const effects = {};
const app = (request: Request) => handleRequest(request, effects);

await serve(app, { port });
