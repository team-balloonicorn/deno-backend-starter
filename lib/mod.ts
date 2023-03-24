import { JsonValue } from "std/json/mod.ts";

export type { JsonValue } from "std/json/mod.ts";

// A wrapper around JSON.parse that returns the correct type of JsonValue rather
// than the unsafe any type.
export function parseJson(json: string): JsonValue {
  return JSON.parse(json);
}

// A wrapper around JSON.stringify that takes the correct type of JsonValue
// rather than the unsafe any type.
export function stringifyJson(json: JsonValue): string {
  return JSON.stringify(json);
}

// A function that can be used to enforce exhaustive checking.
export function assertNever(x: never): never {
  throw new Error(`Impossible value: ${x}`);
}
