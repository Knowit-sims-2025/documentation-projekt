import type { User } from "./user";

export interface Team {
  id: number;
  name: string;
  createdAt: string;
}

export interface TeamWithDetails extends Team {
  totalPoints: number;
  members: User[];
}
