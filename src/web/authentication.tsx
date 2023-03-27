import { Fragment, h } from "jsx";
import { Context, html, methodDispatch } from "../web.tsx";
import { getCookies, setCookie } from "std/http/cookie.ts";

const USER_ID_COOKIE_NAME = "app-id";

export function login(
  context: Context,
): Promise<Response> {
  return methodDispatch(context, {
    GET: loginForm,
    POST: loginFormSubmitted,
  });
}

function loginForm(
  context: Context,
): Promise<Response> {
  // TODO: redirect away if already logged in
  const content = (
    <>
      <h1>Login</h1>
      user id: {getUserIdFromCookie(context)}
      <form method="post">
        <label htmlFor="email">
          Email
          <input type="email" name="email" id="email" />
        </label>
        <input type="submit" value="Login" />
      </form>
    </>
  );
  return html(200, content);
}

function loginFormSubmitted(
  context: Context,
): Promise<Response> {
  // TODO: Actually do auth rather than just setting the cookie
  const content = <h1>Login</h1>;
  const headers = setUserIdCookie(123);
  return html(200, content, headers);
}

class InvalidUserIdCookieError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUserIdCookieError";
  }
}

// Get the user id from the session cookie, if it exists.
// If the signed cookie is set but is invalid (e.g. it's been tampered with),
// then an error is returned.
function getUserIdFromCookie(
  context: Context,
): string | undefined | InvalidUserIdCookieError {
  const cookie = getCookies(context.request.headers)[USER_ID_COOKIE_NAME];
  if (!cookie) return undefined;
  // TODO: verify cookie signature
  return cookie;
}

// TODO: sign session cookie
function setUserIdCookie(
  userId: number,
  headers: Headers = new Headers(),
): Headers {
  const oneYearInSeconds = 365 * 24 * 60 * 60;
  setCookie(headers, {
    name: USER_ID_COOKIE_NAME,
    value: userId.toString(),
    maxAge: oneYearInSeconds,
    secure: true,
    httpOnly: true,
    sameSite: "Lax",
  });
  return headers;
}
