import { Database } from "src/database.ts";

export type User = {
  id: number;
  name: string;
  email: string;
};

export async function insertUser(
  db: Database,
  data: { name: string; email: string },
): Promise<number> {
  const sql = `
    insert into users (name, email)
    values ($name, $email)
    returning id
  `;
  const row = await db.queryOne<{ id: number }>(sql, data);
  return row?.id || 0;
}

export async function allUsers(db: Database): Promise<Array<User>> {
  return await db.query<User>(`
    select id, name, email
    from users
    order by id
  `);
}

export async function getUser(
  db: Database,
  id: number,
): Promise<User | undefined> {
  const sql = `
    select id, name, email
    from users
    where id = $id
  `;
  return await db.queryOne<User>(sql, { id });
}

export async function getUserByEmail(
  db: Database,
  email: string,
): Promise<User | undefined> {
  const sql = `
    select id, name, email
    from users
    where email = $email
  `;
  return await db.queryOne<User>(sql, { email });
}
