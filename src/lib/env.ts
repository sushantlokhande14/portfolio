// Secrets have to be read the same way in two different runtimes.
//
// On Vercel they arrive as real environment variables in process.env. In local
// dev, Astro loads .env into import.meta.env instead, so process.env is empty
// and every secret silently reads as undefined.
//
// The lookup is dynamic on purpose: writing import.meta.env.SOME_SECRET
// directly lets Vite statically replace it at build time, which can inline a
// secret into the client bundle. Indexing with a variable cannot be replaced.
export function env(key: string): string | undefined {
  const fromProcess = typeof process !== 'undefined' ? process.env?.[key] : undefined;
  if (fromProcess) return fromProcess;
  const meta = import.meta.env as Record<string, string | undefined>;
  return meta?.[key];
}
