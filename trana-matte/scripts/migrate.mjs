import { readFile } from 'node:fs/promises';
import pg from 'pg';
const client = new pg.Client({ connectionString: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL });
await client.connect();
try {
  await client.query(await readFile(new URL('../migrations/001-practice.sql', import.meta.url), 'utf8'));
  await client.query(await readFile(new URL('../migrations/002-addition.sql', import.meta.url), 'utf8'));
  console.log('Schema ready: matte_players, matte_practice_runs');
} finally { await client.end(); }
