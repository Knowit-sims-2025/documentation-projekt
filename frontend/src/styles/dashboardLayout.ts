// src/styles/dashboardLayouts.ts
import type { Layout } from "react-grid-layout";

// Desktop (≥1200px), 12 kolumner
const lg: Layout[] = [
  { i: "profile",      x: 0, y: 0,  w: 3, h: 8 },
  { i: "individual",   x: 3, y: 0,  w: 6, h: 4 },
  { i: "teams",        x: 3, y: 4,  w: 3, h: 4 },
  { i: "competition",  x: 6, y: 4,  w: 3, h: 4 },
  { i: "achievements", x: 9, y: 0,  w: 3, h: 8 },
];

// Tablet (≥996px), 10 kolumner – lite tajtare
const md: Layout[] = [
  { i: "profile",      x: 0, y: 0, w: 3, h: 7 },
  { i: "individual",   x: 3, y: 0, w: 5, h: 4 },
  { i: "teams",        x: 3, y: 4, w: 2, h: 3 },
  { i: "competition",  x: 5, y: 4, w: 3, h: 3 },
  { i: "achievements", x: 8, y: 0, w: 2, h: 7 },
];

// Mobil/padda stående (≤768px), 6 kolumner – staplat
const sm: Layout[] = [
  { i: "profile",      x: 0, y: 0,  w: 6, h: 6 },
  { i: "individual",   x: 0, y: 6,  w: 6, h: 4 },
  { i: "teams",        x: 0, y: 10, w: 6, h: 4 },
  { i: "competition",  x: 0, y: 14, w: 6, h: 4 },
  { i: "achievements", x: 0, y: 18, w: 6, h: 6 },
];

export const dashboardLayouts = {
  lg,
  md,
  sm,
  xs: sm,   // placeholder om vi vill ha mindre
  xxs: sm,  // placeholder om vi vill ha mindre
};
