
import type { Layout } from "react-grid-layout";

export function rowsFromLayout(layout: Layout[] | undefined): number {
  if (!layout || layout.length === 0) return 1;
  return layout.reduce((max, it) => Math.max(max, it.y + it.h), 0);
}
