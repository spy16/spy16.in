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
