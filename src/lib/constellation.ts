import type { Domain } from './domains';

// Build-time layout for the map on /projects: domains on a ring, every project
// between the domains it belongs to, one line per membership. Deterministic, so
// the same content always draws the same picture.

export const MAP = { width: 640, height: 540, cx: 320, cy: 270, ring: 200 };

type Anchor = 'start' | 'middle' | 'end';

export interface MapDomain {
  id: string;
  label: string;
  hue: number;
  count: number;
  x: number;
  y: number;
  r: number;
  lx: number;
  ly: number;
  anchor: Anchor;
}

export interface MapProject {
  id: string;
  title: string;
  domains: string[];
  x: number;
  y: number;
  r: number;
  lx: number;
  ly: number;
  anchor: Anchor;
}

export interface MapLink {
  d: string;
  p: string;
  hue: number;
  len: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const round = (v: number) => Math.round(v * 10) / 10;

export function layoutMap(domains: Domain[]) {
  const { cx, cy, ring } = MAP;
  const n = domains.length;

  // project id -> indices (into domains) of every domain it sits in
  const members = new Map<string, { title: string; featured: boolean; ds: number[] }>();
  domains.forEach((d, i) => {
    for (const { project } of d.entries) {
      const m = members.get(project.id) ?? { title: project.data.title, featured: project.data.featured, ds: [] };
      m.ds.push(i);
      members.set(project.id, m);
    }
  });

  // Order the ring so domains that share projects sit close together: start in
  // rank order, then keep swapping pairs while the total chord length of shared
  // memberships drops.
  const slot = domains.map((_, i) => i);
  const chord = (a: number, b: number) => Math.sin((Math.PI * Math.abs(slot[a] - slot[b])) / n);
  const cost = () => {
    let c = 0;
    for (const { ds } of members.values()) {
      for (let a = 0; a < ds.length; a++) for (let b = a + 1; b < ds.length; b++) c += chord(ds[a], ds[b]);
    }
    return c;
  };
  let best = cost();
  for (let improved = true; improved; ) {
    improved = false;
    for (let a = 0; a < n; a++) {
      for (let b = a + 1; b < n; b++) {
        [slot[a], slot[b]] = [slot[b], slot[a]];
        const c = cost();
        if (c < best - 1e-9) {
          best = c;
          improved = true;
        } else {
          [slot[a], slot[b]] = [slot[b], slot[a]];
        }
      }
    }
  }
  // rotate so the biggest domain sits at twelve o'clock
  const top = slot[0];
  for (let i = 0; i < n; i++) slot[i] = (slot[i] - top + n) % n;

  const mapDomains: MapDomain[] = domains.map((d, i) => {
    const a = -Math.PI / 2 + (slot[i] * 2 * Math.PI) / n;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const count = d.entries.length;
    const r = 6 + count * 1.5;
    const lr = ring + r + 12;
    const side: Anchor = cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle';
    return {
      id: d.id,
      label: d.label,
      hue: d.hue,
      count,
      x: round(cx + ring * cos),
      y: round(cy + ring * sin),
      r,
      lx: round(cx + lr * cos),
      ly: round(cy + lr * sin + (side === 'middle' ? (sin < 0 ? -2 : 12) : 4)),
      anchor: side,
    };
  });

  // start each project at the mean of its domains, pulled toward the middle
  const entries = [...members.entries()];
  const pts = entries.map(([, m]) => {
    const mx = m.ds.reduce((s, i) => s + mapDomains[i].x, 0) / m.ds.length;
    const my = m.ds.reduce((s, i) => s + mapDomains[i].y, 0) / m.ds.length;
    const k = m.ds.length === 1 ? 0.6 : 0.74;
    return { x: cx + (mx - cx) * k, y: cy + (my - cy) * k };
  });

  // projects with the same set of domains start on the same spot; fan them out
  // along the tangent before relaxing
  const groups = new Map<string, number[]>();
  entries.forEach(([, m], i) => {
    const key = [...m.ds].sort().join(',');
    groups.set(key, [...(groups.get(key) ?? []), i]);
  });
  for (const ids of groups.values()) {
    ids.forEach((pi, j) => {
      const p = pts[pi];
      const dx = p.x - cx;
      const dy = p.y - cy;
      const len = Math.hypot(dx, dy) || 1;
      const off = (j - (ids.length - 1) / 2) * 34;
      p.x += (-dy / len) * off;
      p.y += (dx / len) * off;
    });
  }

  // push overlapping nodes apart and keep projects inside the ring
  for (let iter = 0; iter < 240; iter++) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[j].x - pts[i].x;
        const dy = pts[j].y - pts[i].y;
        const dist = Math.hypot(dx, dy);
        const min = 36;
        if (dist < min) {
          const ux = dist ? dx / dist : 1;
          const uy = dist ? dy / dist : 0;
          const push = (min - dist) / 2;
          pts[i].x -= ux * push;
          pts[i].y -= uy * push;
          pts[j].x += ux * push;
          pts[j].y += uy * push;
        }
      }
      for (const d of mapDomains) {
        const dx = pts[i].x - d.x;
        const dy = pts[i].y - d.y;
        const dist = Math.hypot(dx, dy);
        const min = d.r + 22;
        if (dist < min && dist > 0) {
          pts[i].x += (dx / dist) * (min - dist);
          pts[i].y += (dy / dist) * (min - dist);
        }
      }
      const rx = pts[i].x - cx;
      const ry = pts[i].y - cy;
      const rd = Math.hypot(rx, ry);
      const max = ring - 30;
      if (rd > max) {
        pts[i].x = cx + (rx / rd) * max;
        pts[i].y = cy + (ry / rd) * max;
      }
    }
  }

  const projects: MapProject[] = entries.map(([id, m], i) => {
    const x = round(pts[i].x);
    const y = round(pts[i].y);
    const right = x >= cx;
    return {
      id,
      title: m.title,
      domains: m.ds.map((di) => domains[di].id),
      x,
      y,
      r: m.featured ? 5 : 4,
      lx: round(x + (right ? 10 : -10)),
      ly: round(y + 4),
      anchor: right ? 'start' : 'end',
    };
  });

  const links: MapLink[] = projects.flatMap((p) =>
    members.get(p.id)!.ds.map((di) => {
      const d = mapDomains[di];
      return {
        d: d.id,
        p: p.id,
        hue: d.hue,
        len: Math.ceil(Math.hypot(d.x - p.x, d.y - p.y)),
        x1: p.x,
        y1: p.y,
        x2: d.x,
        y2: d.y,
      };
    })
  );

  return { domains: mapDomains, projects, links };
}
