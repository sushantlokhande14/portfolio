import type { APIRoute } from 'astro';
import { sql, ensureSchema, hasDatabase } from '../../lib/db';
import { visitorHash, clientIp } from '../../lib/identity';
import { isBot, deviceOf, browserOf, referrerHost, cleanPath } from '../../lib/agent';
import { env } from '../../lib/env';

export const prerender = false;

// The beacon is fire-and-forget from the browser's perspective, so this always
// answers 204 quickly. A visitor should never see an error, or wait, because
// analytics had a bad day.
const NO_CONTENT = new Response(null, {
  status: 204,
  headers: { 'cache-control': 'no-store' },
});

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!hasDatabase()) return NO_CONTENT;

    const userAgent = request.headers.get('user-agent') ?? '';
    if (isBot(userAgent)) return NO_CONTENT;

    const body = (await request.json().catch(() => null)) as {
      path?: string;
      referrer?: string | null;
    } | null;
    if (!body) return NO_CONTENT;

    const salt = env('ANALYTICS_SALT');
    if (!salt) return NO_CONTENT; // refuse to hash with a predictable salt

    const url = new URL(request.url);
    const visitor = visitorHash(clientIp(request.headers), userAgent, salt);

    await ensureSchema();
    await sql()`
      INSERT INTO events (path, referrer, country, device, browser, visitor)
      VALUES (
        ${cleanPath(body.path ?? '/')},
        ${referrerHost(body.referrer ?? null, url.hostname)},
        ${request.headers.get('x-vercel-ip-country') ?? null},
        ${deviceOf(userAgent)},
        ${browserOf(userAgent)},
        ${visitor}
      )
    `;
    return NO_CONTENT;
  } catch {
    // Swallow everything. A broken insert must not turn into a visible error
    // on the site, and there is nothing the browser could do with the failure.
    return NO_CONTENT;
  }
};

// Anything other than POST gets the same silent answer, so probing the
// endpoint reveals nothing about whether it exists or what it stores.
export const GET: APIRoute = () => NO_CONTENT;
