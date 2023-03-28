import { allUsers, getUser, getUserByEmail, insertUser } from "src/user.ts";
import { databaseTest } from "./helpers.ts";
import { assertEquals, assertRejects } from "std/testing/asserts.ts";

databaseTest("user", async (db, t) => {
  const email1 = "one@example.com";
  const id1 = await insertUser(db, { name: "One", email: email1 });
  const id2 = await insertUser(db, { name: "Two", email: "two@example.com" });

  await t.step("allUsers", async () => {
    assertEquals(await allUsers(db), [
      { id: id1, name: "One", email: email1 },
      { id: id2, name: "Two", email: "two@example.com" },
    ]);
  });

  await t.step("email is required", async () => {
    await assertRejects(() => insertUser(db, { name: "Me", email: "" }));
  });

  await t.step("email must be valid", async () => {
    await assertRejects(() => insertUser(db, { name: "Me", email: "nope" }));
  });

  await t.step("email must be unique", async () => {
    await assertRejects(() => insertUser(db, { name: "Me", email: email1 }));
  });

  await t.step("user requires name", async () => {
    await assertRejects(() =>
      insertUser(db, { name: "", email: "three@example.com" })
    );
  });

  await t.step("getUser", async () => {
    assertEquals(await getUser(db, -1), undefined);
    assertEquals(await getUser(db, id1), {
      id: id1,
      name: "One",
      email: email1,
    });
  });

  await t.step("getUserByEmail", async () => {
    assertEquals(await getUserByEmail(db, "wibble"), undefined);
    assertEquals(await getUserByEmail(db, email1), {
      id: id1,
      name: "One",
      email: email1,
    });
  });
});
