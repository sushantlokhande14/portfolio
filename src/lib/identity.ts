import { createHash } from 'node:crypto';

// Counting unique visitors without cookies and without storing anything
// personal.
//
// visitor = sha256(salt + ip + user-agent + yyyy-mm-dd)
//
// The date in the input is the important part: the same person browsing
// tomorrow hashes to a completely different value, so there is no identifier
// that follows anyone across days. The raw IP is never written to the
// database, only consumed here. That is what keeps this cookie-free and out of
// consent-banner territory, at the cost of not being able to track returning
// visitors, which is a trade worth making for a portfolio.
export function visitorHash(ip: string, userAgent: string, salt: string, now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  return createHash('sha256').update(`${salt}|${ip}|${userAgent}|${day}`).digest('hex').slice(0, 32);
}

// Vercel puts the real client IP here; the fallbacks keep local dev working.
export function clientIp(headers: Headers) {
  return (
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    '0.0.0.0'
  );
}
