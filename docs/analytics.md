# Analytics

A self-hosted, cookieless analytics stack built into this site. Collection, storage, and a private dashboard, no third party in the path.

**Dashboard:** `/dashboard` (password protected, `noindex`)

## Setup

Three env vars and a Postgres database. Nothing runs until they exist, and nothing breaks if they don't.

### 1. Create a database

Any Postgres works, but the driver is Neon's HTTP client, so a **Neon** database is the path of least resistance and the free tier is plenty for a portfolio.

- Vercel dashboard → **Storage** → **Create Database** → **Neon**, or sign up at [neon.tech](https://neon.tech) directly
- Copy the connection string (it looks like `postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require`)

If you connect it through the Vercel Storage tab, `DATABASE_URL` is set for you and you can skip it below.

### 2. Set environment variables

Vercel → project → **Settings** → **Environment Variables**:

| Variable | What it is |
| :-- | :-- |
| `DATABASE_URL` | the Neon connection string |
| `ANALYTICS_PASSWORD` | the password for `/dashboard`. Pick something long |
| `ANALYTICS_SALT` | random string used when hashing visitors. Never share or rotate casually, see below |
| `ANALYTICS_SECRET` | optional, signs session cookies. Falls back to the password if unset |

Generate the random ones:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Redeploy

Environment variables only apply to new builds, so trigger a redeploy after saving them. The `events` table creates itself on the first page view.

### 4. Keep yourself out of the numbers

In your browser console on the live site:

```js
localStorage.setItem('sl-no-track', '1')
```

## How it works

```
visitor → Beacon.astro (inline, sendBeacon)
             ↓  POST /api/collect
        bot filter → parse UA → hash visitor → INSERT
             ↓
          Postgres (events)
             ↓  aggregate on read
   /dashboard (password → signed cookie)
```

| File | Role |
| :-- | :-- |
| `src/components/Beacon.astro` | inline client beacon |
| `src/pages/api/collect.ts` | ingest endpoint |
| `src/lib/agent.ts` | bot filtering, UA parsing, referrer and path cleaning |
| `src/lib/identity.ts` | the daily visitor hash |
| `src/lib/db.ts` | connection and schema |
| `src/lib/stats.ts` | aggregation queries |
| `src/lib/auth.ts` | password check and signed session tokens |
| `src/pages/dashboard.astro` | the dashboard |

## Privacy

The design constraint was to answer "how is the site doing" without building a surveillance tool.

- **No cookies for visitors.** The only cookie is the session for the dashboard, which is for the author, not the audience.
- **No raw IPs stored.** An IP is read from the request, mixed into a hash, and discarded.
- **The identifier rotates daily.** A visitor is `sha256(salt + ip + user agent + date)`. Tomorrow the same person hashes to something completely different, so nothing follows anyone across days.
- **Referrer host only,** never the full URL, which can carry search terms.
- **Query strings stripped** from paths.
- **Do Not Track respected.**

The honest cost: **returning visitors are invisible.** Someone who visits on three days counts as three visitors. "Visitors" here means daily reach, not distinct humans. That number is being reported as what it is rather than dressed up as something stronger.

Because the raw IP is never stored, changing `ANALYTICS_SALT` permanently disconnects old rows from new ones. Set it once and leave it.

## Notes

- The endpoint always answers `204`, including on its own failures. A visitor should never see an error, or wait, because analytics had a bad day.
- Bot filtering matters more than it sounds. A linked portfolio collects crawlers, chat-app link unfurlers, and uptime monitors, and unfiltered they can outnumber real traffic and make every number fiction.
- Aggregation happens at read time. At portfolio scale that is simpler and always accurate; a site doing millions of views would precompute daily rollups instead.
- `/dashboard` and `/api/` are disallowed in `robots.txt` and the dashboard sends `noindex`.
