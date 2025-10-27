import type { Layout, Layouts } from "react-grid-layout";

/** Desktop: 20 kolumner => 20/50/30 */
const lg: Layout[] = [
  { i: "profile",      x: 0,  y: 0, w: 4,  h: 10 }, 
  { i: "individual",   x: 4,  y: 0, w: 10,  h: 10  },
  { i: "teams",        x: 14,  y: 5, w: 6,  h: 5  },
  { i: "achievements", x: 14, y: 0, w: 6,  h: 5 },
];

/** Tablet: 10 kolumner => 20%=3, 50%=5, 30%=2 */
const md: Layout[] = [
  { i: "profile",      x: 0, y: 0,  w: 3, h: 10 },
  { i: "individual",   x: 3, y: 0,  w: 5, h: 10 },
  { i: "achievements", x: 8, y: 0,  w: 2, h: 5  },
  { i: "teams",        x: 8, y: 5,  w: 2, h: 5  },
];

/** Mobil: 6 kolumner – stapla allt i “övre layoutens” ordning */
const sm: Layout[] = [
  { i: "profile",      x: 0, y: 0,  w: 6, h: 10 },
  { i: "individual",   x: 0, y: 10, w: 6, h: 10 },
  { i: "achievements", x: 0, y: 20, w: 6, h: 8  },
  { i: "teams",        x: 0, y: 28, w: 6, h: 8  },
];

export const layouts: Layouts = { lg, md, sm, xs: sm, xxs: sm };

export const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
export const cols        = { lg: 20,   md: 10,  sm: 6,   xs: 4,   xxs: 2 };