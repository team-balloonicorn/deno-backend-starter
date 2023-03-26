import { ClientOptions, Pool } from "postgres";
import { QueryArguments } from "postgres/query/query.ts";

// A wrapper around the PostgreSQL client library we are using to provide a less
// error prone API to checking out and in connections.
//
// It does not yet support transactions.
//
export class Database {
  private pool: Pool;

  constructor(options: ClientOptions, size: number) {
    this.pool = new Pool(options, size);
  }

  // Execute a query.
  //
  // Currently it performs an unsafe cast to T, in future we could require the
  // programmer verifies the type at runtime.
  //
  // TODO: refine the return type to include errors for things like constraint
  // violations. Network issues can remain exceptions.
  async query<T>(
    sql: string,
    args: QueryArguments | undefined = undefined,
  ): Promise<Array<T>> {
    const conn = await this.pool.connect();
    try {
      const result = await conn.queryObject<T>(sql, args);
      return result.rows;
    } finally {
      await conn.release();
    }
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }
}
