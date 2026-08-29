import { sql, ensureSchema } from './db';

export type Range = 7 | 30 | 90 | 365;

export function parseRange(value: string | null): Range {
  const n = Number(value);
  return ([7, 30, 90, 365] as const).includes(n as Range) ? (n as Range) : 30;
}

export interface Stats {
  range: Range;
  totals: {
    views: number;
    visitors: number;
    prevViews: number;
    prevVisitors: number;
    perVisitor: number;
    prevPerVisitor: number;
    activeDays: number;
    today: number;
  };
  best: { day: string | null; views: number };
  series: { day: string; views: number; visitors: number }[];
  pages: { path: string; views: number; visitors: number }[];
  referrers: { source: string; views: number }[];
  channels: { channel: string; views: number }[];
  countries: { country: string; views: number }[];
  devices: { device: string; views: number }[];
  browsers: { browser: string; views: number }[];
  systems: { os: string; views: number }[];
  heatmap: { dow: number; hour: number; views: number }[];
  recent: { ts: string; path: string; country: string | null; referrer: string | null; device: string; browser: string }[];
}

export async function getStats(range: Range): Promise<Stats> {
  await ensureSchema();
  const q = sql();
  const days = `${range} days`;
  const prevDays = `${range * 2} days`;

  const [totals, best, series, pages, referrers, channels, countries, devices, browsers, systems, heatmap, recent] =
    await Promise.all([
      q`
        SELECT
          count(*) FILTER (WHERE ts >= now() - ${days}::interval)                        AS views,
          count(DISTINCT visitor) FILTER (WHERE ts >= now() - ${days}::interval)          AS visitors,
          count(*) FILTER (WHERE ts >= now() - ${prevDays}::interval
                             AND ts <  now() - ${days}::interval)                         AS prev_views,
          count(DISTINCT visitor) FILTER (WHERE ts >= now() - ${prevDays}::interval
                             AND ts <  now() - ${days}::interval)                         AS prev_visitors,
          count(DISTINCT date_trunc('day', ts)) FILTER (WHERE ts >= now() - ${days}::interval) AS active_days,
          count(*) FILTER (WHERE ts >= date_trunc('day', now()))                          AS today
        FROM events
      `,
      q`
        SELECT to_char(date_trunc('day', ts), 'YYYY-MM-DD') AS day, count(*) AS views
        FROM events WHERE ts >= now() - ${days}::interval
        GROUP BY 1 ORDER BY views DESC, day DESC LIMIT 1
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
        SELECT
          CASE
            WHEN referrer IS NULL THEN 'direct'
            WHEN referrer ~ '(google|bing|duckduckgo|yahoo|ecosia|brave)\\.' THEN 'search'
            WHEN referrer ~ '(linkedin|twitter|x\\.com|facebook|instagram|reddit|news\\.ycombinator|bsky|mastodon|threads)' THEN 'social'
            WHEN referrer ~ '(github|gitlab|vercel|stackoverflow|dev\\.to|medium)' THEN 'dev'
            ELSE 'referral'
          END AS channel,
          count(*) AS views
        FROM events WHERE ts >= now() - ${days}::interval
        GROUP BY channel ORDER BY views DESC
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
      q`
        SELECT coalesce(os, 'Unknown') AS os, count(*) AS views
        FROM events WHERE ts >= now() - ${days}::interval
        GROUP BY os ORDER BY views DESC
      `,
      // When people actually read the site, as weekday against hour. Useful in
      // a way a total never is: a recruiter reading on a Tuesday morning and a
      // friend browsing on Sunday night are different signals.
      q`
        SELECT
          EXTRACT(DOW  FROM ts)::int AS dow,
          EXTRACT(HOUR FROM ts)::int AS hour,
          count(*)                   AS views
        FROM events WHERE ts >= now() - ${days}::interval
        GROUP BY dow, hour
      `,
      // A live feel for what is happening right now. No visitor hash is
      // exposed, so this cannot be used to follow one person around.
      q`
        SELECT to_char(ts, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS ts,
               path, country, referrer, device, browser
        FROM events ORDER BY ts DESC LIMIT 30
      `,
    ]);

  const t = totals[0] ?? {};
  const num = (v: unknown) => Number(v ?? 0);
  const views = num(t.views);
  const visitors = num(t.visitors);
  const prevViews = num(t.prev_views);
  const prevVisitors = num(t.prev_visitors);

  return {
    range,
    totals: {
      views,
      visitors,
      prevViews,
      prevVisitors,
      perVisitor: visitors ? Math.round((views / visitors) * 10) / 10 : 0,
      prevPerVisitor: prevVisitors ? Math.round((prevViews / prevVisitors) * 10) / 10 : 0,
      activeDays: num(t.active_days),
      today: num(t.today),
    },
    best: { day: best[0]?.day ?? null, views: num(best[0]?.views) },
    series: series.map((r: any) => ({ day: r.day, views: num(r.views), visitors: num(r.visitors) })),
    pages: pages.map((r: any) => ({ path: r.path, views: num(r.views), visitors: num(r.visitors) })),
    referrers: referrers.map((r: any) => ({ source: r.source, views: num(r.views) })),
    channels: channels.map((r: any) => ({ channel: r.channel, views: num(r.views) })),
    countries: countries.map((r: any) => ({ country: r.country, views: num(r.views) })),
    devices: devices.map((r: any) => ({ device: r.device, views: num(r.views) })),
    browsers: browsers.map((r: any) => ({ browser: r.browser, views: num(r.views) })),
    systems: systems.map((r: any) => ({ os: r.os, views: num(r.views) })),
    heatmap: heatmap.map((r: any) => ({ dow: num(r.dow), hour: num(r.hour), views: num(r.views) })),
    recent: recent.map((r: any) => ({
      ts: r.ts,
      path: r.path,
      country: r.country,
      referrer: r.referrer,
      device: r.device,
      browser: r.browser,
    })),
  };
}
