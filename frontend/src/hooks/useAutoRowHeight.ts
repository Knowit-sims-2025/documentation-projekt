import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Layouts, Layout } from "react-grid-layout";

/** Hjälp: maxrader i en layout = max(y + h) */
function calcRows(layout: Layout[] | undefined): number {
  if (!layout || layout.length === 0) return 0;
  return layout.reduce((max, it) => Math.max(max, it.y + it.h), 0);
}

/** Hook: räkna ut rowHeight så att grid fyller containerhöjd pixelperfekt */
function useAutoRowHeight(opts: {
  containerRef: React.RefObject<HTMLElement>;
  layouts: Layouts;
  breakpoint: keyof Layouts;
  marginY: number;            // samma som RGL `margin[1]`
  containerPaddingY: number;  // samma som RGL `containerPadding[1]`
}) {
  const { containerRef, layouts, breakpoint, marginY, containerPaddingY } = opts;
  const [availableH, setAvailableH] = useState<number>(0);
  const rows = useMemo(() => calcRows(layouts[breakpoint]), [layouts, breakpoint]);

  // 1) Mät containerhöjd med ResizeObserver så att dvh/omlayout funkar direkt
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setAvailableH(rect.height);
    };

    measure(); // initial
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Fallback mot orientationchange/keyboard UI på mobil
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef]);

  // 2) Räkna ut rowHeight (pixlar per rad)
  const rowHeight = useMemo(() => {
    if (!rows || rows <= 0 || availableH <= 0) return 40; // fallback
    const totalMargins = Math.max(0, rows - 1) * marginY;
    const totalPadding = containerPaddingY * 2;
    const free = availableH - totalPadding - totalMargins;
    // Skydda mot negativa fall (extremt liten höjd)
    return Math.max(8, free / rows);
  }, [rows, availableH, marginY, containerPaddingY]);

  return { rowHeight, rows, availableH };
}

export { useAutoRowHeight };