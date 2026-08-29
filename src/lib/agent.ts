// Bot filtering and user-agent parsing.
//
// Bot traffic is the single biggest way homegrown analytics lie to you. A
// portfolio that gets linked anywhere collects crawler hits from search
// engines, link unfurlers on every chat app, uptime monitors, and scrapers.
// Left unfiltered they can outnumber real visits and every number becomes
// fiction.

const BOT = /bot|crawl|spider|slurp|bing|baidu|yandex|duckduck|facebookexternalhit|whatsapp|telegram|slack|discord|linkedinbot|twitterbot|embedly|quora|pinterest|preview|scrape|curl|wget|python-requests|axios|go-http|java\/|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|semrush|ahrefs|mj12|dotbot|petal|applebot|google/i;

export function isBot(userAgent: string) {
  if (!userAgent) return true; // real browsers always send one
  return BOT.test(userAgent);
}

export function deviceOf(userAgent: string) {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(userAgent)) return 'tablet';
  if (/mobi|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(userAgent)) return 'mobile';
  return 'desktop';
}

// Order matters: Edge claims to be Chrome, Chrome claims to be Safari, and
// almost everything claims to be Mozilla. Check the most specific first.
export function browserOf(userAgent: string) {
  const ua = userAgent;
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\/|opera/i.test(ua)) return 'Opera';
  if (/brave/i.test(ua)) return 'Brave';
  if (/firefox\//i.test(ua)) return 'Firefox';
  if (/chrome\/|crios/i.test(ua)) return 'Chrome';
  if (/safari\//i.test(ua)) return 'Safari';
  return 'Other';
}

// Only the host is kept. The full referrer URL can carry search terms and
// other incidental personal detail, and "which site sent them" is the only
// part that answers a useful question anyway.
export function referrerHost(referrer: string | null, selfHost: string) {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    if (!host || host === selfHost.replace(/^www\./, '')) return null; // internal navigation
    return host;
  } catch {
    return null;
  }
}

// Keep paths bounded and drop query strings, which is where tracking params
// and the occasional accidental secret end up.
export function cleanPath(rawPath: string) {
  let p = (rawPath || '/').split('?')[0].split('#')[0];
  if (!p.startsWith('/')) p = '/' + p;
  if (p.length > 1) p = p.replace(/\/+$/, '') || '/';
  return p.slice(0, 256);
}

export function osOf(userAgent: string) {
  const ua = userAgent;
  if (/windows nt/i.test(ua)) return 'Windows';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/mac os x/i.test(ua)) return 'macOS';
  if (/android/i.test(ua)) return 'Android';
  if (/cros/i.test(ua)) return 'ChromeOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Other';
}

// Paths that exist for the author, not the audience. Counting the dashboard in
// its own numbers is circular and quietly inflates every total.
export function isPrivatePath(path: string) {
  return path === '/dashboard' || path.startsWith('/dashboard/') || path.startsWith('/api/');
}
