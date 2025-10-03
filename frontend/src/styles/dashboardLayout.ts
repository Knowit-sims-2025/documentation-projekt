
import type { Layout } from "react-grid-layout";

/**
 * Definierar startlayouten för dashboarden.
 * 'i' är en unik nyckel för varje kort.
 * x, y är startkoordinater i rutnätet.
 * w, h är bredd och höjd i antal rutor.
 */
export const initialLayout: Layout[] = [
  { i: "profile", x: 0, y: 0, w: 3, h: 4, static: false },
  { i: "individual", x: 3, y: 0, w: 6, h: 2 },
  { i: "teams", x: 3, y: 2, w: 3, h: 2 },
  { i: "competition", x: 6, y: 2, w: 3, h: 2 },
  { i: "achievements", x: 9, y: 0, w: 3, h: 4 },
];
