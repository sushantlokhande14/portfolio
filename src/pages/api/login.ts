import type { APIRoute } from 'astro';
import { checkPassword, issueToken, sessionCookie, clearCookie } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData().catch(() => null);
  const password = String(form?.get('password') ?? '');

  // A fixed delay on failure blunts rapid guessing without needing state.
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 600));
    return redirect('/dashboard?e=1', 303);
  }

  return new Response(null, {
    status: 303,
    headers: { location: '/dashboard', 'set-cookie': sessionCookie(issueToken()) },
  });
};

export const DELETE: APIRoute = async () =>
  new Response(null, { status: 303, headers: { location: '/dashboard', 'set-cookie': clearCookie() } });
