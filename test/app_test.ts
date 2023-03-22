import { assertEquals, assert } from "std/testing/asserts.ts";
import { handleRequest } from "src/web.ts";
import { newRequest, effects } from "./helpers.ts";

Deno.test("GET /", async () => {
  const request = newRequest("/");
  const response = await handleRequest(request, effects);
  assertEquals(response.status, 200);
});

Deno.test("GET /unknown", async () => {
  const request = newRequest("/unknown");
  const response = await handleRequest(request, effects);
  assertEquals(response.status, 404);
});

Deno.test("GET /static/styles.css", async () => {
  const request = newRequest("/static/styles.css");
  const response = await handleRequest(request, effects);
  assertEquals(response.status, 200);
  assertEquals(response.headers.get("content-type"), "text/css; charset=UTF-8");
  const css = await response.text();
  assert(css.includes("box-sizing: border-box;"));
});

Deno.test("GET /static/unknown", async () => {
  const request = newRequest("/static/unknown");
  const response = await handleRequest(request, effects);
  assertEquals(response.status, 404);
});

Deno.test("GET /static/../deno.json", async () => {
  const request = newRequest("/static/../deno.json");
  const response = await handleRequest(request, effects);
  assertEquals(response.status, 404);
});
