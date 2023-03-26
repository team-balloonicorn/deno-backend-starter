import { assertEquals, assertStringIncludes } from "std/testing/asserts.ts";
import { handleRequest } from "src/web.tsx";
import { databaseTest, effects, newRequest } from "./helpers.ts";

databaseTest("other database connection", async (db) => {
  // We are using the correct database
  const name = await db.query("SELECT current_database() AS name");
  assertEquals(name, [{ name: "deno_starter_test" }]);

  assertEquals(
    await db.query("select 1 as it"),
    [{ it: 1 }],
  );
  assertEquals(
    await db.query("select 2 as it"),
    [{ it: 2 }],
  );
  assertEquals(
    await db.query("select 3 as it"),
    [{ it: 3 }],
  );
});

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
  assertStringIncludes(css, "box-sizing: border-box;");
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
