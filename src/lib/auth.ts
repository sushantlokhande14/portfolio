import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
import { env } from './env';

const COOKIE = 'sl_dash';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Comparing secrets with === leaks their contents through timing: the
// comparison exits at the first differing byte, so response time reveals how
// much of a guess was right. timingSafeEqual always reads every byte.
// It throws on length mismatch, so lengths are equalised through a hash first.
function safeEqual(a: string, b: string) {
  const ha = createHmac('sha256', 'cmp').update(a).digest();
  const hb = createHmac('sha256', 'cmp').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(input: string) {
  const expected = env('ANALYTICS_PASSWORD');
  if (!expected) return false; // no password set means locked, not open
  return safeEqual(input, expected);
}

function secret() {
  // Falls back to the password so a working setup needs one secret, not two.
  const s = env('ANALYTICS_SECRET') ?? env('ANALYTICS_PASSWORD');
  if (!s) throw new Error('ANALYTICS_SECRET is not set');
  return s;
}

// A signed token rather than a stored session: there is no session table to
// keep, and the signature cannot be forged without the secret. The expiry is
// inside the signed payload, so it cannot be extended by editing the cookie.
export function issueToken() {
  const payload = `${Date.now() + MAX_AGE * 1000}.${randomBytes(8).toString('hex')}`;
  const sig = createHmac('sha256', secret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyToken(token: string | undefined) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [expiry, nonce, sig] = parts;
  const expected = createHmac('sha256', secret()).update(`${expiry}.${nonce}`).digest('hex');
  if (!safeEqual(sig, expected)) return false;
  return Number(expiry) > Date.now();
}

export function sessionCookie(token: string) {
  // HttpOnly keeps it away from any script on the page, SameSite=Lax blocks
  // it being sent from another site, Secure keeps it off plaintext HTTP.
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`;
}

export function clearCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function isAuthed(cookies: { get(name: string): { value: string } | undefined }) {
  try {
    return verifyToken(cookies.get(COOKIE)?.value);
  } catch {
    return false;
  }
}

export const COOKIE_NAME = COOKIE;
