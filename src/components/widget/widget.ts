export const fmt = (v: number, d = 2): string => (Math.abs(v) < 1e-12 ? 0 : v).toFixed(d).replace("-", "−");

export const reduceMotion = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ClientRouter swaps pages without reloading, so widgets mount on every page-load event.
export function mountAll(name: string, mount: (root: HTMLElement) => void): void {
  document.addEventListener("astro:page-load", () => {
    document.querySelectorAll<HTMLElement>(`[data-widget="${name}"]:not([data-mounted])`).forEach((root) => {
      root.dataset.mounted = "";
      mount(root);
    });
  });
}

export const $ = <T extends Element = HTMLElement>(root: HTMLElement, sel: string): T => root.querySelector<T>(sel)!;

// Runs `frame` on animation frames while `root` is on screen and playing; dt is in seconds, capped so a background tab doesn't jump.
export function animate(root: HTMLElement, frame: (dt: number) => void, playBtn?: HTMLButtonElement): (p: boolean) => void {
  let playing = !reduceMotion(), visible = false, last = 0, raf = 0;
  const tick = (t: number) => {
    frame(Math.min(0.05, (t - last) / 1000));
    last = t;
    raf = playing && visible ? requestAnimationFrame(tick) : 0;
  };
  const kick = () => { if (playing && visible && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
  const setPlaying = (p: boolean) => {
    playing = p;
    if (playBtn) { playBtn.textContent = p ? "Pause" : "Play"; playBtn.setAttribute("aria-pressed", String(p)); }
    kick();
  };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(root);
  playBtn?.addEventListener("click", () => setPlaying(!playing));
  setPlaying(playing);
  return setPlaying;
}

// Sizes a canvas for a fixed logical coordinate space at the device's pixel ratio.
export function fitCanvas(cv: HTMLCanvasElement, w: number, h: number): CanvasRenderingContext2D {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = w * dpr;
  cv.height = h * dpr;
  const ctx = cv.getContext("2d")!;
  ctx.scale(dpr, dpr);
  return ctx;
}

// Maps a pointer event to the canvas's logical coordinates.
export function canvasPoint(cv: HTMLCanvasElement, e: MouseEvent, w: number, h: number): { x: number; y: number } {
  const r = cv.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * w, y: ((e.clientY - r.top) / r.height) * h };
}
