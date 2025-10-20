import { useLayoutEffect, useState } from "react";

/**
 * Räknar dynamiskt ut rowHeight för React-Grid-Layout utifrån höjden på .app__main.
 * Ex: rows=10 -> rowHeight = appMainHeight / 10 (klampas mellan min/max).
 */
export function useAutoRowHeight(
  rows: number = 10,
  min: number = 28,
  max: number = 140
) {
  const [rowHeight, setRowHeight] = useState<number>(40);

  useLayoutEffect(() => {
    const el = document.querySelector(".app__main") as HTMLElement | null;
    if (!el) return;

    const compute = () => {
      const h = el.getBoundingClientRect().height;
      const px = Math.max(min, Math.min(max, Math.round(h / rows)));
      setRowHeight(px);
    };

    // Kör direkt
    compute();

    // Reagera på container-storleksändring (fönster, adressfält på mobil, temabyten, etc.)
    const ro = new ResizeObserver(() => compute());
    ro.observe(el);

    // Extra lyhördhet på mobil (adressfält/tangentbord)
    const vv = (window as any).visualViewport as VisualViewport | undefined;
    vv?.addEventListener("resize", compute);
    vv?.addEventListener("scroll", compute);

    // Vanlig resize fallback
    window.addEventListener("resize", compute);

    return () => {
      ro.disconnect();
      vv?.removeEventListener("resize", compute);
      vv?.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [rows, min, max]);

  return rowHeight;
}
