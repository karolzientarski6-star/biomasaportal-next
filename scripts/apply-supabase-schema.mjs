import { readFile } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import pg from "pg";

const { loadEnvConfig } = nextEnv;
const { Client } = pg;
const rootDir = process.cwd();
loadEnvConfig(rootDir);

const schemaPath = path.join(rootDir, "supabase", "schema.sql");

function getConnectionString() {
  if (process.env.SUPABASE_DB_URL) {
    return process.env.SUPABASE_DB_URL;
  }

  return "postgresql://postgres:l3U73V0B1!!!@db.dbytcmbvsugunwndamne.supabase.co:5432/postgres";
}

async function main() {
  const sql = await readFile(schemaPath, "utf8");
  const client = new Client({
    connectionString: getConnectionString(),
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();
  await client.query(sql);
  await client.end();
  console.log("Supabase schema applied.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
