import { sql, ensureSchema } from './db';

export type Range = 7 | 30 | 90 | 365;

export function parseRange(value: string | null): Range {
  const n = Number(value);
  return ([7, 30, 90, 365] as const).includes(n as Range) ? (n as Range) : 30;
}

export interface Stats {
  range: Range;
  totals: { views: number; visitors: number; prevViews: number; prevVisitors: number };
  series: { day: string; views: number; visitors: number }[];
  pages: { path: string; views: number; visitors: number }[];
  referrers: { source: string; views: number }[];
  countries: { country: string; views: number }[];
  devices: { device: string; views: number }[];
  browsers: { browser: string; views: number }[];
  recent: { ts: string; path: string; country: string | null; referrer: string | null }[];
}

export async function getStats(range: Range): Promise<Stats> {
  await ensureSchema();
  const q = sql();
  const days = `${range} days`;
  const prevDays = `${range * 2} days`;

  // A unique visitor is a distinct daily hash, so someone who visits on three
  // separate days counts three times over a week. That is the honest reading
  // of a deliberately non-persistent identifier: it measures daily reach, not
  // distinct humans, and pretending otherwise would overstate the numbers.
  const [totals, series, pages, referrers, countries, devices, browsers, recent] =
    await Promise.all([
      q`
        SELECT
          count(*) FILTER (WHERE ts >= now() - ${days}::interval)                      AS views,
          count(DISTINCT visitor) FILTER (WHERE ts >= now() - ${days}::interval)        AS visitors,
          count(*) FILTER (WHERE ts >= now() - ${prevDays}::interval
                             AND ts <  now() - ${days}::interval)                       AS prev_views,
          count(DISTINCT visitor) FILTER (WHERE ts >= now() - ${prevDays}::interval
                             AND ts <  now() - ${days}::interval)                       AS prev_visitors
        FROM events
      `,
      // generate_series so days with no traffic still appear as zero, instead
      // of the chart silently closing the gap and implying continuous traffic.
      q`
        WITH days AS (
          SELECT generate_series(
            date_trunc('day', now() - ${days}::interval),
            date_trunc('day', now()),
            '1 day'
          ) AS day
        )
        SELECT
          to_char(days.day, 'YYYY-MM-DD') AS day,
          count(e.id)                     AS views,
          count(DISTINCT e.visitor)       AS visitors
        FROM days
        LEFT JOIN events e ON date_trunc('day', e.ts) = days.day
        GROUP BY days.day
        ORDER BY days.day
      `,
      q`
        SELECT path, count(*) AS views, count(DISTINCT visitor) AS visitors
        FROM events WHERE ts >= now() - ${days}::interval
        GROUP BY path ORDER BY views DESC LIMIT 20
      `,
      q`
        SELECT coalesce(referrer, 'direct') AS source, count(*) AS views
        FROM events WHERE ts >= now() - ${days}::interval
        GROUP BY source ORDER BY views DESC LIMIT 15
      `,
      q`
        SELECT coalesce(country, '??') AS country, count(*) AS views
        FROM events WHERE ts >= now() - ${days}::interval
        GROUP BY country ORDER BY views DESC LIMIT 15
      `,
      q`
        SELECT device, count(*) AS views
        FROM events WHERE ts >= now() - ${days}::interval
        GROUP BY device ORDER BY views DESC
      `,
      q`
        SELECT browser, count(*) AS views
        FROM events WHERE ts >= now() - ${days}::interval
        GROUP BY browser ORDER BY views DESC
      `,
      // A live feel for what is happening right now. No visitor hash is
      // exposed, so this cannot be used to follow one person around.
      q`
        SELECT to_char(ts, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS ts, path, country, referrer
        FROM events ORDER BY ts DESC LIMIT 25
      `,
    ]);

  const t = totals[0] ?? {};
  const num = (v: unknown) => Number(v ?? 0);

  return {
    range,
    totals: {
      views: num(t.views),
      visitors: num(t.visitors),
      prevViews: num(t.prev_views),
      prevVisitors: num(t.prev_visitors),
    },
    series: series.map((r: any) => ({
      day: r.day,
      views: num(r.views),
      visitors: num(r.visitors),
    })),
    pages: pages.map((r: any) => ({
      path: r.path,
      views: num(r.views),
      visitors: num(r.visitors),
    })),
    referrers: referrers.map((r: any) => ({ source: r.source, views: num(r.views) })),
    countries: countries.map((r: any) => ({ country: r.country, views: num(r.views) })),
    devices: devices.map((r: any) => ({ device: r.device, views: num(r.views) })),
    browsers: browsers.map((r: any) => ({ browser: r.browser, views: num(r.views) })),
    recent: recent.map((r: any) => ({
      ts: r.ts,
      path: r.path,
      country: r.country,
      referrer: r.referrer,
    })),
  };
}
