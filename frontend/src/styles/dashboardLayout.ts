// styles/dashboardLayout.ts
import type { Layout, Layouts } from "react-grid-layout";

/** Desktop: 20 kolumner => 30%=6, 40%=8, 20%=4 */
const lg: Layout[] = [
  { i: "profile",      x: 0,  y: 0, w: 4,  h: 10 }, 
  { i: "individual",   x: 4,  y: 0, w: 8,  h: 6  },
  { i: "teams",        x: 4,  y: 6, w: 4,  h: 4  },
  { i: "competition",  x: 8, y: 6, w: 4,  h: 4  },
  { i: "achievements", x: 12, y: 0, w: 8,  h: 10 },
];

/** Tablet: välj 10 kolumner */
const md: Layout[] = [
  { i: "profile",      x: 0, y: 0,  w: 3, h: 10 },
  { i: "individual",   x: 3, y: 0,  w: 4, h: 6  },
  { i: "teams",        x: 3, y: 6,  w: 2, h: 4  },
  { i: "competition",  x: 5, y: 6,  w: 2, h: 4  },
  { i: "achievements", x: 7, y: 0,  w: 3, h: 10 },
];

/** Mobil: 6 kolumner – staplar allt */
const sm: Layout[] = [
  { i: "profile",      x: 0, y: 0,  w: 6, h: 10 },
  { i: "individual",   x: 0, y: 10, w: 6, h: 6  },
  { i: "teams",        x: 0, y: 16, w: 6, h: 4  },
  { i: "competition",  x: 0, y: 20, w: 6, h: 4  },
  { i: "achievements", x: 0, y: 24, w: 6, h: 10 },
];

export const layouts: Layouts = { lg, md, sm, xs: sm, xxs: sm };


/** Breakpoints oförändrade (använd dina befintliga) */
export const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };

/** kolumnantal — lg = 20 */
export const cols = { lg: 20, md: 10, sm: 6, xs: 4, xxs: 2 };
