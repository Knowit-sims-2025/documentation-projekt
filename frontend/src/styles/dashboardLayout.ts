
import type { Layout, Layouts } from "react-grid-layout";

// 12 kolumner desktop
const lg: Layout[] = [
  { i: "profile",      x: 0, y: 0,  w: 3, h: 8 },
  { i: "individual",   x: 3, y: 0,  w: 6, h: 4 },
  { i: "teams",        x: 3, y: 4,  w: 3, h: 4 },
  { i: "competition",  x: 6, y: 4,  w: 3, h: 4 },
  { i: "achievements", x: 9, y: 0,  w: 3, h: 8 },
];

// 10 kolumner tablet
const md: Layout[] = [
  { i: "profile",      x: 0, y: 0, w: 3, h: 7 },
  { i: "individual",   x: 3, y: 0, w: 5, h: 4 },
  { i: "teams",        x: 3, y: 4, w: 2, h: 3 },
  { i: "competition",  x: 5, y: 4, w: 3, h: 3 },
  { i: "achievements", x: 8, y: 0, w: 2, h: 7 },
];

// 6 kolumner mobil
const sm: Layout[] = [
  { i: "profile",      x: 0, y: 0,  w: 6, h: 6 },
  { i: "individual",   x: 0, y: 6,  w: 6, h: 4 },
  { i: "teams",        x: 0, y: 10, w: 6, h: 4 },
  { i: "competition",  x: 0, y: 14, w: 6, h: 4 },
  { i: "achievements", x: 0, y: 18, w: 6, h: 6 },
];

export const layouts: Layouts = { lg, md, sm, xs: sm, xxs: sm };

// breakpoint-värden i px: när bredden är <= detta värde används den layouten
export const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };

// antal kolumner per breakpoint
export const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
