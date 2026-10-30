import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

export async function migrate(pool: Pool): Promise<string[]> {
  await pool.query(
    "create table if not exists schema_migrations (name text primary key, applied_at timestamptz default now())",
  );
  const dir = path.join(__dirname, "migrations");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  const { rows } = await pool.query<{ name: string }>("select name from schema_migrations");
  const done = new Set(rows.map((r) => r.name));
  const applied: string[] = [];
  for (const file of files) {
    if (done.has(file)) continue;
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(fs.readFileSync(path.join(dir, file), "utf8"));
      await client.query("insert into schema_migrations (name) values ($1)", [file]);
      await client.query("commit");
      applied.push(file);
    } catch (err) {
      await client.query("rollback");
      throw err;
    } finally {
      client.release();
    }
  }
  return applied;
}

if (require.main === module) {
  process.loadEnvFile?.(".env");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  migrate(pool)
    .then((applied) =>
      console.log(applied.length ? `applied: ${applied.join(", ")}` : "up to date"),
    )
    .finally(() => pool.end());
}
