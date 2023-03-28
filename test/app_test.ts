import { assertEquals, assertStringIncludes } from "std/testing/asserts.ts";
import { handleRequest } from "src/web.tsx";
import { requestContext } from "./helpers.ts";

Deno.test("GET /", async () => {
  const context = requestContext("/");
  const response = await handleRequest(context);
  assertEquals(response.status, 200);
});

Deno.test("GET /unknown", async () => {
  const context = requestContext("/unknown");
  const response = await handleRequest(context);
  assertEquals(response.status, 404);
});

Deno.test("GET /static/styles.css", async () => {
  const context = requestContext("/static/styles.css");
  const response = await handleRequest(context);
  assertEquals(response.status, 200);
  assertEquals(response.headers.get("content-type"), "text/css; charset=UTF-8");
  const css = await response.text();
  assertStringIncludes(css, "box-sizing: border-box;");
});

Deno.test("GET /static/unknown", async () => {
  const context = requestContext("/static/unknown");
  const response = await handleRequest(context);
  assertEquals(response.status, 404);
});

Deno.test("GET /static/../deno.json", async () => {
  const context = requestContext("/static/../deno.json");
  const response = await handleRequest(context);
  assertEquals(response.status, 404);
});
