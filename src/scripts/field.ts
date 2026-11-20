import { navigate } from "astro:transitions/client";

import type { Brain, BrainPost } from "../lib/brain";

// ===========================================================================
// Settings
// ===========================================================================

const RGB: Record<string, string> = {
  ai: "180,140,255",
  engineering: "79,209,255",
  base: "111,125,255",
  concept: "225,230,255",
};
const LOBE_ANGLE: Record<string, number> = { ai: -Math.PI / 2, engineering: Math.PI / 2 - 0.35 };
const MAX_PULSES = 1600;
const TRACE_TAU_S = 2.2;
const HEBB_TAU_S = 90;
const HAZE_ALPHA = 0.075;
const BASE_EDGE_ALPHA = [0.025, 0.045, 0.07];
const SPRITE_STOPS = [[0, 1], [0.1, 0.6], [0.35, 0.14], [1, 0]];
const HAZE_STOPS = [[0, 0.6], [0.5, 0.2], [1, 0]];
const SEED = 1607;
const VISITED_KEY = "brain:visited";
const YEAR_MS = 3.156e10;
// Tailwind `xl`: from here up the index and post layouts leave the right of the screen to the field.
const SPLIT_MIN_W = 1280;
// Tailwind `max-w-3xl`, the article column.
const ARTICLE_W = 768;
const LABEL_PX = 11;

// ===========================================================================
// Types
// ===========================================================================

export type Mode = { kind: "home" | "index" | "post" | "page"; focus?: string };

type Kind = "post" | "concept" | "base";

type Neuron = {
  kind: Kind;
  bx: number;
  by: number;
  x: number;
  y: number;
  depth: number;
  ph: number;
  v: number;
  ref: number;
  fl: number;
  c: string;
  lobe: string;
  r: number;
  w: number;
  vis: number;
  label?: string;
  post?: BrainPost;
};

type EdgeKind = "assoc" | "thread" | "base";

type Edge = { a: number; b: number; kind: EdgeKind; g: number; c: string; h: number; vis: number };

type Pulse = { k: number; from: number; to: number; t: number; c: string; speed: number };

// ===========================================================================
// Field
// ===========================================================================

export function mount(cv: HTMLCanvasElement, brain: Brain) {
  const ctx = cv.getContext("2d")!;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sprites = Object.fromEntries(Object.entries(RGB).map(([k, c]) => [k, sprite(c, SPRITE_STOPS)]));
  const hazes = Object.fromEntries(Object.keys(LOBE_ANGLE).map((k) => [k, sprite(RGB[k], HAZE_STOPS)]));
  const visited = new Set<string>(readVisited());
  const newest = Math.max(...brain.posts.map((p) => Date.parse(p.date)));

  let W = 0, H = 0, dpr = 1, rx = 0, ry = 0, split = false;
  let N: Neuron[] = [], E: Edge[] = [], P: Pulse[] = [], adj: number[][] = [], labelled: number[] = [];
  let lobeLabels: { lobe: string; x: number; y: number }[] = [];
  let rings: { x: number; y: number; r: number }[] = [];
  let gain = 0.6, mode: Mode = { kind: "home" }, focus = -1, hover = -1, hoverDom = false, boostLobe: string | null = null;
  let entering = false, read = 0, readFired = false, lastFocusFire = 0;
  const cam = { x: 0, y: 0, z: 1, tx: 0, ty: 0, tz: 1 };
  const off = { x: 0, y: 0 };
  const mouse = { x: -1e4, y: -1e4, on: false };

  const build = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    rx = W * 0.46; ry = Math.min(H, W * 1.3) * 0.46;
    split = W >= SPLIT_MIN_W;
    const rnd = mulberry32(SEED);
    N = []; E = []; P = []; rings = []; lobeLabels = [];
    const add = (n: Partial<Neuron> & Pick<Neuron, "kind" | "bx" | "by">) =>
      N.push({ x: n.bx, y: n.by, depth: 1, ph: rnd() * 6.28, v: 0, ref: 0, fl: 0, c: "base", lobe: "base", r: 1.5, w: 0, vis: 1, ...n }) - 1;
    const seen = new Set<string>();
    const link = (a: number, b: number, kind: EdgeKind) => {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (a !== b && !seen.has(key)) { seen.add(key); E.push({ a, b, kind, g: 0, c: "base", h: 0, vis: Math.min(N[a].vis, N[b].vis) }); }
    };

    const byLobe = new Map<string, number[]>();
    brain.posts.forEach((p, i) => byLobe.set(p.lobe, [...(byLobe.get(p.lobe) ?? []), i]));
    const postIdx: number[] = [];
    for (const [lobe, ids] of byLobe) {
      ids.forEach((pi, k) => {
        const p = brain.posts[pi];
        const w = 0.25 + 0.75 * Math.exp(-(newest - Date.parse(p.date)) / YEAR_MS / 1.5);
        const spread = Math.min(0.24, 1.9 / ids.length);
        const a = LOBE_ANGLE[lobe] + (k - (ids.length - 1) / 2) * spread + (rnd() - 0.5) * 0.05;
        const r = 0.5 + (1 - w) * 0.47 + (k % 2) * 0.07;
        postIdx[pi] = add({
          kind: "post", bx: W / 2 + Math.cos(a) * r * rx, by: H / 2 + Math.sin(a) * r * ry,
          c: lobe, lobe, r: 2.2 + 2.6 * w, w, post: p, label: p.title,
        });
      });
      const ns = ids.map((pi) => N[postIdx[pi]]);
      lobeLabels.push({
        lobe,
        x: Math.max(70, Math.min(W - 70, ns.reduce((s, n) => s + n.bx, 0) / ns.length)),
        y: Math.sin(LOBE_ANGLE[lobe]) > 0 && W > H
          ?Math.min(H - 70, Math.max(...ns.map((n) => n.by)) + 34)
          : Math.max(76, Math.min(...ns.map((n) => n.by)) - 34),
      });
      ids.slice(0, -1).forEach((pi, k) => link(postIdx[ids[k + 1]], postIdx[pi], "thread"));
    }

    for (const c of brain.concepts) {
      const ps = c.posts.map((i) => N[postIdx[i]]);
      const cx = ps.reduce((s, n) => s + n.bx, 0) / ps.length, cy = ps.reduce((s, n) => s + n.by, 0) / ps.length;
      const ci = add({
        kind: "concept", bx: cx + (W / 2 - cx) * 0.18 + (rnd() - 0.5) * 30, by: cy + (H / 2 - cy) * 0.18 + (rnd() - 0.5) * 30,
        c: "concept", lobe: ps[0].lobe, r: 1.8, w: 0.5, label: `#${c.name}`,
      });
      c.posts.forEach((i) => link(ci, postIdx[i], "assoc"));
    }

    const count = Math.max(120, Math.min(420, (W * H) / 5000));
    for (let i = 0; i < count; i++) {
      const bx = rnd() * (W + 120) - 60, by = rnd() * (H + 120) - 60;
      const depth = 0.3 + rnd() * 0.7, r = 0.8 + rnd() * 1.1;
      const edge = Math.hypot((bx - W / 2) / (W * 0.58), (by - H / 2) / (H * 0.58));
      add({
        kind: "base", bx, by, depth, r, lobe: nearestLobe(Math.atan2(by - H / 2, bx - W / 2)),
        vis: Math.max(0, Math.min(1, 1.3 - edge)) * (0.45 + 0.55 * depth),
      });
    }
    N.forEach((a, i) => {
      N.map((b, j) => [j, b.kind === "base" && j !== i ? (a.bx - b.bx) ** 2 + (a.by - b.by) ** 2 : Infinity])
        .sort((p, q) => p[1] - q[1])
        .slice(0, a.kind === "base" ? 3 : 2)
        .forEach(([j]) => link(i, j, "base"));
    });
    labelled = N.flatMap((n, i) => (n.label ? [i] : []));
    adj = N.map(() => []);
    E.forEach((e, k) => { adj[e.a].push(k); adj[e.b].push(k); });
    applyMode(true);
  };

  const fire = (i: number, from = -1, c = "base") => {
    const n = N[i];
    if (n.ref > 0) return;
    n.v = 0; n.fl = 1;
    n.ref = n.kind === "base" ? 0.3 : 0.7;
    n.c = n.kind === "post" ? n.lobe : n.kind === "concept" && c === "base" ? "concept" : c;
    for (const k of adj[i]) {
      const e = E[k], j = e.a === i ? e.b : e.a;
      if (j === from || P.length >= MAX_PULSES) continue;
      if (e.kind === "thread" && e.a !== i) continue;
      if (e.kind === "base" && Math.random() > 0.85) continue;
      P.push({ k, from: i, to: j, t: 0, c: n.c, speed: e.kind === "base" ? 300 : e.kind === "thread" ? 240 : 190 });
    }
  };

  const step = (dt: number, time: number) => {
    const ease = 1 - Math.exp(-dt * 2.6);
    cam.x += (cam.tx - cam.x) * ease; cam.y += (cam.ty - cam.y) * ease; cam.z += (cam.tz - cam.z) * ease;
    const par = mouse.on && mode.kind !== "post" ? { x: mouse.x - W / 2, y: mouse.y - H / 2 } : { x: 0, y: 0 };
    const m = toWorld(mouse.x, mouse.y);

    N.forEach((n, i) => {
      n.x = n.bx + Math.sin(time * 0.3 + n.ph) * 9 * n.depth - par.x * 0.035 * n.depth;
      n.y = n.by + Math.cos(time * 0.23 + n.ph * 1.3) * 9 * n.depth - par.y * 0.035 * n.depth;
      n.v *= Math.exp(-dt * 1.5);
      n.ref -= dt;
      n.fl *= Math.exp(-dt * (n.kind === "base" ? 3.5 : 1.6));
      const rate = n.kind === "post" ? 0.01 + 0.07 * n.w : n.kind === "concept" ? 0.012 : 0.03;
      if (Math.random() < dt * rate) fire(i);
      if (boostLobe && n.lobe === boostLobe && n.kind !== "base" && Math.random() < dt * 1.5) fire(i);
      if (mouse.on) {
        const d = Math.hypot(n.x - m.x, n.y - m.y);
        if (d < 130) { n.v += dt * 2.4 * (1 - d / 130); if (n.v >= 1) fire(i); }
      }
    });

    for (const r of rings) {
      const prev = r.r;
      r.r += dt * 650;
      N.forEach((n, i) => { const d = Math.hypot(n.x - r.x, n.y - r.y); if (d > prev && d <= r.r) fire(i); });
    }
    rings = rings.filter((r) => r.r < Math.hypot(W, H) * 1.2);

    const traceDecay = Math.exp(-dt / TRACE_TAU_S), hebbDecay = Math.exp(-dt / HEBB_TAU_S);
    for (const e of E) { e.g *= traceDecay; e.h *= hebbDecay; }

    P = P.filter((p) => {
      const a = N[p.from], b = N[p.to], e = E[p.k];
      p.t += (dt * p.speed) / Math.max(20, Math.hypot(b.x - a.x, b.y - a.y));
      if (p.t < 1) return true;
      e.g = 1; e.c = p.c;
      if (e.kind !== "base") e.h = Math.min(1, e.h + 0.05);
      if (e.kind === "base") { b.v += gain; if (b.v >= 1) fire(p.to, p.from, p.c); }
      else if (Math.random() < 0.6) fire(p.to, p.from, p.c);
      else b.v += 0.5;
      return false;
    });
    const target = N.length * 0.45;
    gain = Math.max(0.25, Math.min(0.95, gain + ((target - P.length) / target) * dt * 0.08));

    for (const i of [hover, focus]) {
      if (i < 0) continue;
      const strength = i === hover ? 0.75 : 0.4;
      for (const k of adj[i]) {
        const e = E[k];
        if (e.kind === "base") continue;
        e.g = Math.max(e.g, strength); e.c = N[i].lobe;
        const j = e.a === i ? e.b : e.a;
        N[j].fl = Math.max(N[j].fl, strength * 0.6);
      }
    }
    if (focus >= 0) {
      N[focus].fl = Math.max(N[focus].fl, 0.3 + read * 0.7);
      if (time - lastFocusFire > 3.5) { lastFocusFire = time; N[focus].ref = 0; fire(focus); }
    }
  };

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgb(5,6,12)";
    ctx.fillRect(0, 0, W, H);
    ctx.setTransform(dpr * cam.z, 0, 0, dpr * cam.z, dpr * (W / 2 - cam.x * cam.z), dpr * (H / 2 - cam.y * cam.z));
    ctx.globalCompositeOperation = "lighter";

    ctx.globalAlpha = HAZE_ALPHA;
    const hs = Math.max(rx, ry) * 1.7;
    for (const [lobe, a] of Object.entries(LOBE_ANGLE)) {
      ctx.drawImage(hazes[lobe], W / 2 + Math.cos(a) * rx * 0.75 - hs / 2, H / 2 + Math.sin(a) * ry * 0.75 - hs / 2, hs, hs);
    }
    ctx.globalAlpha = 1;

    ctx.lineWidth = 1 / cam.z;
    BASE_EDGE_ALPHA.forEach((alpha, bucket) => {
      ctx.strokeStyle = `rgba(${RGB.base},${alpha})`;
      ctx.beginPath();
      for (const e of E) if (e.kind === "base" && Math.min(2, (e.vis * 3) | 0) === bucket) line(e);
      ctx.stroke();
    });
    for (const e of E) {
      const base = e.kind === "base";
      const idle = base ? 0 : 0.1 + e.h * 0.25, live = e.g * (base ? 0.22 * e.vis : 0.6);
      const alpha = Math.max(idle, live);
      if (alpha < 0.03) continue;
      ctx.strokeStyle = `rgba(${RGB[live > idle ? e.c : N[e.b].lobe]},${alpha})`;
      ctx.lineWidth = (base ? 1 : 1.4 + e.h * 1.5) / cam.z;
      if (e.kind === "assoc") ctx.setLineDash([3 / cam.z, 4 / cam.z]);
      ctx.beginPath(); line(e); ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.lineWidth = 1.6 / cam.z;
    for (const p of P) {
      const a = N[p.from], b = N[p.to];
      const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
      if (E[p.k].kind === "base") {
        ctx.globalAlpha = 0.7 * E[p.k].vis;
        ctx.drawImage(sprites[p.c], x - 4.5, y - 4.5, 9, 9);
        ctx.globalAlpha = 1;
        continue;
      }
      const t0 = Math.max(0, p.t - 0.3), x0 = a.x + (b.x - a.x) * t0, y0 = a.y + (b.y - a.y) * t0;
      const g = ctx.createLinearGradient(x0, y0, x, y);
      g.addColorStop(0, `rgba(${RGB[p.c]},0)`);
      g.addColorStop(1, `rgba(${RGB[p.c]},.9)`);
      ctx.strokeStyle = g;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke();
      ctx.drawImage(sprites[p.c], x - 8, y - 8, 16, 16);
    }

    for (const [i, n] of N.entries()) {
      const s = n.kind === "post" ? (18 + 30 * n.w) * (0.5 + n.w * 0.5) + n.fl * 46 + (i === hover ? 34 : 0)
        : n.kind === "concept" ? 10 + n.fl * 36 : n.fl * 26 * n.vis;
      if (s > 2) ctx.drawImage(sprites[n.c], n.x - s / 2, n.y - s / 2, s, s);
      ctx.fillStyle = `rgba(${RGB[n.c]},${n.kind === "post" ? 0.45 + n.w * 0.3 + n.fl * 0.5 : n.kind === "concept" ? 0.35 + n.fl * 0.5 : (0.3 + n.fl * 0.6) * n.vis})`;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.29); ctx.fill();
      if (n.kind === "base") continue;
      if (n.fl > 0.15) {
        ctx.fillStyle = `rgba(255,255,255,${n.fl * 0.7})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 0.55, 0, 6.29); ctx.fill();
      }
      if (n.post && visited.has(n.post.id)) {
        ctx.strokeStyle = `rgba(${RGB[n.lobe]},.55)`;
        ctx.lineWidth = 1 / cam.z;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 5, 0, 6.29); ctx.stroke();
      }
      if (i === focus && read > 0) {
        ctx.strokeStyle = `rgba(${RGB[n.lobe]},.9)`;
        ctx.lineWidth = 1.5 / cam.z;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 9, -Math.PI / 2, -Math.PI / 2 + read * 2 * Math.PI); ctx.stroke();
      }
    }

    for (const r of rings) {
      ctx.strokeStyle = `rgba(200,210,255,${0.16 * (1 - r.r / Math.hypot(W, H))})`;
      ctx.lineWidth = 2 / cam.z;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 6.29); ctx.stroke();
    }

    ctx.globalCompositeOperation = "source-over";
    const px = 1 / cam.z;
    ctx.lineJoin = "round";
    ctx.lineWidth = 3 * px;
    ctx.strokeStyle = "rgba(5,6,12,.8)";
    if (mode.kind === "home") {
      ctx.font = `600 ${LABEL_PX * px}px "JetBrains Mono Variable", monospace`;
      ctx.textAlign = "center";
      for (const l of lobeLabels) {
        ctx.fillStyle = `rgba(${RGB[l.lobe]},${boostLobe === l.lobe ? 0.8 : 0.3})`;
        ctx.fillText(l.lobe.toUpperCase(), l.x, l.y);
      }
    }
    ctx.font = `${LABEL_PX * px}px "JetBrains Mono Variable", monospace`;
    const here = mode.kind === "post" && split ? focus : -1;
    const ambient = mode.kind === "home" || (split && mode.kind !== "page");
    const pinned = (i: number) => i === hover && (!hoverDom || split);
    const alphaOf = (i: number) => (pinned(i) ? 1 : ambient && i !== focus ? Math.min(1, (N[i].fl - 0.1) * 1.6) : 0);
    const outward = mode.kind === "home" && W > H;
    const view = [cam.x - (W / 2 - 8) * px, cam.x + (W / 2 - 8) * px];
    const boxes: number[][] = [];
    for (const i of labelled.filter((i) => alphaOf(i) >= 0.05).sort((a, b) => alphaOf(b) + N[b].w - alphaOf(a) - N[a].w)) {
      const n = N[i], alpha = alphaOf(i);
      let right = n.x > W / 2 !== outward;
      const t = n.label!.length > 38 ? n.label!.slice(0, 37) + "…" : n.label!;
      const sub = i === hover && n.post ? `${n.post.date} · ${n.lobe} · click to enter` : "";
      const w = Math.max(ctx.measureText(t).width, sub ? ctx.measureText(sub).width : 0);
      if (right ? n.x - w < view[0] : n.x + w > view[1]) right = !right;
      const x = n.x + (right ? -10 : 10) * px, y = n.y - 8 * px;
      const box = [right ? x - w : x, y - LABEL_PX * px, right ? x : x + w, y + (sub ? 26 : 4) * px];
      if (boxes.some((b) => box[0] < b[2] && b[0] < box[2] && box[1] < b[3] && b[1] < box[3])) continue;
      boxes.push(box);
      ctx.textAlign = right ? "right" : "left";
      ctx.globalAlpha = alpha;
      ctx.strokeText(t, x, y);
      ctx.fillStyle = `rgb(${RGB[n.kind === "concept" ? n.c : n.lobe]})`;
      ctx.fillText(t, x, y);
      if (sub) {
        ctx.strokeText(sub, x, y + 22 * px);
        ctx.fillStyle = "rgb(139,147,184)";
        ctx.fillText(sub, x, y + 22 * px);
      }
    }
    ctx.globalAlpha = 1;
    if (here >= 0) {
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(${RGB[N[here].lobe]},.8)`;
      ctx.fillText(read > 0.97 ? "fired" : read > 0 ? `charging ${Math.round(read * 100)}%` : "you are here", N[here].x, N[here].y + N[here].r + 26 * px);
    }
  };

  const applyMode = (instant = false) => {
    focus = mode.focus ? N.findIndex((n) => n.post?.id === mode.focus) : -1;
    const f = focus >= 0 ? N[focus] : null, lobe = lobeFocus();
    const inLobe = N.filter((n) => n.kind === "post" && n.lobe === lobe);
    let x = W / 2, y = H / 2, z = 1;
    off.x = off.y = 0;
    if (f) {
      x = f.bx; y = f.by; z = split ? 1.8 : 1.5;
      off.x = split ? (W + ARTICLE_W) / 4 : W / 2 - 44;
      off.y = split ? -H * 0.1 : 104 - H / 2;
    } else if (mode.kind === "index") {
      z = split ? 0.5 : 0.92;
      if (inLobe.length) {
        x = inLobe.reduce((s, n) => s + n.bx, 0) / inLobe.length;
        y = inLobe.reduce((s, n) => s + n.by, 0) / inLobe.length;
        z = split ? 0.8 : 1.1;
      }
      if (split) off.x = W * 0.26;
    } else if (mode.kind === "home" && H > W) {
      z = 0.92; off.y = H * 0.12;
    }
    cam.tx = x - off.x / z; cam.ty = y - off.y / z; cam.tz = z;
    boostLobe = lobe;
    if (instant || reduce) { cam.x = cam.tx; cam.y = cam.ty; cam.z = cam.tz; }
    cv.dataset.mode = mode.kind;
    if (reduce) { step(0, 0); draw(); }
  };

  const toWorld = (x: number, y: number) => ({ x: (x - W / 2) / cam.z + cam.x, y: (y - H / 2) / cam.z + cam.y });

  const nodeAt = (x: number, y: number) => {
    const m = toWorld(x, y);
    let best = -1, bd = 26 / cam.z;
    N.forEach((n, i) => {
      if (n.kind !== "post") return;
      const d = Math.hypot(n.x - m.x, n.y - m.y);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  };

  const enter = (i: number) => {
    const n = N[i];
    if (entering || !n.post) return;
    entering = true;
    n.ref = 0; fire(i);
    cam.tx = n.x - off.x / 4.5; cam.ty = n.y - off.y / 4.5; cam.tz = 4.5;
    setTimeout(() => navigate(n.post!.url).finally(() => { entering = false; }), reduce ? 0 : 450);
  };

  const line = (e: Edge) => { ctx.moveTo(N[e.a].x, N[e.a].y); ctx.lineTo(N[e.b].x, N[e.b].y); };

  const lobeFocus = () => (mode.kind === "index" && LOBE_ANGLE[mode.focus ?? ""] !== undefined ? mode.focus! : null);

  const interactive = () => mode.kind === "home" || mode.kind === "index";

  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    Object.assign(mouse, { x: e.clientX, y: e.clientY, on: true });
    if (!interactive()) return;
    if ((e.target as Element).closest("[data-neuron]")) return;
    hover = e.target === cv ? nodeAt(e.clientX, e.clientY) : -1;
    hoverDom = false;
    cv.style.cursor = hover >= 0 ? "pointer" : "";
  });
  document.documentElement.addEventListener("pointerleave", () => { mouse.on = false; hover = -1; });
  addEventListener("click", (e) => {
    if (!interactive() || e.target !== cv) return;
    const i = nodeAt(e.clientX, e.clientY);
    if (i >= 0) { e.preventDefault(); enter(i); return; }
    const m = toWorld(e.clientX, e.clientY);
    rings.push({ x: m.x, y: m.y, r: 0 });
  });
  document.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse") return;
    const el = (e.target as Element).closest<HTMLElement>("[data-neuron], [data-lobe]");
    if (!el) return;
    if (el.dataset.lobe) { boostLobe = el.dataset.lobe; return; }
    const i = N.findIndex((n) => n.post?.id === el.dataset.neuron);
    if (i >= 0) { hover = i; hoverDom = true; N[i].ref = 0; fire(i); }
  });
  document.addEventListener("pointerout", (e) => {
    if (e.pointerType !== "mouse") return;
    const el = (e.target as Element).closest<HTMLElement>("[data-neuron], [data-lobe]");
    if (!el || el.contains(e.relatedTarget as Node)) return;
    if (el.dataset.lobe) boostLobe = lobeFocus(); else hover = -1;
  });
  addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    read = max > 0 ? Math.min(1, scrollY / max) : 0;
    const dims = mode.kind === "home" || (mode.kind === "post" && W < SPLIT_MIN_W);
    cv.style.setProperty("--scroll-dim", dims ? String(Math.min(0.6, scrollY / H)) : "0");
    if (focus >= 0 && read > 0.97 && !readFired) {
      readFired = true;
      N[focus].ref = 0; fire(focus);
      rings.push({ x: N[focus].x, y: N[focus].y, r: 0 });
    }
  }, { passive: true });
  let rt = 0;
  addEventListener("resize", () => {
    if (cv.clientWidth === W && cv.clientHeight === H) return;
    clearTimeout(rt); rt = window.setTimeout(build, 150);
  });

  build();
  if (!reduce) {
    let last = performance.now();
    requestAnimationFrame(function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden) { step(dt, now / 1000); draw(); }
      requestAnimationFrame(frame);
    });
  }

  return {
    setMode(next: Mode) {
      mode = next; read = 0; readFired = false; hover = -1; boostLobe = null;
      cv.style.setProperty("--scroll-dim", "0");
      if (next.kind === "post" && next.focus) { visited.add(next.focus); writeVisited([...visited]); }
      applyMode();
    },
    wave() { rings.push({ x: W / 2, y: H / 2, r: 0 }); },
  };
}

// ===========================================================================
// Helpers
// ===========================================================================

function sprite(c: string, stops: number[][]) {
  const s = document.createElement("canvas");
  s.width = s.height = 64;
  const g = s.getContext("2d")!, gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  for (const [at, alpha] of stops) gr.addColorStop(at, `rgba(${c},${alpha})`);
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  return s;
}

function nearestLobe(angle: number) {
  let best = "base", bd = Infinity;
  for (const [lobe, a] of Object.entries(LOBE_ANGLE)) {
    const d = Math.abs(Math.atan2(Math.sin(angle - a), Math.cos(angle - a)));
    if (d < bd) { bd = d; best = lobe; }
  }
  return best;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function readVisited(): string[] {
  try { return JSON.parse(localStorage.getItem(VISITED_KEY) ?? "[]"); } catch { return []; }
}

function writeVisited(ids: string[]) {
  try { localStorage.setItem(VISITED_KEY, JSON.stringify(ids)); } catch { /* storage unavailable */ }
}
