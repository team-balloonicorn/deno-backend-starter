import { databaseTest } from "./helpers.ts";
import { assertEquals } from "std/testing/asserts.ts";

databaseTest("Database", async (db, t) => {
  await t.step("correct database used", async () => {
    const name = await db.query("SELECT current_database() AS name");
    assertEquals(name, [{ name: "deno_starter_test" }]);
  });

  await t.step("query", async () => {
    assertEquals(await db.query("select 1 as it"), [{ it: 1 }]);
  });

  await t.step("queryOne", async () => {
    assertEquals(await db.queryOne("select 1 as it"), { it: 1 });
    assertEquals(await db.queryOne("select 1 as it where false"), undefined);
  });
});
