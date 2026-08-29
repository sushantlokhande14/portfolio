import type { APIRoute } from 'astro';
import { sql, ensureSchema, hasDatabase } from '../../lib/db';
import { visitorHash, clientIp } from '../../lib/identity';
import {
  isBot,
  deviceOf,
  browserOf,
  osOf,
  referrerHost,
  cleanPath,
  isPrivatePath,
} from '../../lib/agent';
import { env } from '../../lib/env';
import { isAuthed } from '../../lib/auth';

export const prerender = false;

// The beacon is fire-and-forget from the browser's perspective, so this always
// answers 204 quickly. A visitor should never see an error, or wait, because
// analytics had a bad day.
const NO_CONTENT = new Response(null, {
  status: 204,
  headers: { 'cache-control': 'no-store' },
});

// A refresh is not a new visit. Analytics tools call this the session window:
// the same person hitting the same page again inside it is the same view.
// Thirty minutes is the industry-standard default.
const SESSION_MINUTES = 30;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    if (!hasDatabase()) return NO_CONTENT;

    // Anyone holding a valid dashboard session is the author. Excluding them
    // here rather than in the browser means it cannot be undone by clearing
    // site data, and it needs no setup.
    if (isAuthed(cookies)) return NO_CONTENT;

    const userAgent = request.headers.get('user-agent') ?? '';
    if (isBot(userAgent)) return NO_CONTENT;

    const body = (await request.json().catch(() => null)) as {
      path?: string;
      referrer?: string | null;
    } | null;
    if (!body) return NO_CONTENT;

    const path = cleanPath(body.path ?? '/');
    if (isPrivatePath(path)) return NO_CONTENT;

    const salt = env('ANALYTICS_SALT');
    if (!salt) return NO_CONTENT; // refuse to hash with a predictable salt

    const url = new URL(request.url);
    const visitor = visitorHash(clientIp(request.headers), userAgent, salt);

    await ensureSchema();

    // Conditional insert: the row is written only when this visitor has not
    // already been recorded on this path inside the session window. Doing it
    // in one statement keeps it atomic, so two fast requests cannot both pass
    // a separate check and double-count.
    await sql()`
      INSERT INTO events (path, referrer, country, device, browser, os, visitor)
      SELECT
        ${path},
        ${referrerHost(body.referrer ?? null, url.hostname)},
        ${request.headers.get('x-vercel-ip-country') ?? null},
        ${deviceOf(userAgent)},
        ${browserOf(userAgent)},
        ${osOf(userAgent)},
        ${visitor}
      WHERE NOT EXISTS (
        SELECT 1 FROM events
        WHERE visitor = ${visitor}
          AND path = ${path}
          AND ts > now() - ${`${SESSION_MINUTES} minutes`}::interval
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
