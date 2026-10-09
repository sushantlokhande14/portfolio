// ============================================================================
// FJ-6, the easter egg. A little six-engine plane sits on RWY 1 in the corner
// of the hero. Pick it up and it flies; carry it near the top or bottom of the
// screen and the page scrolls with you. Let go over a runway and it lands, let
// go anywhere else and it circles there. The battery lasts FLIGHT_S seconds.
// Landing on RWY 2 at the bottom of the page opens the card to /what-if.
//
// Hints, for people poking at it: clicking the plane gets the tower talking,
// clicking an empty runway says where the plane is, and the first time RWY 2
// scrolls into view a ghost FJ-6 does a low pass over it.
// Keyboard: Enter on the plane flies it there on autopilot. Escape sends it home.
// ============================================================================

type Phase = 'parked' | 'flying' | 'loiter' | 'landing' | 'glide' | 'auto';

interface Point {
  x: number;
  y: number;
  t: number;
}

const FLIGHT_S = 30;
const EDGE = 0.14; // auto-scroll band at the top and bottom, as a share of the viewport
const SCROLL_MAX = 2200; // px/s with the pointer right at the edge
const TAKEOFF_PX = 6;
const LOITER_R = 16;
const TRAIL_MS = 1100;
const STORE = 'fj6';
const FLYBY_KEY = 'fj6-flyby';

const HINTS = [
  'FJ-6 holding short of RWY 1.',
  'FJ-6, ready when you are. It flies if you pick it up.',
  'Hold the plane and drag to take off. Mind the battery.',
];

const plane = document.getElementById('fj6') as HTMLButtonElement | null;
if (plane) init(plane);

function init(plane: HTMLButtonElement) {
  const svg = plane.querySelector('svg') as SVGSVGElement;
  const gauge = plane.querySelector('.fj-batt') as HTMLElement;
  const gaugeFill = gauge.querySelector('i') as HTMLElement;
  const modal = document.getElementById('fj-modal') as HTMLDialogElement | null;
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const strips = new Map<number, HTMLElement>();
  document.querySelectorAll<HTMLElement>('[data-strip]').forEach((el) => strips.set(Number(el.dataset.strip), el));
  const slot = (n: number) => strips.get(n)?.querySelector<HTMLElement>('[data-slot]') ?? null;
  const runwayRect = (n: number) => strips.get(n)?.querySelector('.fj-runway')?.getBoundingClientRect() ?? null;

  // the sky: a fixed layer on <body> the plane moves into while it is up
  const sky = document.createElement('div');
  sky.className = 'fj-sky';
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  sky.append(canvas);
  document.body.append(sky);
  const ctx = canvas.getContext('2d');

  const radioEl = document.createElement('p');
  radioEl.className = 'fj-radio';
  radioEl.setAttribute('role', 'status');
  document.body.append(radioEl);
  let radioTimer = 0;
  function radio(text: string, ms = 2800) {
    radioEl.textContent = text;
    radioEl.classList.add('is-on');
    clearTimeout(radioTimer);
    radioTimer = window.setTimeout(() => radioEl.classList.remove('is-on'), ms);
  }

  const st = {
    phase: 'parked' as Phase,
    at: 1, // runway it is parked on
    from: 1, // runway it took off from
    x: 0, // viewport position of the plane's centre
    y: 0,
    tx: 0, // where it is heading: the pointer, or a point on its holding circle
    ty: 0,
    cx: 0, // holding circle centre
    cy: 0,
    loiterT: 0,
    heading: 0, // radians, 0 = nose to the right
    lift: 0, // 0 on the ground, 1 in the air: drives size and shadow
    battery: 1,
    landedWith: -1,
    landedVia: '' as '' | 'hand' | 'auto',
    pointer: -1,
    downX: 0,
    downY: 0,
    pageX: 0, // last position in page coordinates, for the heading
    pageY: 0,
    over: 0, // runway under the plane, 0 for none
    lowWarned: false,
    sighted: false,
    swallowClick: false,
    clicks: 0,
    flown: false,
    last: 0,
    raf: 0,
  };
  const trail: Point[] = [];
  let accent = '#3bc4dd';

  // ---------------------------------------------------------------- parking
  try {
    if (localStorage.getItem(STORE) === '2' && slot(2)) {
      slot(2)!.append(plane);
      st.at = 2;
    }
  } catch {}
  describe();

  function describe() {
    plane.setAttribute(
      'aria-label',
      st.at === 2
        ? 'FJ-6, a small plane parked on runway 2. Press to read its landing card.'
        : 'FJ-6, a small plane parked on runway 1. Press Enter to fly it.',
    );
  }

  function park(n: number) {
    const s = slot(n);
    if (!s) return;
    s.append(plane);
    plane.classList.remove('is-flying');
    plane.style.transform = '';
    plane.style.opacity = '';
    plane.style.removeProperty('--alt');
    svg.style.transform = '';
    st.phase = 'parked';
    st.at = n;
    st.lift = 0;
    root.classList.remove('fj-airborne', 'fj-dragging');
    strips.forEach((el) => el.classList.remove('is-ready'));
    try {
      localStorage.setItem(STORE, String(n));
    } catch {}
    describe();
  }

  // ---------------------------------------------------------------- input
  plane.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || !['parked', 'loiter'].includes(st.phase)) return;
    e.preventDefault();
    st.swallowClick = false;
    st.pointer = e.pointerId;
    st.downX = st.tx = e.clientX;
    st.downY = st.ty = e.clientY;
    try {
      plane.setPointerCapture(e.pointerId);
    } catch {}
    if (st.phase === 'loiter') {
      // caught it again mid-air
      st.phase = 'flying';
      st.swallowClick = true;
      root.classList.add('fj-dragging');
    }
  });

  window.addEventListener('pointermove', (e) => {
    if (e.pointerId !== st.pointer) return;
    st.tx = e.clientX;
    st.ty = e.clientY;
    if (st.phase === 'parked' && Math.hypot(e.clientX - st.downX, e.clientY - st.downY) > TAKEOFF_PX) takeoff();
  });

  const release = (e: PointerEvent) => {
    if (e.pointerId !== st.pointer) return;
    st.pointer = -1;
    root.classList.remove('fj-dragging');
    if (st.phase === 'flying') letGo();
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);

  plane.addEventListener('click', (e) => {
    if (st.swallowClick) {
      st.swallowClick = false;
      return;
    }
    if (st.phase !== 'parked') return;
    if (e.detail === 0) return autopilot(); // Enter or Space
    if (st.at === 2) return openCard();
    hint();
  });

  strips.forEach((el, n) => {
    el.querySelector('.fj-runway')?.addEventListener('click', () => {
      if (st.phase !== 'parked') return;
      if (st.at === n) return n === 2 ? openCard() : hint();
      if (n === 2) radio('RWY 2: no traffic. Expecting FJ-6 from RWY 1.');
      else radio('RWY 1 is empty. FJ-6 is parked on RWY 2.');
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !['flying', 'loiter', 'auto'].includes(st.phase)) return;
    st.pointer = -1;
    park(st.from);
    trail.length = 0;
    radio(`FJ-6 back on RWY ${st.from}.`);
  });

  function hint() {
    radio(HINTS[Math.min(st.clicks, HINTS.length - 1)]);
    st.clicks++;
    runup();
  }

  // ---------------------------------------------------------------- flight
  function takeoff(phase: Phase = 'flying') {
    const r = plane.getBoundingClientRect();
    st.x = r.left + r.width / 2;
    st.y = r.top + r.height / 2;
    st.pageX = st.x + scrollX;
    st.pageY = st.y + scrollY;
    st.heading = 0;
    st.lift = 0;
    st.from = st.at;
    st.battery = 1;
    st.lowWarned = false;
    st.sighted = false;
    st.flown = true;
    st.swallowClick = phase === 'flying';
    st.phase = phase;
    accent = getComputedStyle(root).getPropertyValue('--accent-1').trim() || accent;
    sky.append(plane);
    // moving the element drops pointer capture, so take it again
    if (st.pointer >= 0) {
      try {
        plane.setPointerCapture(st.pointer);
      } catch {}
    }
    plane.classList.remove('is-runup');
    plane.classList.add('is-flying');
    root.classList.add('fj-airborne');
    if (phase === 'flying') root.classList.add('fj-dragging');
    trail.length = 0;
    render(performance.now());
    radio(st.from === 1 ? 'FJ-6, cleared for takeoff.' : 'FJ-6 off RWY 2. Have a good flight.');
    loop();
  }

  function letGo() {
    const n = runwayUnder();
    if (n) return land(n);
    st.phase = 'loiter';
    st.cx = st.x - LOITER_R;
    st.cy = st.y;
    st.loiterT = 0;
    radio('FJ-6, no runway there. Holding.');
  }

  function runwayUnder() {
    for (const n of strips.keys()) {
      const r = runwayRect(n);
      const m = 26;
      if (r && st.x > r.left - m && st.x < r.right + m && st.y > r.top - m && st.y < r.bottom + m) return n;
    }
    return 0;
  }

  function loop() {
    if (st.raf) return;
    st.last = performance.now();
    st.raf = requestAnimationFrame(frame);
  }

  function frame(now: number) {
    st.raf = 0;
    const dt = Math.min(0.05, Math.max(0, (now - st.last) / 1000));
    st.last = now;
    const up = st.phase === 'flying' || st.phase === 'loiter' || st.phase === 'auto';

    if (st.phase === 'flying' || st.phase === 'loiter') {
      st.battery = Math.max(0, st.battery - dt / FLIGHT_S);
      if (!st.lowWarned && st.battery < 0.25) {
        st.lowWarned = true;
        radio('FJ-6, battery low.');
      }
    }

    if (st.phase === 'flying') {
      const band = Math.max(56, innerHeight * EDGE);
      const k = st.ty > innerHeight - band ? (st.ty - innerHeight + band) / band : st.ty < band ? -(band - st.ty) / band : 0;
      if (k) window.scrollBy({ top: Math.sign(k) * Math.min(1, k * k) * SCROLL_MAX * dt, behavior: 'instant' });
      follow(st.tx, st.ty, dt, 14);
    } else if (st.phase === 'loiter') {
      st.loiterT += dt * 2.2;
      follow(st.cx + LOITER_R * Math.cos(st.loiterT), st.cy + LOITER_R * Math.sin(st.loiterT), dt, 8);
    } else if (st.phase === 'auto') {
      follow(st.tx, st.ty, dt, 3);
    }

    if (up) {
      st.lift += (1 - st.lift) * (1 - Math.exp(-dt * 6));
      steer(dt);
      const n = runwayUnder();
      if (n !== st.over) {
        strips.forEach((el, i) => el.classList.toggle('is-ready', i === n));
        st.over = n;
        if (n === 2 && !st.sighted && st.phase !== 'auto') {
          st.sighted = true;
          radio('FJ-6, RWY 2 in sight. Cleared to land.');
        }
      }
      render(now);
      exhaust(now);
      if (st.battery <= 0 && st.phase !== 'auto') glide();
    }

    drawTrail(now);
    if (up || trail.length) st.raf = requestAnimationFrame(frame);
  }

  function follow(tx: number, ty: number, dt: number, k: number) {
    const a = 1 - Math.exp(-dt * k);
    st.x += (tx - st.x) * a;
    st.y += (ty - st.y) * a;
  }

  // nose points where the plane is going over the page, so scrolling while
  // holding still still turns it downhill
  function steer(dt: number) {
    const px = st.x + scrollX, py = st.y + scrollY;
    const vx = (px - st.pageX) / Math.max(dt, 1e-3);
    const vy = (py - st.pageY) / Math.max(dt, 1e-3);
    st.pageX = px;
    st.pageY = py;
    if (Math.hypot(vx, vy) > 30) st.heading = turnToward(st.heading, Math.atan2(vy, vx), 1 - Math.exp(-dt * 9));
  }

  function render(now: number) {
    const bob = reduced.matches ? 0 : Math.sin(now / 260) * 1.2 * st.lift;
    plane.style.transform = `translate3d(${(st.x - 20).toFixed(1)}px, ${(st.y - 20 + bob).toFixed(1)}px, 0)`;
    plane.style.setProperty('--alt', st.lift.toFixed(3));
    svg.style.transform = `rotate(${st.heading.toFixed(4)}rad) scale(${(1 + 0.45 * st.lift).toFixed(3)})`;
    gaugeFill.style.width = `${(st.battery * 100).toFixed(1)}%`;
    gauge.dataset.level = st.battery < 0.25 ? 'low' : st.battery < 0.5 ? 'mid' : 'ok';
  }

  function exhaust(now: number) {
    const back = 12 * (1 + 0.45 * st.lift);
    trail.push({ x: st.x + scrollX - Math.cos(st.heading) * back, y: st.y + scrollY - Math.sin(st.heading) * back, t: now });
  }

  // ---------------------------------------------------------------- landing
  function land(n: number) {
    st.landedVia = st.phase === 'auto' ? 'auto' : 'hand';
    st.phase = 'landing';
    st.landedWith = st.battery;
    root.classList.remove('fj-dragging');
    const x0 = st.x, y0 = st.y, h0 = st.heading, l0 = st.lift;
    const t0 = performance.now();
    const T1 = reduced.matches ? 200 : 650, T2 = reduced.matches ? 120 : 520;
    const spot = () => {
      const s = slot(n)!.getBoundingClientRect();
      return { x: s.left + s.width * (n === 2 ? 0.72 : 0.24), y: s.top + s.height / 2 };
    };
    const step = (now: number) => {
      const t = now - t0;
      const p = spot();
      if (t < T1) {
        // final approach onto the runway centreline, a little short of the spot
        const e = easeOut(t / T1);
        st.x = x0 + (p.x - 26 - x0) * e;
        st.y = y0 + (p.y - y0) * e;
        st.heading = turnToward(h0, 0, e);
        st.lift = l0 * (1 - e);
        exhaust(now);
      } else if (t < T1 + T2) {
        // roll-out
        st.x = p.x - 26 * (1 - easeOut((t - T1) / T2));
        st.y = p.y;
        st.heading = 0;
        st.lift = 0;
      } else {
        park(n);
        if (n === 2) {
          radio('Touchdown on RWY 2.');
          window.setTimeout(openCard, reduced.matches ? 150 : 650);
        } else radio('FJ-6 back on RWY 1.');
        return;
      }
      render(now);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    loop();
  }

  function glide() {
    st.phase = 'glide';
    root.classList.remove('fj-dragging');
    if (st.pointer >= 0) {
      try {
        plane.releasePointerCapture(st.pointer);
      } catch {}
    }
    st.pointer = -1;
    radio('FJ-6 put down in a field. Battery flat.', 3200);
    const x0 = st.x, y0 = st.y, l0 = st.lift;
    const t0 = performance.now();
    const T = reduced.matches ? 300 : 1300;
    const step = (now: number) => {
      const e = Math.min(1, (now - t0) / T);
      st.x = x0 + Math.cos(st.heading) * 40 * easeOut(e);
      st.y = y0 + Math.sin(st.heading) * 40 * easeOut(e);
      st.lift = l0 * (1 - e);
      plane.style.opacity = String(1 - e * e);
      render(now);
      if (e < 1) return void requestAnimationFrame(step);
      const home = st.from;
      park(home);
      plane.style.opacity = '0';
      requestAnimationFrame(() => {
        plane.style.transition = 'opacity 0.6s ease';
        plane.style.opacity = '1';
        window.setTimeout(() => (plane.style.transition = ''), 700);
      });
      window.setTimeout(() => radio(`FJ-6 is back on RWY ${home}, charged. Try a shorter route.`, 3400), 3300);
    };
    requestAnimationFrame(step);
    loop();
  }

  // ---------------------------------------------------------------- keyboard autopilot
  function autopilot() {
    if (st.at === 2) return openCard();
    const r2 = runwayRect(2);
    if (!r2) return;
    takeoff('auto');
    st.tx = innerWidth * 0.62;
    st.ty = innerHeight * 0.42;
    const y0 = scrollY;
    const y1 = Math.min(document.documentElement.scrollHeight - innerHeight, y0 + r2.top - innerHeight * 0.55);
    const dur = reduced.matches ? 0 : Math.min(3400, Math.max(1400, Math.abs(y1 - y0) / 2.6));
    const t0 = performance.now();
    radio('FJ-6 on autopilot to RWY 2.');
    const step = (now: number) => {
      if (st.phase !== 'auto') return;
      const e = dur ? Math.min(1, (now - t0) / dur) : 1;
      window.scrollTo({ top: y0 + (y1 - y0) * easeInOut(e), behavior: 'instant' });
      if (e > 0.75) {
        const r = runwayRect(2)!;
        st.tx = r.left + r.width * 0.3;
        st.ty = r.top + r.height / 2;
      }
      if (e < 1) return void requestAnimationFrame(step);
      window.setTimeout(() => st.phase === 'auto' && land(2), reduced.matches ? 0 : 450);
    };
    requestAnimationFrame(step);
  }

  // ---------------------------------------------------------------- the card
  function openCard() {
    if (!modal) return;
    const score = modal.querySelector<HTMLElement>('[data-score]');
    if (score) {
      score.hidden = !st.landedVia;
      score.textContent =
        st.landedVia === 'auto' ? 'Landed on autopilot.' : `Landed with ${Math.round(st.landedWith * 100)}% battery left.`;
    }
    if (!modal.open) modal.showModal();
  }

  if (modal) {
    modal.querySelector('[data-close]')?.addEventListener('click', () => modal.close());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.close();
    });
    modal.addEventListener('close', () => plane.focus({ preventScroll: true }));
  }

  // ---------------------------------------------------------------- contrail
  function drawTrail(now: number) {
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    while (trail.length && now - trail[0].t > TRAIL_MS) trail.shift();
    if (trail.length < 2) return;
    ctx.setTransform(dpr, 0, 0, dpr, -scrollX * dpr, -scrollY * dpr);
    ctx.lineCap = 'round';
    ctx.strokeStyle = accent;
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1], b = trail[i];
      const life = 1 - (now - b.t) / TRAIL_MS;
      ctx.globalAlpha = 0.45 * life;
      ctx.lineWidth = 0.6 + 1.8 * life;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- idle hints
  function runup() {
    if (reduced.matches || st.phase !== 'parked') return;
    plane.classList.remove('is-runup');
    void plane.offsetWidth;
    plane.classList.add('is-runup');
    window.setTimeout(() => plane.classList.remove('is-runup'), 900);
  }

  // every so often, while the hero is on screen, the parked plane runs its engines up
  let heroVisible = false;
  const s1 = strips.get(1);
  if (s1) new IntersectionObserver(([e]) => (heroVisible = e.isIntersecting)).observe(s1);
  window.setTimeout(function idle() {
    if (heroVisible && st.at === 1 && !document.hidden && !st.flown) runup();
    window.setTimeout(idle, 14000);
  }, 3500);

  // the first time RWY 2 comes into view, a ghost FJ-6 makes a low pass over it
  const s2 = strips.get(2);
  if (s2) {
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || e.intersectionRatio < 0.9) return;
        let seen = false;
        try {
          seen = sessionStorage.getItem(FLYBY_KEY) === '1';
          sessionStorage.setItem(FLYBY_KEY, '1');
        } catch {}
        io.disconnect();
        if (!seen && !reduced.matches && st.phase === 'parked' && st.at === 1 && !st.flown) flyby();
      },
      { threshold: [0.9] },
    );
    io.observe(s2);
  }

  function flyby() {
    const r = runwayRect(2);
    if (!r) return;
    const ghost = document.createElement('div');
    ghost.className = 'fj-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.append(svg.cloneNode(true));
    const gsvg = ghost.firstElementChild as SVGSVGElement;
    gsvg.style.transform = '';
    sky.append(ghost);
    accent = getComputedStyle(root).getPropertyValue('--accent-1').trim() || accent;
    root.classList.add('fj-airborne');
    // in from the right, a low pass along the runway, then a climbing turn out to the upper left
    const yR = r.top + r.height / 2;
    const P = [
      { x: innerWidth + 60, y: yR - 170 },
      { x: r.right + 140, y: yR + 10 },
      { x: r.left - 60, y: yR - 4 },
      { x: -80, y: Math.max(-80, yR - innerHeight * 0.75) },
    ];
    const t0 = performance.now(), T = 2600;
    let lastX = P[0].x, lastY = P[0].y, heading = Math.PI;
    const step = (now: number) => {
      const u = Math.min(1, (now - t0) / T);
      const v = 1 - u;
      const x = v * v * v * P[0].x + 3 * v * v * u * P[1].x + 3 * v * u * u * P[2].x + u * u * u * P[3].x;
      const y = v * v * v * P[0].y + 3 * v * v * u * P[1].y + 3 * v * u * u * P[2].y + u * u * u * P[3].y;
      if (Math.hypot(x - lastX, y - lastY) > 0.5) heading = Math.atan2(y - lastY, x - lastX);
      lastX = x;
      lastY = y;
      const lift = 0.55 + 0.45 * Math.abs(1 - 2 * u);
      ghost.style.setProperty('--alt', lift.toFixed(3));
      ghost.style.transform = `translate3d(${(x - 20).toFixed(1)}px, ${(y - 20).toFixed(1)}px, 0)`;
      gsvg.style.transform = `rotate(${heading.toFixed(4)}rad) scale(${(1 + 0.45 * lift).toFixed(3)})`;
      trail.push({ x: x + scrollX - Math.cos(heading) * 16, y: y + scrollY - Math.sin(heading) * 16, t: now });
      if (u < 1) return void requestAnimationFrame(step);
      ghost.remove();
      if (st.phase === 'parked') root.classList.remove('fj-airborne');
    };
    requestAnimationFrame(step);
    loop();
  }
}

function turnToward(from: number, to: number, k: number) {
  let d = ((to - from + Math.PI) % (2 * Math.PI)) - Math.PI;
  if (d < -Math.PI) d += 2 * Math.PI;
  return from + d * k;
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
