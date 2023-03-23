# Deno Backend Starter

A starter project for building a backend with Deno. It features:

- Routing of HTTP requests.
- Testing of HTTP functionality.
- Reloading in development.
- Serving of static files.
- Rendering of JSX HTML templates.
- A logger and logging of HTTP requests.
- Dependency injection of effects to help with testing.
- Loading of development secrets from a git-ignored `secrets.env` file.

## Table of contents

- [Quick reference](#quick-reference)
- [Code principles](#code-principles)
- [Development setup](#development-setup)
- [Dependencies](#dependencies)
- [Deployment](#deployment)
- [Environment variables](#environment-variables)

## Quick reference

```sh
deno task start
deno task test
deno task repl
```


## Code principles

### Use types and tests to verify correctness.

We want the system to be reliable, both for our users and for ourselves as
operators. We also want to have an easy time making modifications to the code in
future. To help with this, all code must be verified with precise types that
make invalid states impossible, and all business logic must be covered by tests.

### Keep exceptions exceptional.

Exceptions are to be used only when an unrecoverable error has occured, e.g.
when a network error makes the database unreachable. In all other cases, the
function should return a result that indicates the error, as is common in Rust,
C, Go, and any functional languages.

Exceptions must never be used for flow control under any circumstances.

The motivation for this rule is that exceptions are implicit and is it
impossible for the reader to know if a function can throw an exception, and it
is impossible for the compiler to check that all exceptions are handled. This
makes mistakes easy, and understanding difficult.

### Clear is better than concise. Simple is better than clever.

Maintainability and readability is a priority. We can tolerate more verbose and
repetitive code if it makes the code easier to understand. The preferred type of
abstraction is to extract simple functions that take arguments and return
values, and do one task. Avoid more complex abstractions until there is clearly
a large and ongoing maintenance burden from the existing code.

### Dependencies are not free.

Dependencies such as libraries, frameworks, and third party services may solve a
business problem, but in exchange they always introduce the problem of managing
this dependency. An API we have full control over is much easier to maintain
than an API we have to negotiate with a third party.

A good dependency is one that is actively maintained, does precisely one task,
and if it is a code dependency, we should perform a light audit of the code
prior to using it. Dependencies should be of the same code quality we expect for
our own code.

The best dependency is no dependency. Consider inlining code instead.


## Development setup

You will need the following installed:

- [Deno](https://deno.land/)

Copy `./secrets-example.env` to `./secrets.env` and fill in the values as
directed by the comments.


## Dependencies

- [The Deno standard libary](https://deno.land/std). (MIT)
- [JSX](https://deno.land/x/jsx@v0.1.5), a micro templating library.
  (MIT)

## Deployment

TODO


## Environment variables

The application is configured using environment variables, and in development
these will be loaded from `./secrets.env`. The `./secrets-example.env` can
be used as a base when creating this file.

- `SIGNING_SECRET`: A secret used to sign sessions.
- `ZEPTOMAIL_API_KEY`: API key from https://zeptomail.zoho.com/.
- `EMAIL_FROM_NAME`: Name to use in the "from" field of sent emails.
- `EMAIL_FROM_ADDRESS`: Email address to use in the "from" field of sent emails.
  Must be a verified address in Zeptomail.
