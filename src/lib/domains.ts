import { getCollection, type CollectionEntry } from 'astro:content';
import { DOMAINS, type DomainDef } from '../data/domains';

export interface DomainEntry {
  project: CollectionEntry<'projects'>;
  // why this project belongs in this domain
  angle: string;
}

export interface Domain extends Omit<DomainDef, 'projects'> {
  // 0-based position on the index, most projects first
  rank: number;
  entries: DomainEntry[];
  // the stack across this domain's projects, most used first
  tech: string[];
}

function topTech(entries: DomainEntry[], limit = 8): string[] {
  const counts = new Map<string, number>();
  for (const { project } of entries) {
    for (const t of project.data.tech) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  // Map keeps first-seen order, and sort is stable, so ties stay in listing order
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([t]) => t);
}

export async function getDomains(): Promise<Domain[]> {
  const projects = await getCollection('projects');
  const byId = new Map(projects.map((p) => [p.id, p]));
  const listed = new Set<string>();

  const domains = DOMAINS.map(({ projects: picks, ...def }) => {
    const entries = Object.entries(picks).map(([id, angle]) => {
      const project = byId.get(id);
      if (!project) throw new Error(`domains.ts: "${def.id}" lists unknown project "${id}"`);
      listed.add(id);
      return { project, angle };
    });
    return { ...def, entries, tech: topTech(entries) };
  });

  const unlisted = projects.filter((p) => !listed.has(p.id)).map((p) => p.id);
  if (unlisted.length) {
    throw new Error(`domains.ts: no domain lists ${unlisted.join(', ')}`);
  }

  // most projects first; the sort is stable, so ties keep the order in domains.ts
  return domains
    .sort((a, b) => b.entries.length - a.entries.length)
    .map((d, rank) => ({ ...d, rank }));
}

// project id -> every domain it appears in, in index order
export function domainsByProject(domains: Domain[]): Map<string, Domain[]> {
  const out = new Map<string, Domain[]>();
  for (const d of domains) {
    for (const { project } of d.entries) {
      out.set(project.id, [...(out.get(project.id) ?? []), d]);
    }
  }
  return out;
}

export function pad(n: number): string {
  return String(n).padStart(2, '0');
}
