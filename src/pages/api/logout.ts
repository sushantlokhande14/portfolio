import type { APIRoute } from 'astro';
import { clearCookie } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async () =>
  new Response(null, { status: 303, headers: { location: '/dashboard', 'set-cookie': clearCookie() } });
