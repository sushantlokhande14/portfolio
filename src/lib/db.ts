import { neon } from '@neondatabase/serverless';
import { env } from './env';

// Neon's HTTP driver rather than a TCP pool: serverless functions are short
// lived and can spin up hundreds of concurrent instances, which exhausts a
// classic Postgres connection pool almost immediately. HTTP has no pool to
// exhaust.
let _sql: ReturnType<typeof neon> | null = null;

export function sql() {
  if (_sql) return _sql;
  const url = env('DATABASE_URL');
  if (!url) throw new Error('DATABASE_URL is not set');
  _sql = neon(url);
  return _sql;
}

export function hasDatabase() {
  return Boolean(env('DATABASE_URL'));
}

// Schema lives in code and is applied on demand rather than through a
// migration tool. One table, created once, and the whole thing stays a single
// deploy with no separate migration step.
let ready: Promise<void> | null = null;

export function ensureSchema() {
  if (ready) return ready;
  const q = sql();
  ready = (async () => {
    await q`
      CREATE TABLE IF NOT EXISTS events (
        id          BIGSERIAL PRIMARY KEY,
        ts          TIMESTAMPTZ  NOT NULL DEFAULT now(),
        path        TEXT         NOT NULL,
        referrer    TEXT,
        country     TEXT,
        device      TEXT,
        browser     TEXT,
        -- A daily-rotating hash, never a raw IP. See lib/identity.ts.
        visitor     TEXT         NOT NULL
      )
    `;
    // Time range is in every query; path and visitor carry the group-bys.
    await q`CREATE INDEX IF NOT EXISTS events_ts_idx ON events (ts DESC)`;
    await q`CREATE INDEX IF NOT EXISTS events_path_idx ON events (path)`;
    await q`CREATE INDEX IF NOT EXISTS events_visitor_idx ON events (visitor)`;
  })().catch((err) => {
    // Let the next request retry instead of caching a failed bootstrap.
    ready = null;
    throw err;
  });
  return ready;
}
