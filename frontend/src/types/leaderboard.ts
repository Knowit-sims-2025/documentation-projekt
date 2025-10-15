export interface LeaderboardEntry {
  userId: number;
  displayName: string;
  avatarUrl?: string | null;
  totalPoints: number; // poäng intjänade den aktuella dagen
}