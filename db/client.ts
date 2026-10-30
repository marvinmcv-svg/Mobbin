import { Pool } from "pg";

declare global {
  var __specimenPool: Pool | undefined;
}

export function getPool(connectionString = process.env.DATABASE_URL): Pool {
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  // Reuse one pool across hot reloads in dev.
  if (!globalThis.__specimenPool)
    globalThis.__specimenPool = new Pool({ connectionString, max: 10 });
  return globalThis.__specimenPool;
}
