import { Effects } from "src/web.tsx";
import { Database } from "src/database.ts";

export const effects: Effects = Object.seal({});

export function databaseTest<T>(
  name: string,
  test: (db: Database, t: Deno.TestContext) => Promise<T>,
) {
  Deno.test(name, async (t) => {
    const size = 1;
    const db = new Database({
      hostname: "localhost",
      user: "postgres",
      password: "postgres",
      database: "deno_starter_test",
    }, size);

    try {
      await truncateDatabaseTables(db);
      await test(db, t);
    } finally {
      await db.disconnect();
    }
  });
}

export async function truncateDatabaseTables(db: Database): Promise<void> {
  await db.query(
    `
DO
$do$
BEGIN
  EXECUTE
   (SELECT 'TRUNCATE TABLE ' || string_agg(oid::regclass::text, ', ') || ' CASCADE'
    FROM   pg_class
    WHERE  relkind = 'r'  -- only tables
    AND    relnamespace = 'public'::regnamespace
   );
END
$do$;
`,
  );
}

export function newRequest(path: string, method = "GET"): Request {
  return new Request(`http://localhost${path}`, { method });
}
