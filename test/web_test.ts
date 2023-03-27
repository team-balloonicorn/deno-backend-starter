import { assertEquals } from "std/testing/asserts.ts";
import { methodOverride } from "src/web.tsx";

Deno.test("GET not overriden", () => {
  const input = new Request("https://example.com/wibble?_method=DELETE", {
    method: "GET",
    headers: new Headers({ "content-type": "text/plain" }),
  });
  const output = methodOverride(input);
  assertEquals(output.method, "GET");
  assertEquals(Object.fromEntries(output.headers), {
    "content-type": "text/plain",
  });
});

Deno.test("POST overriden to DELETE", async () => {
  const input = new Request("https://example.com/wibble?_method=DELETE", {
    method: "POST",
    headers: new Headers({ "content-type": "text/plain" }),
    body: "Hello, Joe!",
  });
  const output = methodOverride(input);
  assertEquals(output.method, "DELETE");
  assertEquals(await output.text(), "Hello, Joe!");
  assertEquals(Object.fromEntries(output.headers), {
    "content-type": "text/plain",
  });
});

Deno.test("POST overriden to PATCH", async () => {
  const input = new Request("https://example.com/wibble?_method=PATCH", {
    method: "POST",
    headers: new Headers({ "content-type": "text/plain" }),
    body: "Hello, Joe!",
  });
  const output = methodOverride(input);
  assertEquals(output.method, "PATCH");
  assertEquals(await output.text(), "Hello, Joe!");
  assertEquals(Object.fromEntries(output.headers), {
    "content-type": "text/plain",
  });
});

Deno.test("POST overriden to PUT", async () => {
  const input = new Request("https://example.com/wibble?_method=PUT", {
    method: "POST",
    headers: new Headers({ "content-type": "text/plain" }),
    body: "Hello, Joe!",
  });
  const output = methodOverride(input);
  assertEquals(output.method, "PUT");
  assertEquals(await output.text(), "Hello, Joe!");
  assertEquals(Object.fromEntries(output.headers), {
    "content-type": "text/plain",
  });
});

Deno.test("POST not overriden to TRACE", async () => {
  const input = new Request("https://example.com/wibble?_method=TRACE", {
    method: "POST",
    headers: new Headers({ "content-type": "text/plain" }),
    body: "Hello, Joe!",
  });
  const output = methodOverride(input);
  assertEquals(output.method, "POST");
  assertEquals(await output.text(), "Hello, Joe!");
  assertEquals(Object.fromEntries(output.headers), {
    "content-type": "text/plain",
  });
});
