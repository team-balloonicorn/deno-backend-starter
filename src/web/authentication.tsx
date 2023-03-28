import { Context, html, methodDispatch, redirect } from "../web.tsx";
import { getCookies, setCookie } from "std/http/cookie.ts";
import { Fragment, h, logInfo, logWarning } from "src/common.ts";
import { getUser, getUserByEmail } from "src/user.ts";

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
  console.log("login", context.request.method);
  return methodDispatch(context, {
    GET: showLoginForm,
    POST: handleLoginFormSubmission,
    DELETE: logout,
  });
}

// TODO: test
function showLoginForm(
  context: Context,
): Promise<Response> {
  // TODO: redirect away if already logged in
  const content = (
    <>
      <h1>Login</h1>
      user: {context.currentUser?.name}
      <form method="post">
        <label htmlFor="email">
          Email
          <input type="email" name="email" id="email" />
        </label>
        <input type="submit" value="Login" />
      </form>
      <form method="post" action="?_method=DELETE">
        <input type="submit" value="Logout" />
      </form>
    </>
  );
  return html(200, content);
}

// TODO: test
async function handleLoginFormSubmission(context: Context): Promise<Response> {
  const formData = await context.request.formData();
  const email = formData.get("email")?.toString() || "";
  const user = await getUserByEmail(context.db(), email);

  if (!user) {
    // TODO: re-render form
    return html(200, <h1>No account found for that email, sorry</h1>);
  }

  logInfo({ event: "user_logged_in", id: user.id });
  const content = <h1>Login</h1>;
  const headers = setUserIdCookie(user.id);
  return html(200, content, headers);
}

// TODO: test
async function logout(context: Context): Promise<Response> {
  return await redirect("/login", deleteUserIdCookie());
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
  const responseToInvalidCookie = async () => {
    const response = await next(context);
    deleteUserIdCookie(response.headers);
    return response;
  };

  const id = getUserIdFromCookie(context);

  // If the user id cookie is invalid then we handle the request as if it was
  // not set, and delete the cookie with the response.
  if (id instanceof InvalidUserIdCookieError) {
    logWarning("user_id_cookie_invalid");
    return responseToInvalidCookie();
  }

  // No cookie, continue without authentication.
  if (id === undefined) {
    return next(context);
  }

  const user = await getUser(context.db(), id);

  // The cookie was valid but no user was found for the id.
  if (!user) {
    logWarning({ event: "user_not_found_for_cookie", id });
    return responseToInvalidCookie();
  }

  context.currentUser = user;
  return next(context);
}

// Get the user id from the session cookie, if it exists.
// If the signed cookie is set but is invalid (e.g. it's been tampered with),
// then an error is returned.
function getUserIdFromCookie(
  context: Context,
): number | undefined | InvalidUserIdCookieError {
  const cookie = getCookies(context.request.headers)[USER_ID_COOKIE_NAME];
  if (!cookie) return undefined;
  // TODO: verify cookie signature
  return parseInt(cookie) || undefined;
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
