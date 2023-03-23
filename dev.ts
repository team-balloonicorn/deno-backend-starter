#!/usr/bin/env -S deno run -A --watch=static/,routes/

import { load } from "std/dotenv/mod.ts";

// Load development secrets into environment variables
await load({
  envPath: "./secrets.env",
  examplePath: "./secrets-example.env",
  export: true,
});

if (import.meta.main) {
  await import("./src/main.ts");
}
