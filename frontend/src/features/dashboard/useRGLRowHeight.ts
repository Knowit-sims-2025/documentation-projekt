import { useCallback, useEffect, useLayoutEffect, useState } from "react";
const useIsoLE = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function toNum(n: string | null) { return n ? parseFloat(n) || 0 : 0; }

export function useRGLRowHeight(
  rows: number,
  opt?: {
    marginY?: number;
    containerPaddingY?: number;
    outerSel?: string;
    innerSel?: string;
    min?: number; max?: number;
  }
) {
  const {
    marginY = 8,
    containerPaddingY = 0,
    outerSel = ".app__main",
    innerSel = ".dashboard",
    min = 28,
    max = 140,
  } = opt || {};

  const [rowHeight, setRowHeight] = useState(40);

  const compute = useCallback(() => {
    const outer = document.querySelector(outerSel) as HTMLElement | null;
    const inner = document.querySelector(innerSel) as HTMLElement | null;
    if (!outer) return;

    const outerH = outer.getBoundingClientRect().height;

    let padTop = 0, padBottom = 0;
    if (inner) {
      const cs = getComputedStyle(inner);
      padTop = toNum(cs.paddingTop);
      padBottom = toNum(cs.paddingBottom);
    }

    const available = Math.max(0, outerH - padTop - padBottom);
    const denom = Math.max(1, rows);
    const numerator = available - (denom - 1) * marginY - 2 * containerPaddingY;
    const rh = Math.max(min, Math.min(max, Math.floor(numerator / denom)));
    setRowHeight(rh);
  }, [rows, marginY, containerPaddingY, outerSel, innerSel, min, max]);

  const kick = useCallback(() => {
    // Vänta 2 frames så CSS/layout hinner stabiliseras (särskilt efter reset)
    requestAnimationFrame(() => requestAnimationFrame(compute));
  }, [compute]);

  useIsoLE(() => {
    kick(); // initial

    const outer = document.querySelector(outerSel) as HTMLElement | null;
    const inner = document.querySelector(innerSel) as HTMLElement | null;

    const roOuter = outer ? new ResizeObserver(kick) : null;
    roOuter?.observe(outer!);

    const roInner = inner ? new ResizeObserver(kick) : null;
    roInner?.observe(inner!);

    const vv = window.visualViewport;
    vv?.addEventListener("resize", kick);
    vv?.addEventListener("scroll", kick);
    window.addEventListener("resize", kick);

    (document as any).fonts?.ready?.then?.(() => kick());

    const mo = new MutationObserver(() => kick());
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class","style","data-theme"] });

    return () => {
      roOuter?.disconnect();
      roInner?.disconnect();
      vv?.removeEventListener("resize", kick);
      vv?.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      mo.disconnect();
    };
  }, [kick]);

  return [rowHeight, kick] as const;
}
