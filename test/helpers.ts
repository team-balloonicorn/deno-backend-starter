import { Effects } from "src/web.tsx";

export const effects: Effects = Object.seal({});

export function newRequest(path: string, method = "GET"): Request {
  return new Request(`http://localhost${path}`, { method });
}
