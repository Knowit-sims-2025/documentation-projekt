import type { User } from "./user";

/**
 * Bas-typ för ett team
 */
export interface Team {
  id: number;
  name: string;
  createdAt: string;
  totalPoints: number;
  members: User[];
}

/**
 * Utökad typ som inkluderar ranking, beräknad på frontend.
 */
export interface RankedTeam extends Team {
  rank: number;
}

