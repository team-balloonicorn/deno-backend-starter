import { Fragment, h } from "jsx";
import { Context, html, methodDispatch } from "../web.tsx";
import { getCookies, setCookie } from "std/http/cookie.ts";
import { logWarning } from "../log.ts";

const USER_ID_COOKIE_NAME = "app-id";

const USER_COOKIE_BASE = Object.freeze({
  name: USER_ID_COOKIE_NAME,
  value: "",
  maxAge: 365 * 24 * 60 * 60,
  secure: true,
  httpOnly: true,
  sameSite: "Lax",
});

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
      user id: {context.currentUser}
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

export async function withUserFromSession(
  context: Context,
  next: (context: Context) => Promise<Response>,
): Promise<Response> {
  // TODO: get user
  const id = getUserIdFromCookie(context);

  // If the user id cookie is invalid then we handle the request as if it was
  // not set, and delete the cookie with the response.
  if (id instanceof InvalidUserIdCookieError) {
    logWarning("user_id_cookie_invalid");
    const response = await next(context);
    deleteUserIdCookie(response.headers);
    return response;
  }

  context.currentUser = parseInt(id || "") || undefined;
  return next(context);
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

function deleteUserIdCookie(
  headers: Headers = new Headers(),
): Headers {
  setCookie(headers, {
    ...USER_COOKIE_BASE,
    value: "",
    maxAge: 0,
  });
  return headers;
}

// TODO: sign session cookie
function setUserIdCookie(
  userId: number,
  headers: Headers = new Headers(),
): Headers {
  setCookie(headers, {
    ...USER_COOKIE_BASE,
    value: userId.toString(),
  });
  return headers;
}
