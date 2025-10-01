// src/services/users.ts
import type { User } from "../types/user";
import { getRankTier } from "./config/rank";

export async function getUsers(): Promise<User[]> {
  const res = await fetch("/api/v1/users");
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const data = await res.json();

  // Hämtar från types(user).ts för att sätta rank och rankTier osv direkt här
  return (data as any[]).map((u, index) => ({
    id: u.id,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    totalPoints: u.totalPoints,
    isAdmin: Boolean(u.isAdmin),
    rank: index + 1,               // sätt rank direkt från backend med index
    rankTier: getRankTier(u.totalPoints), //beräkna rankTier
  }));
}
