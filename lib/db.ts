import "server-only";
import { getPool } from "@/db/client";

export const db = () => getPool();
