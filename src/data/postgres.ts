import "server-only";
import { neon } from "@neondatabase/serverless";
import { createSeedData } from "./seed";
import type { AppData } from "@/domain/types";

export async function readPostgresData(databaseUrl: string): Promise<AppData> {
  const sql = neon(databaseUrl);
  await sql`CREATE TABLE IF NOT EXISTS havelska_state (id INTEGER PRIMARY KEY, payload JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  const rows = await sql`SELECT payload FROM havelska_state WHERE id = 1`;
  if (rows.length) return rows[0].payload as AppData;
  const seed = createSeedData();
  await sql`INSERT INTO havelska_state (id, payload) VALUES (1, ${JSON.stringify(seed)}::jsonb) ON CONFLICT (id) DO NOTHING`;
  return seed;
}
export async function writePostgresData(databaseUrl: string, data: AppData) {
  const sql = neon(databaseUrl); const payload = JSON.stringify({ ...data, updatedAt: new Date().toISOString() });
  await sql`INSERT INTO havelska_state (id, payload, updated_at) VALUES (1, ${payload}::jsonb, NOW()) ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`;
}
